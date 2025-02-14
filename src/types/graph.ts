import { GraphHistoryEntry } from "./types";

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
    fontName: string,
    titleColor: string,
    sensorColor: string,
    highlightColor: string,
    sensorAlignment: string,
    titleAlignment: string
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
      // Add main line
      svgBuilder += `<line
          x1="${index * 2}"
          y1="144"
          x2="${index * 2}"
          y2="${element.y2}"
          stroke="${graphColor}"
          stroke-width="2"
        ></line>`;

      // Add highlight rectangle
      svgBuilder += `<rect
        x="${index * 2 - 1}"
        y="${element.y2}"
        width="2"
        height="5"
        fill="${highlightColor}"
        ></rect>`;
    }
  
    svgBuilder += `<text
        x="72"
        y="${getYValue(titleFontSize, titleAlignment)}"
        font-family="${fontName}"
        font-size="${titleFontSize}"
        stroke="${titleColor}"
        fill="${titleColor}"
        text-anchor="middle"
      >${title}</text>`;
  
    svgBuilder += `<text
        x="72"
        y="${getYValue(sensorFontSize, sensorAlignment)}"
        font-family="${fontName}"
        font-size="${sensorFontSize}"
        stroke="${sensorColor}"
        fill="${sensorColor}"
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
    fontName: string,
    titleColor: string,
    sensorColor: string
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
        -273 + this.graphHistory[this.graphHistory.length - 1].gaugePixels;

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
        stroke="${titleColor}"
        fill="${titleColor}"
        text-anchor="middle"
      >${title}</text>`;

      svgBuilder += `<text
        x="72"
        y="83"
        font-family="${fontName}"
        font-size="${sensorFontSize}"
        stroke="${sensorColor}"
        fill="${sensorColor}"
        text-anchor="middle"
      >${sensorValue}</text>`;

      svgBuilder += `</svg>`;

      let svgImage = `data:image/svg+xml;,${encodeURIComponent(svgBuilder)}`;
      return svgImage;
    }
  }
}

// Extracted getYValue function
function getYValue(sensorFontSize: string, verticalAlign: string) {
  const sensorFontSizePx = parseInt(sensorFontSize, 10);
  let yPosition;
  switch (verticalAlign) {
    case "top":
      yPosition = sensorFontSizePx; // Adjust to ensure the text stays within bounds
      break;
    case "middle":
      yPosition = 72 + sensorFontSizePx / 2; // Adjust to ensure the text stays centered
      break;
    case "bottom":
      yPosition = 144 - sensorFontSizePx / 3; // Adjust to ensure the text stays within bounds
      break;
  }
  return yPosition;
}