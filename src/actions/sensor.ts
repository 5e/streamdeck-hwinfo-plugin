import {
  action,
  KeyDownEvent,
  PropertyInspectorDidAppearEvent,
  SingletonAction,
  TitleParametersDidChangeEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import Registry, { RegistryItem } from "winreg";
import streamDeck, { LogLevel } from "@elgato/streamdeck";
//@ts-ignore
import SvgBuilder from "svg-builder";
const logger = streamDeck.logger.createScope("Custom Scope");

class Graph {
  graphHistory: GraphHistoryEntry[] = [];

  addSensorValue(
    sensorValue: number,
    graphMinValue: number,
    graphMaxValue: number
  ) {
    if (this.graphHistory.length >= 73) {
      this.graphHistory.shift();
    }

    let yCoordinate =
      144 -
      ((sensorValue - graphMinValue) / (graphMaxValue - graphMinValue)) * 144;
    //add new entry
    this.graphHistory.push({
      y1: yCoordinate,
      y2: yCoordinate,
    });
  }

  generateSvg(
    graphColor: string,
    backgroundColor: string,
    title: string,
    sensorValue: string,
    titleFontSize: string,
    sensorFontSize: string,
    fontName: string
  ) {
    var svgImg = SvgBuilder.newInstance();
    svgImg.width(144).height(144);
    svgImg.rect({ height: "144", width: "144", fill: backgroundColor });

    for (let index = 0; index < this.graphHistory.length; index++) {
      const element: GraphHistoryEntry = this.graphHistory[index];
      //setting the points
      svgImg.line({
        x1: index * 2,
        y1: 144,
        x2: index * 2,
        y2: element.y2,
        stroke: graphColor,
        "stroke-width": 2,
      });
    }

    svgImg.text(
      {
        x: 72,
        y: 42,
        "font-family": fontName,
        "font-size": titleFontSize,
        stroke: "grey",
        fill: "grey",
        "text-anchor": "middle",
      },
      title
    );

    svgImg.text(
      {
        x: 72,
        y: 116,
        "font-family": fontName,
        "font-size": sensorFontSize,
        stroke: "white",
        fill: "white",
        "text-anchor": "middle",
      },
      sensorValue
    );

    let logo = svgImg.render();
    let base64encoded = Buffer.from(logo).toString("base64");
    let svgImage = `data:image/svg+xml;base64,${base64encoded}`;
    return svgImage;
  }
}

@action({ UUID: "com.5e.hwinfo-reader.sensor" })
export class Sensor extends SingletonAction<SensorSettings> {
  intervals: any = {};

  async onPropertyInspectorDidAppear(
    ev: PropertyInspectorDidAppearEvent<SensorSettings>
  ) {
    let registryKeys: { registry: RegistryItem[] } =
      await streamDeck.settings.getGlobalSettings();
    await ev.action.sendToPropertyInspector({
      event: "registryKeys",
      payload: registryKeys["registry"],
    });
  }

  onWillDisappear(
    ev: WillDisappearEvent<SensorSettings>
  ): void | Promise<void> {
    //ensures a queue of actions doesn't build up else after you switch screens these will all be executed at once
    clearInterval(this.intervals[ev.action.id]["graphInterval"]);
    delete this.intervals[ev.action.id]["graphInterval"];
  }

  async onWillAppear(ev: WillAppearEvent<SensorSettings>) {
    if (!this.intervals[ev.action.id]) {
      this.intervals[ev.action.id] = {};
      this.intervals[ev.action.id]["graph"] = new Graph();
    }

    //ensures you don't have multiple intervals running for the same action
    if (this.intervals[ev.action.id]["sensorPollInterval"] == undefined) {
      this.intervals[ev.action.id]["sensorPollInterval"] = setInterval(
        async () => {
          let registryKeys: { registry: RegistryItem[] } =
            await streamDeck.settings.getGlobalSettings();

          if (registryKeys["registry"] == undefined) {
            return;
          }

          let settings = await ev.action.getSettings();
          if (settings["registryName"] == undefined) {
            return;
          }

          let found = false;

          for (
            let index = 0;
            index < registryKeys["registry"].length;
            index++
          ) {
            const element: RegistryItem = registryKeys["registry"][index];
            if (element["value"] == settings["registryName"]) {
              let sensorName = element["name"];
              //get last character which is the index number
              let index = sensorName.match(/\d+$/)?.[0];
              let registrySensorValueName = "Value" + index;
              //find sensorValueName is registryKeys
              let sensorValue = registryKeys["registry"].find(
                (item) => item.name === registrySensorValueName
              )?.value;

              if (sensorValue != undefined) {
                found = true;
                //replace everything after a "." until a space
                sensorValue = sensorValue.replace(/\..*?\s/g, "");
                // //winreg returns a � instead of a °
                sensorValue = sensorValue.replace("�", "°");

                this.intervals[ev.action.id]["lastSensorValue"] = sensorValue;

                this.intervals[ev.action.id]["graph"].addSensorValue(
                  parseFloat(sensorValue),
                  parseFloat(settings["graphMinValue"]),
                  parseFloat(settings["graphMaxValue"])
                );
              }
            }
          }

          if (found == false) {
            //sensor was not found, must have been deleted from HWiNFO Gadgets
            this.intervals[ev.action.id]["lastSensorValue"] = undefined;
          }
        },
        1000
      );
    }

    let updateScreen = async () => {
      let settings = await ev.action.getSettings();
      if (this.intervals[ev.action.id]["lastSensorValue"] != undefined) {
        ev.action.setImage(
          this.intervals[ev.action.id]["graph"].generateSvg(
            settings["graphColor"],
            settings["backgroundColor"],
            settings["title"],
            this.intervals[ev.action.id]["lastSensorValue"],
            settings["titleFontSize"],
            settings["sensorFontSize"],
            settings["fontName"]
          )
        );
      } else {
        ev.action.setImage(
          this.intervals[ev.action.id]["graph"].generateSvg(
            settings["graphColor"],
            settings["backgroundColor"],
            settings["title"],
            "ERROR",
            settings["titleFontSize"],
            settings["sensorFontSize"],
            settings["fontName"]
          )
        );
      }
    };

    updateScreen();

    this.intervals[ev.action.id]["graphInterval"] = setInterval(async () => {
      updateScreen();
    }, 1000);
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

type GraphHistoryEntry = {
  y1: number;
  y2: number;
};
