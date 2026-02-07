import streamDeck, {
  DidReceiveSettingsEvent,
  WillDisappearEvent,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { SensorSettings, Buttons, RegistryData } from "../types/types";
import { Graph } from "../types/graph";
import { populateRegistryData } from "./populateRegistryData";
import { updateScreen } from "./updateScreen";
import { getFonts2, IFontInfo } from 'font-list';

export async function onPopulateSensorList(
  registryData: RegistryData
) {
  //Filter global settings by only returning items where the name field has "Label" in it 
  let filteredRegistry = registryData.items.filter(
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

  await streamDeck.ui.sendToPropertyInspector({
    event: "populateSensorList",
    items: filteredRegistry
  });
}

export async function onPopulateFontList() {
	// Read system fonts and pass them to the property inspector
	let fonts: IFontInfo[] = await getFonts2({disableQuoting: true});

	// The SVG version used by stream deck has issues with font families with specific weights. 
	// e.g. Franklin Gothic Medium does not work, we have to set it to Frankilin Gothic with weight seperately

	let fontFamilies = fonts.map(font => font.familyName);
	
	// Remove duplicates
	fontFamilies = Array.from(new Set(fontFamilies));

	// Sort alphabetically
	fontFamilies.sort((a, b) => a.localeCompare(b));

	await streamDeck.ui.sendToPropertyInspector({
		event: "populateFontList",
		items: fontFamilies.map(font => ({ label: font, value: font }))
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
  registryData: RegistryData
) {
  if (registryData.poller == undefined) {
    registryData.poller = setInterval(() => {
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
    if (buttons[ev.action.id]["graphInterval"] == undefined) {
      buttons[ev.action.id]["graphInterval"] = setInterval(async () => {
        updateScreen(ev, buttons);
      }, 1000);
    }
  }

  updateScreen(ev, buttons);
}

export function mapSettings(settings: SensorSettings) {
  return {
    registryName: defaultIfEmpty(settings.registryName, ""),
    title: defaultIfEmpty(settings.title, ""),
    backgroundColor: defaultIfEmpty(settings.backgroundColor, "#000000"),
    graphColor: defaultIfEmpty(settings.graphColor, "#103B00"),
    sensorFontSize: defaultIfEmpty(settings.sensorFontSize, "38"),
    titleFontSize: defaultIfEmpty(settings.titleFontSize, "26"),
    fontName: defaultIfEmpty(settings.fontName, "Franklin Gothic"),
	fontWeight: defaultIfEmpty(settings.fontWeight, "400"),
    graphMinValue: defaultIfEmpty(settings.graphMinValue, "0"),
    graphMaxValue: defaultIfEmpty(settings.graphMaxValue, "100"),
    graphType: defaultIfEmpty(settings.graphType, "Graph"),
    customSuffix: defaultIfEmpty(settings.customSuffix, ""),
    numberOfDecimalPlaces: defaultIfEmpty(settings.numberOfDecimalPlaces, "0"),
    titleColor: defaultIfEmpty(settings.titleColor, "#808080"),
    titleOutlineColor: defaultIfEmpty(settings.titleOutlineColor, "#808080"),
    sensorColor: defaultIfEmpty(settings.sensorColor, "#FFFFFF"),
	sensorOutlineColor: defaultIfEmpty(settings.sensorOutlineColor, "#FFFFFF"),
    graphHighlightColor: defaultIfEmpty(settings.graphHighlightColor, "#1a6200"),
    sensorAlignment: defaultIfEmpty(settings.sensorAlignment, "135"),
    titleAlignment: defaultIfEmpty(settings.titleAlignment, "26"),
	sensorOutlineWidth: defaultIfEmpty(settings.sensorOutlineWidth, "0"),
	titleOutlineWidth: defaultIfEmpty(settings.titleOutlineWidth, "0"),
  };
};

function defaultIfEmpty(value: string | undefined, defaultValue: string) {
  return value === undefined || value === "" ? defaultValue : value;
}