import {
  action,
  DidReceiveSettingsEvent,
  PropertyInspectorDidAppearEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import Registry, { RegistryItem } from "winreg";
import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { Graph } from "./graphUtil";

const logger = streamDeck.logger.createScope("Custom Scope");

@action({ UUID: "com.5e.hwinfo-reader.sensor" })
export class Sensor extends SingletonAction<SensorSettings> {
  buttons: Buttons = {};
  globalSettingsPoller: NodeJS.Timeout | undefined = undefined;
  getGlobalSettingsCopy: { registry: RegistryItem[] } = { registry: [] };

  async onPropertyInspectorDidAppear(
    ev: PropertyInspectorDidAppearEvent<SensorSettings>
  ) {
    ev.action.sendToPropertyInspector({
      event: "registryKeys",
      payload: this.getGlobalSettingsCopy["registry"],
    });
  }

  onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<SensorSettings>
  ): void | Promise<void> {
    this.buttons[ev.action.id]["settings"] = { ...ev.payload.settings };
  }

  onWillDisappear(
    ev: WillDisappearEvent<SensorSettings>
  ): void | Promise<void> {
    //ensures a queue of actions doesn't build up else after you switch screens these will all be executed at once
    clearInterval(this.buttons[ev.action.id]["graphInterval"]);
    this.buttons[ev.action.id]["graphInterval"] = undefined;
  }

  async onWillAppear(ev: WillAppearEvent<SensorSettings>) {
    let globalSettingsPoller = async () => {
      let registryKeys: { registry: RegistryItem[] } =
        await streamDeck.settings.getGlobalSettings();
      this.getGlobalSettingsCopy = registryKeys;
    };

    if (this.globalSettingsPoller == undefined) {
      this.globalSettingsPoller = setInterval(async () => {
        globalSettingsPoller();
      }, 1000);
    }

    let createSensorPollInterval = async () => {
      let settings = this.buttons[ev.action.id]["settings"];
      if (settings["registryName"] == undefined) {
        return;
      }

      if (this.getGlobalSettingsCopy["registry"] == undefined) {
        return;
      }

      let found = false;

      for (
        let index = 0;
        index < this.getGlobalSettingsCopy["registry"].length;
        index++
      ) {
        const element: RegistryItem =
          this.getGlobalSettingsCopy["registry"][index];
        if (element["value"] == settings["registryName"]) {
          let sensorName = element["name"];
          //get last character which is the index number
          let index = sensorName.match(/\d+$/)?.[0];
          let registrySensorValueName = "Value" + index;
          let registrySensorRawValueName = "ValueRaw" + index;

          //e.g. 1,600.0 MHz or 16.5 °C
          let sensorValue = this.getGlobalSettingsCopy["registry"].find(
            (item) => item.name === registrySensorValueName
          )?.value;

          //e.g. 1600.0 or 16.5
          let rawSensorValue = this.getGlobalSettingsCopy["registry"].find(
            (item) => item.name === registrySensorRawValueName
          )?.value;

          if (sensorValue != undefined && rawSensorValue != undefined) {
            found = true;

            //remove everything after full stop, we don't want to display decimal places
            let formattedSensorValue = rawSensorValue.replace(/\..*/g, "");
            //get all characters after a space to get the unit e.g. MHz or °C
            let sensorValueUnit = sensorValue.replace(/.*\s/g, "");

            formattedSensorValue = formattedSensorValue + sensorValueUnit;
            //winreg returns a � instead of a °
            formattedSensorValue = formattedSensorValue.replace("�", "°");

            this.buttons[ev.action.id]["lastSensorValue"] =
              formattedSensorValue;
            this.buttons[ev.action.id]["graph"].addSensorValue(
              parseFloat(rawSensorValue),
              parseFloat(settings["graphMinValue"]),
              parseFloat(settings["graphMaxValue"])
            );
          }
        }
      }

      if (found == false) {
        //sensor was not found, must have been deleted from HWiNFO Gadgets
        this.buttons[ev.action.id]["lastSensorValue"] = undefined;
      }
    };

    let updateScreen = async () => {
      //   let settings = await ev.action.getSettings();
      let settings = this.buttons[ev.action.id]["settings"];
      ev.action.setImage(
        this.buttons[ev.action.id]["graph"].generateSvg(
          settings["graphColor"],
          settings["backgroundColor"],
          settings["title"],
          this.buttons[ev.action.id]["lastSensorValue"] ?? "ERROR",
          settings["titleFontSize"],
          settings["sensorFontSize"],
          settings["fontName"]
        )
      );
    };

    if (!this.buttons[ev.action.id]) {
      this.buttons[ev.action.id] = {
        graph: new Graph(),
        sensorPollInterval: setInterval(async () => {
          createSensorPollInterval();
        }, 1000),
        lastSensorValue: undefined,
        graphInterval: setInterval(async () => {
          updateScreen();
        }, 1000),
        settings: { ...ev.payload.settings },
      };
    } else {
      this.buttons[ev.action.id]["settings"] = { ...ev.payload.settings };
      if (this.buttons[ev.action.id]["graphInterval"] == undefined) {
        this.buttons[ev.action.id]["graphInterval"] = setInterval(async () => {
          updateScreen();
        }, 1000);
      }
    }

    updateScreen();
  }
}

type SensorSettings = {
  registryName: string;
  title: string;
  backgroundColor: string;
  graphColor: string;
  sensorFontSize: string;
  titleFontSize: string;
  fontName: string;
  graphMinValue: string;
  graphMaxValue: string;
};

type Button = {
  graph: Graph;
  sensorPollInterval: NodeJS.Timeout | undefined;
  lastSensorValue: string | undefined;
  graphInterval: NodeJS.Timeout | undefined;
  settings: SensorSettings;
};

type Buttons = { [key: string]: Button };
