import { Graph } from "./graph";

export type SensorSettings = {
	registryName: string;
	title: string;
	backgroundColor: string;
	graphColor: string;
	sensorFontSize: string;
	titleFontSize: string;
	fontName: string;
	graphMinValue: string;
	graphMaxValue: string;
	graphType: string;
	customSuffix: string;
	numberOfDecimalPlaces: string;
	titleColor: string;
	sensorColor: string;
	graphHighlightColor: string;
  };
  
export type Button = {
	graph: Graph;
	lastSensorValue: string | undefined;
	rawSensorValue: string | undefined;
	graphInterval: NodeJS.Timeout | undefined;
	settings: SensorSettings;
  };
  
export type Buttons = { [key: string]: Button };

export type RegistryItem = {
	name: string;
	value: string;
};

export type RegistryItemArray = RegistryItem[];

export type GraphHistoryEntry = {
	y1: number;
	y2: number;
	gaugePixels: number;
};  