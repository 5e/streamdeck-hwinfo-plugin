import {
  action,
  KeyDownEvent,
  PropertyInspectorDidAppearEvent,
  SingletonAction,
  TitleParametersDidChangeEvent,
  WillAppearEvent,
} from "@elgato/streamdeck";
import Registry, { RegistryItem } from "winreg";
import streamDeck, { LogLevel } from "@elgato/streamdeck";
//@ts-ignore
import * as SvgBuilder from "svg-builder";
const logger = streamDeck.logger.createScope("Custom Scope");

class Graph {
  graphHistory: GraphHistoryEntry[] = [];

  generateSvg(sensorValue: number) {
    //if graphistory has 72 entries, remove the first one and push the new one
    //we treat the 72 entries in the array as 72 pixels in the Y axis
    //if graph refreshes every 2 seconds, we have 144 seconds of history

    if (this.graphHistory.length >= 72) {
      this.graphHistory.shift();
    }

    //if sensor value is at 100, it should correlate to the Y coordinate being 72, so we need to calculate the Y coordinate
    let yCoordinate = 72 - (sensorValue / 100) * 72;

    //change the last entry to the new Y coordinate to match the line so it doesn't skip up or down
    if (this.graphHistory[this.graphHistory.length - 1] != undefined) {
      this.graphHistory[this.graphHistory.length - 1].y2 = yCoordinate;
    }

    //add new entry
    this.graphHistory.push({
      y1: yCoordinate,
      y2: yCoordinate,
    });

    var svgImg = SvgBuilder.newInstance();
    svgImg.width(72).height(72);

    for (let index = 0; index < this.graphHistory.length; index++) {
      const element: GraphHistoryEntry = this.graphHistory[index];
      //setting the points
      svgImg.line({
        x1: index,
        y1: element.y1,
        x2: index + 1,
        y2: element.y2,
        stroke: "#FF0000",
        "stroke-width": 1,
      });

      //filling color under the lines
      svgImg.line({
        x1: index,
        y1: 72,
        x2: index,
        y2: element.y1,
        stroke: "#FF0000",
        "stroke-width": 1,
      });

      svgImg.line({
        x1: index + 1,
        y1: 72,
        x2: index + 1,
        y2: element.y2,
        stroke: "#FF0000",
        "stroke-width": 1,
      });
    }

    var logo = svgImg.render();
    let svgImage = `data:image/svg, ${logo}`;
    return svgImage;
  }
}

@action({ UUID: "com.5e.hwinfo-reader.increment" })
export class IncrementCounter extends SingletonAction<CounterSettings> {
  /**
   * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it become visible. This could be due to the Stream Deck first
   * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
   * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
   */

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

  onWillAppear(ev: WillAppearEvent<CounterSettings>): void | Promise<void> {
    let okay = new Graph();
    setInterval(async function () {
      let registryKeys: { registry: RegistryItem[] } =
        await streamDeck.settings.getGlobalSettings();
      let settings = await ev.action.getSettings();
      //logger.info(JSON.stringify(settings, null, 2));
      if (settings["registryName"] == undefined) {
        return;
      }
      let registryName = settings["registryName"];
      //split at space and add celcius sign

      for (let index = 0; index < registryKeys["registry"].length; index++) {
        const element: RegistryItem = registryKeys["registry"][index];
        if (element["value"] == registryName) {
          let sensorName = element["name"];
          //get last character which is the index number
          let index = sensorName[sensorName.length - 1];
          let sensorValueName = "Value" + index;
          //find sensorValueName is registryKeys
          let sensorValue = registryKeys["registry"].find(
            (item) => item.name === sensorValueName
          );

          let sensorValueValue = sensorValue?.value;

          if (sensorValueValue == undefined) {
            await ev.action.setTitle("ERROR");
          } else {
            sensorValueValue = sensorValueValue.replace(/\s/g, "");
            //winreg returns a � instead of a °
            if (sensorValueValue.includes("�")) {
              sensorValueValue = sensorValueValue.replace("�", "°");
            }

            let svgImage = okay.generateSvg(parseFloat(sensorValueValue));
            await ev.action.setImage(svgImage);
            await ev.action.setTitle(
              `${settings["title"]}\n` + sensorValueValue
            );
          }
        }
      }
    }, 2000);
  }

  /**
   * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
   * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
   * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
   * settings using `setSettings` and `getSettings`.
   */
  async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
    // Determine the current count from the settings.
    // let count = ev.payload.settings.count ?? 0;
    // count++;

    logger.info(JSON.stringify(await ev.action.getSettings(), null, 2));

    // // Update the current count in the action's settings, and change the title.
    // await ev.action.setSettings({ count });
    // await ev.action.setTitle(`${count}`);
  }
}

type CounterSettings = {
  registryName: string;
  title: string;
};

type GraphHistoryEntry = {
  y1: number;
  y2: number;
};
