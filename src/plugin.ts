import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { Sensor } from "./actions/sensor";


streamDeck.logger.setLevel(LogLevel.DEBUG);

streamDeck.actions.registerAction(new Sensor());

streamDeck.connect();