import { WillAppearEvent } from "@elgato/streamdeck";
import { Buttons, SensorSettings } from "../types/types";

export function updateScreen(
  ev: WillAppearEvent<SensorSettings>,
  buttons: Buttons
) {
  const settings = buttons[ev.action.id]["settings"];
  const sensorValue = getSensorValue(settings, buttons[ev.action.id]);

  if (settings["graphType"] == "Graph") {
    ev.action.setImage(
      buttons[ev.action.id]["graph"].generateSvg(
        settings["graphColor"],
        settings["backgroundColor"],
        settings["title"],
        sensorValue,
        settings["titleFontSize"],
        settings["sensorFontSize"],
        settings["fontName"],
        settings["titleColor"],
        settings["sensorColor"],
        settings["graphHighlightColor"],
        settings["sensorAlignment"],
        settings["titleAlignment"],
		settings["fontWeight"]
      )
    );
  } else {
    ev.action.setImage(
      buttons[ev.action.id]["graph"].generateArcSvg(
        settings["graphColor"],
        settings["backgroundColor"],
        settings["title"],
        sensorValue,
        settings["titleFontSize"],
        settings["sensorFontSize"],
        settings["fontName"],
        settings["titleColor"] ?? "#808080",
        settings["sensorColor"] ?? "#FFFFFF",
		settings["fontWeight"],
      )
    );
  }
}

function getSensorValue(settings: SensorSettings, button: any): string {
  if (settings["customSuffix"] == "" || settings["customSuffix"] == "<default>") {
    // If user hasn't put anything in the field, show default suffix
    // <default> is legacy compatibility
    return button["lastSensorValue"] ?? "ERROR";
  } else {
    // Check if customSuffix is only whitespace, if it is, don't add anything, user might want to remove the suffix.
    const sensorValueChecked = button["rawSensorValue"] ?? "ERROR";

    if (sensorValueChecked == "ERROR") {
      return "ERROR";
    } else {
      if (settings["customSuffix"].trim() == "") {
        return sensorValueChecked;
      } else {
        return sensorValueChecked + settings["customSuffix"];
      }
    }
  }
}