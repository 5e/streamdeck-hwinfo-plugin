import { streamDeck } from "@elgato/streamdeck";
import { RegistryData, Buttons } from "../types/types";
import { populateSensorData } from "./populateSensorData";
import Registry, { RegistryItem } from "winreg";

export function populateRegistryData(registryData: RegistryData, buttons: Buttons) {
  let regKey = new Registry({
    hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER
    key: "\\Software\\HWiNFO64\\VSB",
  });
  
  //keep a local copy of the registry keys so the action can access it
  let arrayOfKeys: RegistryItem[] = [];
  regKey.values(function (err, items) {
    if (err) {
      streamDeck.logger.error(err.toString());
    } else {
      for (var i = 0; i < items.length; i++) {
        arrayOfKeys.push(items[i]);
      }
    }

    Object.assign(registryData.items, arrayOfKeys);
  });  

  //populate the sensor data
  populateSensorData(buttons, registryData);
}