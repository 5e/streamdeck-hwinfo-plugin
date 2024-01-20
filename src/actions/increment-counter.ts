import {
  action,
  KeyDownEvent,
  PropertyInspectorDidAppearEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import Registry from "winreg";
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

  onPropertyInspectorDidAppear(
    ev: PropertyInspectorDidAppearEvent<CounterSettings>
  ): void | Promise<void> {
    let regKey = new Registry({
      // new operator is optional
      hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER
      key: "\\Software\\HWiNFO64\\VSB", // key containing autostart programs
    });
    let arrayOfKeys: Registry.RegistryItem[] = [];
    regKey.values(async function (err, items /* array of RegistryItem */) {
      if (err) console.log("ERROR: " + err);
      else {
        for (var i = 0; i < items.length; i++) {
          arrayOfKeys.push(items[i]);
        }
        await ev.action.sendToPropertyInspector({
          event: "registryKeys",
          payload: arrayOfKeys,
        });
      }
    });
  }

  onWillAppear(ev: WillAppearEvent<CounterSettings>): void | Promise<void> {
    //return ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
    let regKey = new Registry({
      // new operator is optional
      hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER
      key: "\\Software\\HWiNFO64\\VSB", // key containing autostart programs
    });
    //get key

    setInterval(async function () {
      let key = await ev.action.getSettings();
      logger.info(JSON.stringify(key, null, 2));
      let registryName = key["index"].toString();
      //split at space and add celcius sign
      regKey.get(registryName, async function (err, item) {
        if (err) {
          logger.error(err.toString());
        } else {
          //split at space and add celcius sign
          let value = item.value;
          await ev.action.setTitle(value);
        }
      });
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
  index: number;
};
