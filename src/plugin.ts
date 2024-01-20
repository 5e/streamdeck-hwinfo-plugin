import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";
import Registry from "winreg";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());
const logger = streamDeck.logger.createScope("Plugin.Ts scope");

// Finally, connect to the Stream Deck.

let regKey = new Registry({
  // new operator is optional
  hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER
  key: "\\Software\\HWiNFO64\\VSB", // key containing autostart programs
});

//keep a local copy of the registry keys so the actions can access it
setInterval(async function () {
  let arrayOfKeys: Registry.RegistryItem[] = [];
  regKey.values(async function (err, items) {
    if (err) logger.error(err.toString());
    else {
      for (var i = 0; i < items.length; i++) {
        arrayOfKeys.push(items[i]);
      }
      await streamDeck.settings.setGlobalSettings({ registry: arrayOfKeys });
    }
  });
}, 2000);

streamDeck.connect();
