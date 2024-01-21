/// <reference path="../libs/js/property-inspector.js" />
/// <reference path="../libs/js/utils.js" />

let localSettings = null;

$PI.onConnected((jsn) => {
	const form = document.querySelector('#property-inspector');
	const { actionInfo, appInfo, connection, messageType, port, uuid } = jsn;
	const { payload, context } = actionInfo;
	const { settings } = payload;
	localSettings = settings;

	Utils.setFormValue(settings, form);
	form.addEventListener(
		'input',
		Utils.debounce(150, () => {
			const value = Utils.getFormValue(form);
			$PI.setSettings(value);
			localSettings = value;
		})
	);
});

$PI.onSendToPropertyInspector("com.5e.hwinfo-reader.increment", function (event) {
	let registryArray = event['payload']['payload'];
	let selectElement = document.getElementById('registryName');
	//clear all options in select
	selectElement.innerHTML = "";
	let option = document.createElement("option");
	option.value = undefined;
	option.text = "Select a sensor";
	option.selected = true;
	option.hidden = true;
	//append the option to the select element
	selectElement.appendChild(option);
	// Create new options and append them to the select element
	for (let index = 0; index < registryArray.length; index++) {
		const element = registryArray[index];
		if (element['name'].includes('Label') == true) {
			let option = document.createElement("option");
			option.value = element['value'];
			option.text = element['value'];

			if (localSettings['registryName'] == option.value) {
				option.selected = true;
			}
			selectElement.appendChild(option);
		} else {
			continue
		}

	}
});


// $PI.onDidReceiveGlobalSettings(({ payload }) => {

// });

/**
 * Provide window level functions to use in the external window
 * (this can be removed if the external window is not used)
 */
window.sendToInspector = (data) => {
	console.log(data);
};
