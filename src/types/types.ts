import { Graph } from "./graph";

export type SensorSettings = {
	registryName: string;
	title: string;
	backgroundColor: string;
	graphColor: string;
	sensorFontSize: string;
	titleFontSize: string;
	fontName: string;
	fontWeight: string;
	graphMinValue: string;
	graphMaxValue: string;
	graphType: string;
	customSuffix: string;
	numberOfDecimalPlaces: string;
	titleColor: string;
	sensorColor: string;
	graphHighlightColor: string;
	sensorAlignment: string;
	titleAlignment: string;
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

export type RegistryData = {
	items: RegistryItem[];
	poller: NodeJS.Timeout | undefined;
}

export type GraphHistoryEntry = {
	y: number;
	gaugePixels: number;
};  