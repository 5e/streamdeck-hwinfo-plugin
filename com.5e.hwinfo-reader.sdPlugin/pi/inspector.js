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
	let selectElement = document.getElementById('index');
	//clear all options in select
	selectElement.innerHTML = "";
	// Create new options and append them to the select element
	for (let index = 0; index < registryArray.length; index++) {
		const element = registryArray[index];
		if (element['name'].includes('Label') == true) {
			var option = document.createElement("option");
			//set the value using the item in the array
			//get last character of string
			option.value = element['value'];
			//set the text content
			option.text = element['value'];

			if (localSettings['index'] == option.value) {
				option.selected = true;
			}
			//append the option to the select element
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

document.querySelector('#open-external').addEventListener('click', () => {
	window.open('../../../external.html');
});


/** 
 * TABS
 * ----
 * 
 * This will make the tabs interactive:
 * - clicking on a tab will make it active
 * - clicking on a tab will show the corresponding content
 * - clicking on a tab will hide the content of all other tabs
 * - a tab must have the class "tab"
 * - a tab must have a data-target attribute that points to the id of the content
 * - the content must have the class "tab-content"
 * - the content must have an id that matches the data-target attribute of the tab
 * 
 *  <div class="tab selected" data-target="#tab1" title="Show some inputs">Inputs</div>
 *  <div class="tab" data-target="#tab2" title="Here's some text-areas">Text</div>
 * a complete tab-example can be found in the index.html
   <div type="tabs" class="sdpi-item">
	  <div class="sdpi-item-label empty"></div>
	  <div class="tabs">
		<div class="tab selected" data-target="#tab1" title="Show some inputs">Inputs</div>
		<div class="tab" data-target="#tab2" title="Here's some text-areas">Text</div>
	  </div>
	</div>
	<hr class="tab-separator" />
 * You can use the code below to activate the tabs (`activateTabs` and `clickTab` are required)
 */

function activateTabs(activeTab) {
	const allTabs = Array.from(document.querySelectorAll('.tab'));
	let activeTabEl = null;
	allTabs.forEach((el, i) => {
		el.onclick = () => clickTab(el);
		if (el.dataset?.target === activeTab) {
			activeTabEl = el;
		}
	});
	if (activeTabEl) {
		clickTab(activeTabEl);
	} else if (allTabs.length) {
		clickTab(allTabs[0]);
	}
}

function clickTab(clickedTab) {
	const allTabs = Array.from(document.querySelectorAll('.tab'));
	allTabs.forEach((el, i) => el.classList.remove('selected'));
	clickedTab.classList.add('selected');
	activeTab = clickedTab.dataset?.target;
	allTabs.forEach((el, i) => {
		if (el.dataset.target) {
			const t = document.querySelector(el.dataset.target);
			if (t) {
				t.style.display = el == clickedTab ? 'block' : 'none';
			}
		}
	});
}

activateTabs();
