import { GraphHistoryEntry, SensorSettings } from "./types";

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

    let gaugePixels =
      272 * ((sensorValue - graphMinValue) / (graphMaxValue - graphMinValue));
    //add new entry
    this.graphHistory.push({
      y: yCoordinate,
      gaugePixels: gaugePixels,
    });
  }

  generateSvg(
	settings: SensorSettings,
	sensorValue: string
  ) {
    let svgBuilder = `<svg
        height="144"
        width="144"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <rect height="144" width="144" fill="${settings.backgroundColor}"></rect>`;

    // Build smooth path for the graph line
    if (this.graphHistory.length > 1) {
      let pathD = "";
      let areaD = "";
      let highlightD = "";
      const points = this.graphHistory.map((element, index) => ({
        x: index * 2,
        y: element.y,
      }));
      // Start path at first point
      pathD += `M ${points[0].x} ${points[0].y}`;
      areaD += `M ${points[0].x} ${points[0].y}`;
      highlightD += `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        pathD += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`;
        areaD += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`;
        // Highlight path now matches the graph line exactly
        highlightD += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`;
      }
      // Close area path: drop to bottom, go left to start, close
      areaD += ` L ${points[points.length - 1].x} 144 L ${points[0].x} 144 Z`;
      svgBuilder += `<path d="${areaD}" fill="${settings.graphColor}" stroke="none" />`;
      svgBuilder += `<path d="${pathD}" fill="none" stroke="${settings.graphColor}" stroke-width="2" />`;
      svgBuilder += `<path d="${highlightD}" fill="none" stroke="${settings.graphHighlightColor}" stroke-width="3" />`;
    }

    svgBuilder += `<text
        x="72"
        y="${getYValue(settings.titleFontSize, settings.titleAlignment)}"
        font-family="${settings.fontName}"
        font-size="${settings.titleFontSize}"
        font-weight="${settings.fontWeight}"
        fill="${settings.titleColor}"
		stroke="${settings.titleOutlineColor}"
		stroke-width="${settings.titleOutlineWidth}"
        text-anchor="middle"
      >${settings.title}</text>`;

    svgBuilder += `<text
        x="72"
        y="${getYValue(settings.sensorFontSize, settings.sensorAlignment)}"
        font-family="${settings.fontName}"
        font-size="${settings.sensorFontSize}"
		font-weight="${settings.fontWeight}"
		stroke-width="${settings.sensorOutlineWidth}"
        stroke="${settings.sensorOutlineColor}"
        fill="${settings.sensorColor}"
        text-anchor="middle"
      >${sensorValue}</text>`;

    svgBuilder += `</svg>`;

    let svgImage = `data:image/svg+xml;,${encodeURIComponent(svgBuilder)}`;
    return svgImage;
  }

  generateArcSvg(
    settings: SensorSettings,
	sensorValue: string
  ) {
    let svgBuilder = `<svg
		height="144"
		width="144"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		>
      	<rect height="144" width="144" fill="${settings.backgroundColor}"></rect>`;

    if (this.graphHistory.length > 0) {
      //unfortunately dash offset is rendered from right to left, very band-aid fix
      let dashOffset =
        -273 + this.graphHistory[this.graphHistory.length - 1].gaugePixels;

      svgBuilder += `<path id="arc1" fill="none" stroke="#626464" stroke-width="20" d="M 117.96266658713867 112.56725658119235 A 60 60 0 1 0 26.037333412861322 112.56725658119235"></path>
      <path id="arc1" fill="none" stroke="${settings.graphColor}" stroke-dashoffset="${dashOffset}" stroke-dasharray="${
        this.graphHistory[this.graphHistory.length - 1].gaugePixels
      } 1000" stroke-width="20" d="M 117.96266658713867 112.56725658119235 A 60 60 0 1 0 26.037333412861322 112.56725658119235"></path>
      `;

      svgBuilder += `<text
			x="72"
			y="130"
			font-family="${settings.fontName}"
			font-size="${settings.titleFontSize}"
			font-weight="${settings.fontWeight}"
			stroke="${settings.titleOutlineColor}"
			stroke-width="${settings.titleOutlineWidth}"
			fill="${settings.titleColor}"
			text-anchor="middle"
			>${settings.title}</text>`;

      svgBuilder += `<text
			x="72"
			y="83"
			font-family="${settings.fontName}"
			font-size="${settings.sensorFontSize}"
			font-weight="${settings.fontWeight}"
			stroke="${settings.sensorOutlineColor}"
			stroke-width="${settings.sensorOutlineWidth}"
			fill="${settings.sensorColor}"
			text-anchor="middle"
			>${sensorValue}</text>`;

      svgBuilder += `</svg>`;

      let svgImage = `data:image/svg+xml;,${encodeURIComponent(svgBuilder)}`;
      return svgImage;
    }
  }
}

function getYValue(sensorFontSize: string, verticalAlign: string) {
  const sensorFontSizePx = parseInt(sensorFontSize, 10);
  let yPosition;
  switch (verticalAlign) {
	// Legacy behaviour for predefined alignments
    case "top":
      yPosition = sensorFontSizePx; // Adjust to ensure the text stays within bounds
      break;
    case "middle":
      yPosition = 72 + sensorFontSizePx / 2; // Adjust to ensure the text stays centered
      break;
    case "bottom":
      yPosition = 144 - sensorFontSizePx / 3; // Adjust to ensure the text stays within bounds
      break;
	default:
		// New behaviour, we are letting them choose specific pixel value, just let it through
		yPosition = parseInt(verticalAlign, 10);
  }
  return yPosition;
}
