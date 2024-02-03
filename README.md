# HWiNFO Reader

<a href="https://marketplace.elgato.com/product/hwinfo-reader-ea8cc86d-1a3b-45de-893d-592d174089c9">
    <img src="https://elgato-download-count.5egt.workers.dev/?">
</a>

Alternative to the [hwinfo-streamdeck](https://github.com/shayne/hwinfo-streamdeck) plugin, without needing to use the time limited 'Shared Memory Support' feature. This plugin takes advantage of the new 'HWiNFO Gadgets' feature and is tiny in size. It is built using the new [Elgato Beta SDK](https://github.com/elgatosf/streamdeck).

![Photo of plugin](https://i.imgur.com/WIhrBl2.png)

## Download

You can download and install the plugin from the [Releases](https://github.com/5e/streamdeck-hwinfo-plugin/releases) page (the .sdPlugin file), or download the plugin from the [Elgato marketplace](https://marketplace.elgato.com/product/hwinfo-reader-ea8cc86d-1a3b-45de-893d-592d174089c9).

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

- Enabling HWiNFO gadget on two sensors with the exact same name (very unlikely scenario) may cause issues of the Stream Deck plugin showing the wrong value. A temporary fix to this is to rename the sensor name in HWiNFO (right click on sensor and press rename) and then re-select the correct sensor in the settings of the plugin.
