import SvgBuilder from "svg-builder";

class Graph {
	constructor() {
		this.graphHistory = [];
	}

	addSensorValue(sensorValue) {
		//if graphistory has 72 entries, remove the first one and push the new one
		//we treat the 72 entries in the array as 72 pixels in the Y axis
		//if graph refreshes every 2 seconds, we have 144 seconds of history

		if (this.graphHistory.length >= 72) {
			this.graphHistory.shift();
		}

		//if sensor value is at 100, it should correlate to the Y coordinate being 72, so we need to calculate the Y coordinate
		let yCoordinate = 144 - (sensorValue / 100) * 144;

		//change the last entry to the new Y coordinate to match the line so it doesn't skip up or down
		// if (this.graphHistory[this.graphHistory.length - 1] != undefined) {
		// 	this.graphHistory[this.graphHistory.length - 1].y2 = yCoordinate;
		// }

		//add new entry
		this.graphHistory.push({
			y1: yCoordinate,
			y2: yCoordinate,
		});
	}

	generateSvg(graphColor, backgroundColor) {
		var svgImg = SvgBuilder.newInstance();
		svgImg.width(144).height(144);
		svgImg.rect({ height: "144", width: "144", fill: backgroundColor });

		for (let index = 0; index < this.graphHistory.length; index++) {
			const element = this.graphHistory[index];
			//setting the points
			svgImg.line({
				x1: index * 2,
				y1: 144,
				x2: index * 2,
				y2: element.y2,
				stroke: graphColor,
				"stroke-width": 2,
			});
			// //filling color under the lines
			// svgImg.line({
			// 	x1: index,
			// 	y1: 72,
			// 	x2: index,
			// 	y2: element.y1,
			// 	stroke: graphColor,
			// 	"stroke-width": 1,
			// });

			// svgImg.line({
			// 	x1: index + 1,
			// 	y1: 72,
			// 	x2: index + 1,
			// 	y2: element.y2,
			// 	stroke: graphColor,
			// 	"stroke-width": 1,
			// });


		}

		svgImg.text(
			{
				x: 72,
				y: 42,
				"font-family": "Franklin Gothic Medium",
				"font-size": "26",
				stroke: "grey",
				fill: "grey",
				"text-anchor": "middle",
			},
			'GPU'
		);

		svgImg.text(
			{
				x: 72,
				y: 116,
				"font-family": "Franklin Gothic Medium",
				"font-size": "38",
				stroke: "white",
				fill: "white",
				"text-anchor": "middle",
			},
			'14%'
		);


		var logo = svgImg.render();
		let svgImage = `${logo}`;
		return svgImage;
	}
}




let okay = new Graph();

for (let index = 0; index < 150; index++) {
	okay.addSensorValue(index);
}



okay.addSensorValue(50);
okay.addSensorValue(70);
okay.addSensorValue(40);
okay.addSensorValue(20);
okay.addSensorValue(20);
okay.addSensorValue(80);
console.log(okay.generateSvg("green", "black"));