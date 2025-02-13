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
  import { SensorSettings, Buttons, RegistryData } from "../types/types";

  @action({ UUID: "com.5e.hwinfo-reader.sensor" })
  export class Sensor extends SingletonAction<SensorSettings> {
	buttons: Buttons = {};
	registryData: RegistryData = {
		poller: undefined,
		items: []
	};

	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, SensorSettings>) {
		const payload = ev.payload as { [key: string]: any };
		const event = payload?.event ?? 'defaultEvent';

		if (event === "populateSensorList") {
			await onSendToPlugin(this.registryData);
		}
	}

	override onWillDisappear(
		ev: WillDisappearEvent<SensorSettings>
	): void | Promise<void> {
		//ensures a queue of actions doesn't build up else after you switch screens these will all be executed at once
		clearInterval(this.buttons[ev.action.id]["graphInterval"]);
		this.buttons[ev.action.id]["graphInterval"] = undefined;
	}
  
	override onDidReceiveSettings(
	  ev: DidReceiveSettingsEvent<SensorSettings>
	): void | Promise<void> {
	  handleDidReceiveSettings(ev, this.buttons);
	}
  
	override async onWillAppear(ev: WillAppearEvent<SensorSettings>) {
		await handleWillAppear(ev, this.buttons, this.registryData);
	}
  }