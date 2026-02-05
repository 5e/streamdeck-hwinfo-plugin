import streamDeck from "@elgato/streamdeck";

import { Sensor } from "./actions/sensor";


streamDeck.logger.setLevel("debug");

streamDeck.actions.registerAction(new Sensor());

streamDeck.connect();