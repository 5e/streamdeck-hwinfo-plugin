import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { Sensor } from "./actions/sensor";
import Registry from "winreg";

//streamDeck.logger.setLevel(LogLevel.TRACE);

streamDeck.actions.registerAction(new Sensor());
const logger = streamDeck.logger.createScope("Plugin.Ts scope");

let regKey = new Registry({
  hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER
  key: "\\Software\\HWiNFO64\\VSB",
});

//keep a local copy of the registry keys so the action can access it
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
