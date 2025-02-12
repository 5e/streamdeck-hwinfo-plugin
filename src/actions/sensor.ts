import {
	action,
	streamDeck,
	DidReceiveSettingsEvent,
	JsonValue,
	PropertyInspectorDidAppearEvent,
	SendToPluginEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
  } from "@elgato/streamdeck";
  import { onSendToPlugin, handleDidReceiveSettings, handleWillAppear } from "./sensorEvents";
  import { SensorSettings, Buttons, RegistryItemArray } from "../types/types";

  @action({ UUID: "com.5e.hwinfo-reader.sensor" })
  export class Sensor extends SingletonAction<SensorSettings> {
	buttons: Buttons = {};
	registryPoller: NodeJS.Timeout | undefined = undefined;
	registryData: RegistryItemArray = [];

	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, SensorSettings>) {
		const payload = ev.payload as { [key: string]: any };
		const event = payload?.event ?? 'defaultEvent';

		if (event === "populateSensorList") {
			await onSendToPlugin(this.registryData);
		}
	}
  
	override onDidReceiveSettings(
	  ev: DidReceiveSettingsEvent<SensorSettings>
	): void | Promise<void> {
	  handleDidReceiveSettings(ev, this.buttons);
	}
  
	override async onWillAppear(ev: WillAppearEvent<SensorSettings>) {
		await handleWillAppear(ev, this.buttons, this.registryData, this.registryPoller);
	}
  }