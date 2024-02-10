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

    /*
	  If the arc takes 272 pixels to fill, that means graphMaxValue should equal to 272 pixels and graphMinValue should equal to 0 pixels
	  Calculate the amount of pixels to fill using rawSensorValue
	  */
    let gaugePixels =
      272 * ((sensorValue - graphMinValue) / (graphMaxValue - graphMinValue));
    //add new entry
    this.graphHistory.push({
      y1: yCoordinate,
      y2: yCoordinate,
      gaugePixels: gaugePixels,
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

  generateArcSvg(
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

    if (this.graphHistory.length > 0) {
      //unfortunately dash offset is rendered from right to left, very band-aid fix
      let dashOffset =
        -271 + this.graphHistory[this.graphHistory.length - 1].gaugePixels;

      svgBuilder += `<path id="arc1" fill="none" stroke="#626464" stroke-width="20" d="M 117.96266658713867 112.56725658119235 A 60 60 0 1 0 26.037333412861322 112.56725658119235"></path>
    <path id="arc1" fill="none" stroke="${graphColor}" stroke-dashoffset="${dashOffset}" stroke-dasharray="${
        this.graphHistory[this.graphHistory.length - 1].gaugePixels
      } 1000" stroke-width="20" d="M 117.96266658713867 112.56725658119235 A 60 60 0 1 0 26.037333412861322 112.56725658119235"></path>
	`;

      svgBuilder += `<text
      x="72"
      y="130"
      font-family="${fontName}"
      font-size="${titleFontSize}"
      stroke="grey"
      fill="grey"
      text-anchor="middle"
    >${title}</text>`;

      svgBuilder += `<text
      x="72"
      y="83"
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
}

type GraphHistoryEntry = {
  y1: number;
  y2: number;
  gaugePixels: number;
};
