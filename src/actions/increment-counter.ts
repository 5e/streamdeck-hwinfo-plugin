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

const logger = streamDeck.logger.createScope("Custom Scope");
/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
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
    //return ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
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

/**
 * Settings for {@link IncrementCounter}.
 */
type CounterSettings = {
  registryName: string;
  title: string;
};
