import streamDeck, {
  DidReceiveSettingsEvent,
  WillDisappearEvent,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { SensorSettings, Buttons, RegistryItemArray } from "../types/types";
import { Graph } from "../types/graph";
import { populateRegistryData } from "./populateRegistryData";
import { updateScreen } from "./updateScreen";

export async function onSendToPlugin(
  registryData: RegistryItemArray
) {
  //Filter global settings by only returning items where the name field has "Label" in it 
  let filteredRegistry = registryData.filter(
      (item) => item.name.includes("Label")
    ).map((item) => {
      return {
        label: item.value,
        value: item.value,
      };
  });

  //If the register is empty, return "You have not enabled sensors in HWiNFO Gadget, press help for setup instructions."
  if (filteredRegistry.length == 0) {
    filteredRegistry.push({
      label: "You have not enabled sensors in HWiNFO Gadget, press help for setup instructions.",
      value: "You have not enabled sensors in HWiNFO Gadget, press help for setup instructions.",
    });
  }

  await streamDeck.ui.current?.sendToPropertyInspector({
    event: "populateSensorList",
    items: filteredRegistry
  });
}

export function handleDidReceiveSettings(
  ev: DidReceiveSettingsEvent<SensorSettings>,
  buttons: Buttons
) {
  buttons[ev.action.id]["settings"] = mapSettings(ev.payload.settings);
}

export async function handleWillAppear(
  ev: WillAppearEvent<SensorSettings>,
  buttons: Buttons,
  registryData: RegistryItemArray,
  registryPoller: NodeJS.Timeout | undefined
) {
  if (registryPoller == undefined) {
    registryPoller = setInterval(() => {
      populateRegistryData(registryData, buttons);
    }, 1000);
  }

  if (!buttons[ev.action.id]) {
    buttons[ev.action.id] = {
      graph: new Graph(),
      lastSensorValue: undefined,
      rawSensorValue: undefined,
      graphInterval: setInterval(() => {
        updateScreen(ev, buttons);
      }, 1000),
      settings: mapSettings(ev.payload.settings),
    };
  } else {
    buttons[ev.action.id]["settings"] = mapSettings(ev.payload.settings);
  }

  updateScreen(ev, buttons);
}

export function mapSettings(settings: SensorSettings) {
  // Here we set the default values for the settings
  // We can no longer set the default values through the UI as sdpi-components doesn't support it
  return {
    registryName: defaultIfEmpty(settings.registryName, ""),
    title: defaultIfEmpty(settings.title, ""),
    backgroundColor: defaultIfEmpty(settings.backgroundColor, "#000000"),
    graphColor: defaultIfEmpty(settings.graphColor, "#103B00"),
    sensorFontSize: defaultIfEmpty(settings.sensorFontSize, "38"),
    titleFontSize: defaultIfEmpty(settings.titleFontSize, "26"),
    fontName: defaultIfEmpty(settings.fontName, "Franklin Gothic Medium"),
    graphMinValue: defaultIfEmpty(settings.graphMinValue, "0"),
    graphMaxValue: defaultIfEmpty(settings.graphMaxValue, "100"),
    graphType: defaultIfEmpty(settings.graphType, "Graph"),
    customSuffix: defaultIfEmpty(settings.customSuffix, ""),
    numberOfDecimalPlaces: defaultIfEmpty(settings.numberOfDecimalPlaces, "0"),
    titleColor: defaultIfEmpty(settings.titleColor, "#808080"),
    sensorColor: defaultIfEmpty(settings.sensorColor, "#FFFFFF"),
    graphHighlightColor: defaultIfEmpty(settings.graphHighlightColor, "#1a6200"),
  };
};

function defaultIfEmpty(value: string | undefined, defaultValue: string) {
  return value === undefined || value === "" ? defaultValue : value;
}