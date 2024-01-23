# streamdeck-hwinfo-plugin

Alternative to the [hwinfo-streamdeck](https://github.com/shayne/hwinfo-streamdeck) plugin, without needing to use the time limited 'Shared Memory Support' feature. This plugin takes advantage of the new 'HWiNFO Gadgets' feature and is small in size (just 283KB 🌟). It is built using the new [Elgato Beta SDK](https://github.com/elgatosf/streamdeck).

![Photo of plugin](https://i.imgur.com/WIhrBl2.png)

## Download

You can download the plugin and install the plugin from the 'Release' folder, or download the plugin from the Elgato marketplace.

## Instructions for HWiNFO

![HWiNFO settings](https://i.imgur.com/R3sWtKd.png)

- Open HWiNFO in Sensor Only mode then go into the settings
- Use these recommended settings

![Recommended settings](https://i.imgur.com/26AaLVl.png)

- Start HWiNFO
- On the sensors screen open the settings and choose the HWiNFO Gadget tab
- Enable "enable reporting to Gadget"
- Choose what sensors you would like to monitor by pressing "Report value in Gadget"

![HWiNFO Gadget](https://i.imgur.com/2zBMrJX.png)

- Then the sensors you have enabled will show up in the stream deck plugin

## Maybe for the future?

- Change font colour
- Change font outline colour
- Change graph style e.g. choose outline and fill colour
- Font weight
- Choose where the title and sensor text should appear
- ~~Change Y scale of the graph, so it's not always 0 to 100 as some sensor values may be over 100 such as wattage.~~ Done
- Change speed of polling
- Change graph timescale

## Current known issues

- Enabling HWiNFO gadget on two sensors with the exact same name (very unlikely scenario) may cause issues of the Stream Deck plugin showing the wrong value.
