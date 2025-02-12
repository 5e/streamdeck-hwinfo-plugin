import { streamDeck } from "@elgato/streamdeck";
import { RegistryItemArray, Buttons } from "../types/types";
import { populateSensorData } from "./populateSensorData";
import Registry from "winreg";

export function populateRegistryData(registryData: RegistryItemArray, buttons: Buttons) {
  let regKey = new Registry({
    hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER
    key: "\\Software\\HWiNFO64\\VSB",
  });
  
  //keep a local copy of the registry keys so the action can access it
  let arrayOfKeys: RegistryItemArray = [];
  regKey.values(function (err, items) {
    if (err) {
      streamDeck.logger.error(err.toString());
    } else {
      for (var i = 0; i < items.length; i++) {
        arrayOfKeys.push(items[i]);
      }
    }

    Object.assign(registryData, arrayOfKeys);
  });  

  //populate the sensor data
  populateSensorData(buttons, registryData);
}