import { mxImage } from "mxgraph-js";

/**
 * Helper function for creating SVG data URI.
 */
const createSvgImage = (w, h, data, coordWidth, coordHeight) => {
    var tmp = unescape(encodeURIComponent(
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + w + 'px" height="' + h + 'px" ' +
        ((coordWidth != null && coordHeight != null) ? 'viewBox="0 0 ' + coordWidth + ' ' + coordHeight + '" ' : '') +
        'version="1.1">' + data + '</svg>'));

    return new mxImage('data:image/svg+xml;base64,' + btoa(tmp), w, h)
};

/**
 * Broken image symbol for offline SVG.
 */
export const svgBrokenImage = createSvgImage(10, 10, '<rect x="0" y="0" width="10" height="10" stroke="#000" fill="transparent"/><path d="m 0 0 L 10 10 L 0 10 L 10 0" stroke="#000" fill="transparent"/>');