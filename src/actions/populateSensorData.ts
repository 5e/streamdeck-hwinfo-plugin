import streamDeck, { WillAppearEvent } from "@elgato/streamdeck";
import { Buttons, RegistryItemArray, SensorSettings } from "../types/types";

export async function populateSensorData(
  buttons: Buttons,
  registryData: RegistryItemArray
) {
  for (const buttonId in buttons) {
    const settings = buttons[buttonId]["settings"];
    if (!settings["registryName"] || !registryData) {
      continue;
    }

    const registryName = settings["registryName"];
    const numberOfDecimalPlaces = parseFloat(settings["numberOfDecimalPlaces"]) || 0;
    const graphMinValue = parseFloat(settings["graphMinValue"]);
    const graphMaxValue = parseFloat(settings["graphMaxValue"]);

    let found = false;

    for (const element of registryData) {
      if (element["value"] !== registryName) continue;

      const sensorName = element["name"];
      const index = sensorName.match(/\d+$/)?.[0];
      if (!index) continue;

      const registrySensorValueName = `Value${index}`;
      const registrySensorRawValueName = `ValueRaw${index}`;

      const sensorValue = registryData.find(item => item.name === registrySensorValueName)?.value;
      const rawSensorValue = registryData.find(item => item.name === registrySensorRawValueName)?.value;

      if (sensorValue === undefined || rawSensorValue === undefined) continue;

      found = true;

      const formattedRawSensorValue = formatRawSensorValue(rawSensorValue, numberOfDecimalPlaces);
      const sensorValueUnit = extractSensorValueUnit(sensorValue);
      const formattedSensorValue = `${formattedRawSensorValue}${sensorValueUnit}`.replace("�", "°");

      const booleanRawSensorValue = convertLocalisedStringToBool(rawSensorValue);
      const normalizedRawSensorValue = booleanRawSensorValue === false ? "0" : booleanRawSensorValue === true ? "100" : rawSensorValue;

      buttons[buttonId]["lastSensorValue"] = formattedSensorValue;
      buttons[buttonId]["rawSensorValue"] = formattedRawSensorValue;
      buttons[buttonId]["graph"].addSensorValue(
        parseFloat(normalizedRawSensorValue),
        graphMinValue,
        graphMaxValue
      );
      
      //We have the data, break out of it
      break;
    }

    if (!found) {
      buttons[buttonId]["lastSensorValue"] = undefined;
    }
  }
}

function formatRawSensorValue(rawSensorValue: string, numberOfDecimalPlaces: number): string {
  const parts = rawSensorValue.split(/[\.,]/);
  if (numberOfDecimalPlaces === 0 || parts.length === 1) {
    return parts[0];
  }
  const decimalPart = (parts[1] || "").substring(0, numberOfDecimalPlaces);
  return `${parts[0]}.${decimalPart}`;
}

function extractSensorValueUnit(sensorValue: string): string {
  return sensorValue.includes(" ") ? sensorValue.replace(/.*\s/g, "") : "";
}

function convertLocalisedStringToBool(value: string) {
  const localizedBooleanMap = {
    yes: new Set([
      "yes", "oui", "ja", "sí", "sim", "是", "對", "はい", "예", "có", "نعم", "да", "так", "ano", "áno",
      "igen", "tak", "ja", "kyllä", "ναι", "evet"
    ]),
    no: new Set([
      "no", "non", "nein", "não", "否", "不", "いいえ", "아니요", "không", "لا", "нет", "ні", "ne", "nie",
      "nem", "nej", "ei", "nei", "όχι", "hayır"
    ])
  };

  if (!value) return null;
  const normalizedValue = value.trim().toLowerCase();

  if (localizedBooleanMap.yes.has(normalizedValue)) return true;
  if (localizedBooleanMap.no.has(normalizedValue)) return false;

  return null;
}