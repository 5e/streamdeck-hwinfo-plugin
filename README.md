# HWiNFO Reader

<a href="https://marketplace.elgato.com/product/hwinfo-reader-ea8cc86d-1a3b-45de-893d-592d174089c9">
    <img src="https://elgato-download-count.5egt.workers.dev/?">
</a>

Alternative to the [hwinfo-streamdeck](https://github.com/shayne/hwinfo-streamdeck) plugin, without needing to use the time limited 'Shared Memory Support' feature. This plugin takes advantage of the new 'HWiNFO Gadgets' feature and is tiny in size. It is built using the new [Elgato Beta SDK](https://github.com/elgatosf/streamdeck).

![image](https://github.com/5e/streamdeck-hwinfo-plugin/assets/107583272/0f73a176-7aca-4bed-81e8-870f82045987)

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

(Hint: Two sensors with the same name? [Make sure to rename one of them to avoid conflicts](https://github.com/5e/streamdeck-hwinfo-plugin#known-issue))

![HWiNFO Gadget](https://i.imgur.com/2zBMrJX.png)

- Then the sensors you have enabled will show up in the stream deck plugin

![Quick guide on how to change values from e.g. MB to GB](https://github.com/5e/streamdeck-hwinfo-plugin/issues/25#issuecomment-2184139637)

## Known issue

- Enabling HWiNFO gadget on two sensors with the exact same name may cause issues of the Stream Deck plugin showing the wrong value. A fix for this is to rename the sensor name in HWiNFO (right click on sensor and press rename) and then re-select the correct sensor in the settings of the plugin.
