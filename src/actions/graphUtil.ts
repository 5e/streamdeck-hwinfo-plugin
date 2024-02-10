//@ts-ignore
export class Graph {
  graphHistory: GraphHistoryEntry[] = [];

  addSensorValue(
    sensorValue: number,
    graphMinValue: number,
    graphMaxValue: number
  ) {
    if (this.graphHistory.length >= 73) {
      this.graphHistory.shift();
    }

    let yCoordinate =
      144 -
      ((sensorValue - graphMinValue) / (graphMaxValue - graphMinValue)) * 144;
    //add new entry
    this.graphHistory.push({
      y1: yCoordinate,
      y2: yCoordinate,
    });
  }

  generateSvg(
    graphColor: string,
    backgroundColor: string,
    title: string,
    sensorValue: string,
    titleFontSize: string,
    sensorFontSize: string,
    fontName: string
  ) {
    let svgBuilder = `<svg
	height="144"
	width="144"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
  >
	<rect height="144" width="144" fill="${backgroundColor}"></rect>`;

    for (let index = 0; index < this.graphHistory.length; index++) {
      const element: GraphHistoryEntry = this.graphHistory[index];
      //setting the points
      svgBuilder += `<line
	  x1="${index * 2}"
	  y1="144"
	  x2="${index * 2}"
	  y2="${element.y2}"
	  stroke="${graphColor}"
	  stroke-width="2"
	></line>`;
    }

    svgBuilder += `<text
    x="72"
    y="42"
    font-family="${fontName}"
    font-size="${titleFontSize}"
    stroke="grey"
    fill="grey"
    text-anchor="middle"
  >${title}</text>`;

    svgBuilder += `<text
    x="72"
    y="116"
    font-family="${fontName}"
    font-size="${sensorFontSize}"
    stroke="white"
    fill="white"
    text-anchor="middle"
  >${sensorValue}</text>`;

    svgBuilder += `</svg>`;

    let svgImage = `data:image/svg+xml;,${encodeURIComponent(svgBuilder)}`;
    return svgImage;
  }
}

type GraphHistoryEntry = {
  y1: number;
  y2: number;
};
