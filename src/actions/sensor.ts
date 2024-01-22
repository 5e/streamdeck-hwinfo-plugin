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

  addSensorValue(sensorValue: number) {
    //if graphistory has 72 entries, remove the first one and push the new one
    //we treat the 72 entries in the array as 72 pixels in the Y axis
    //if graph refreshes every 2 seconds, we have 144 seconds of history

    if (this.graphHistory.length >= 72) {
      this.graphHistory.shift();
    }

    //if sensor value is at 100, it should correlate to the Y coordinate being 72, so we need to calculate the Y coordinate
    let yCoordinate = 144 - (sensorValue / 100) * 144;

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

    var logo = svgImg.render();
    let svgImage = `data:image/svg, ${logo}`;
    return svgImage;
  }
}

@action({ UUID: "com.5e.hwinfo-reader.sensor" })
export class Sensor extends SingletonAction<CounterSettings> {
  intervals: any = {};

  async onPropertyInspectorDidAppear(
    ev: PropertyInspectorDidAppearEvent<CounterSettings>
  ) {
    let registryKeys: { registry: RegistryItem[] } =
      await streamDeck.settings.getGlobalSettings();
    await ev.action.sendToPropertyInspector({
      event: "registryKeys",
      payload: registryKeys["registry"],
    });
  }

  onWillDisappear(
    ev: WillDisappearEvent<CounterSettings>
  ): void | Promise<void> {
    //ensures a queue of actions doesn't build up else after you switch screens these will all be executed at once
    clearInterval(this.intervals[ev.action.id]["graphInterval"]);
    delete this.intervals[ev.action.id]["graphInterval"];
  }

  async onWillAppear(ev: WillAppearEvent<CounterSettings>) {
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
          let settings = await ev.action.getSettings();
          if (settings["registryName"] == undefined) {
            return;
          }

          for (
            let index = 0;
            index < registryKeys["registry"].length;
            index++
          ) {
            const element: RegistryItem = registryKeys["registry"][index];
            if (element["value"] == settings["registryName"]) {
              let sensorName = element["name"];
              //get last character which is the index number
              let index = sensorName[sensorName.length - 1];
              let registrySensorValueName = "Value" + index;
              //find sensorValueName is registryKeys
              let sensorValue = registryKeys["registry"].find(
                (item) => item.name === registrySensorValueName
              )?.value;

              this.intervals[ev.action.id]["lastSensorValue"] = sensorValue;
              if (sensorValue != undefined) {
                //replace everything after a "." until a space
                sensorValue = sensorValue.replace(/\..*?\s/g, "");
                //winreg returns a � instead of a °
                if (sensorValue.includes("�")) {
                  sensorValue = sensorValue.replace("�", "°");
                }

                this.intervals[ev.action.id]["lastSensorValue"] = sensorValue;

                this.intervals[ev.action.id]["graph"].addSensorValue(
                  parseFloat(sensorValue)
                );
              }
            }
          }
        },
        200
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
      }
    };

    updateScreen();

    this.intervals[ev.action.id]["graphInterval"] = setInterval(async () => {
      updateScreen();
    }, 200);
  }
}

type CounterSettings = {
  registryName: string;
  title: string;
  backgroundColor: string;
  graphColor: string;
  sensorFontSize: string;
  titleFontSize: string;
  fontName: string;
};

type GraphHistoryEntry = {
  y1: number;
  y2: number;
};
