import {
    mxClient,
    mxUtils,
} from "mxgraph-js";

import { svgBrokenImage } from "./svgBrokenImage";
import { createSvgDataUri } from "./createSvgDataUri";

/**
 * Convert image to bytes
 */
export const convertImageToDataUri = (url, callback) => {
    const timeout = 25000;

    /**
     * Specifies if img.crossOrigin is supported. This is true for all browsers except IE10 and earlier.
     */
    const crossOriginImages = !mxClient.IS_IE;

    try {
        var acceptResponse = true;

        var timeoutThread = setTimeout(function () {
            acceptResponse = false;
            callback(svgBrokenImage.src);
        }, timeout);

        if (/(\.svg)$/i.test(url)) {
            mxUtils.get(url, function (req) {
                window.clearTimeout(timeoutThread);

                if (acceptResponse) {
                    callback(createSvgDataUri(req.getText()));
                }
            },
                function () {
                    window.clearTimeout(timeoutThread);

                    if (acceptResponse) {
                        callback(svgBrokenImage.src);
                    }
                });
        }
        else {
            var img = new Image();

            if (crossOriginImages) {
                img.crossOrigin = 'anonymous';
            }

            img.onload = function () {
                window.clearTimeout(timeoutThread);

                if (acceptResponse) {
                    try {
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        canvas.height = img.height;
                        canvas.width = img.width;
                        ctx.drawImage(img, 0, 0);

                        callback(canvas.toDataURL());
                    }
                    catch (e) {
                        callback(svgBrokenImage.src);
                    }
                }
            };

            img.onerror = function () {
                window.clearTimeout(timeoutThread);

                if (acceptResponse) {
                    callback(svgBrokenImage.src);
                }
            };

            img.src = url;
        }
    }
    catch (e) {
        callback(svgBrokenImage.src);
    }
};