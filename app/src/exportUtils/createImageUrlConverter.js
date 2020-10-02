import { isCorsEnabledForUrl } from "./corsEnabled";
import { svgBrokenImage } from "./svgBrokenImage";

import {
    mxClient,
    mxUrlConverter
} from "mxgraph-js";

const PROXY_URL = '/proxy';

/**
 * Converts all images in the SVG output to data URIs for immediate rendering
 */
export const createImageUrlConverter = () => {
    var converter = new mxUrlConverter();
    converter.updateBaseUrl();

    /**
     * Specifies if img.crossOrigin is supported. This is true for all browsers except IE10 and earlier.
     */
    const crossOriginImages = !mxClient.IS_IE;

    // Extends convert to avoid CORS using an image proxy server where needed
    var convert = converter.convert;

    converter.convert = function (src) {
        if (src !== null) {
            var remote = src.substring(0, 7) === 'http://' || src.substring(0, 8) === 'https://';

            if (remote && !navigator.onLine) {
                src = svgBrokenImage.src;
            }
            else if (remote && src.substring(0, converter.baseUrl.length) !== converter.baseUrl &&
                (!crossOriginImages || !isCorsEnabledForUrl(src))) {
                src = PROXY_URL + '?url=' + encodeURIComponent(src);
            }
            else if (src.substring(0, 19) !== 'chrome-extension://' && !mxClient.IS_CHROMEAPP) {
                src = convert.apply(this, arguments);
            }
        }

        return src;
    };

    return converter;
};