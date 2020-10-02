import { convertImages } from "./convertImages";
import { createSvgDataUri } from "./createSvgDataUri";
import { getSvg } from "./getSvg";
import { getCustomFonts } from "./fonts";

import {
    mxConstants,
    mxClient,
    mxUtils
} from "mxgraph-js";

/**
 * Strips leading and trailing quotes and spaces
 */
const trimCssUrl = (str) => {
    return str.replace(new RegExp("^[\\s\"']+", "g"), "").replace(new RegExp("[\\s\"']+$", "g"), "");
}

/**
 * For the fonts in CSS to be applied when rendering images on canvas, the actual
 * font data must be made available via a data URI encoding of the file.
 */
const embedCssFonts = (fontCss, then) => {
    var parts = fontCss.split('url(');
    var waiting = 0;

    let cachedFonts = {};

    var finish = function () {
        if (waiting === 0) {
            // Constructs string
            var result = [parts[0]];

            for (var j = 1; j < parts.length; j++) {
                var idx = parts[j].indexOf(')');
                result.push('url("');
                result.push(cachedFonts[trimCssUrl(parts[j].substring(0, idx))]);
                result.push('"' + parts[j].substring(idx));
            }

            then(result.join(''));
        }
    };

    if (parts.length > 0) {
        for (var i = 1; i < parts.length; i++) {
            var idx = parts[i].indexOf(')');

            // Checks if there is a format directive
            var fmtIdx = parts[i].indexOf('format(', idx);

            if (fmtIdx > 0) {

            }
        }

        //In case all fonts are cached
        finish();
    }
    else {
        //No font urls found
        then(fontCss);
    }
};

/**
 * Embeds external fonts
 */
const embedExtFonts = (callback) => {
    var extFonts = getCustomFonts();

    if (extFonts.length > 0) {
        var styleCnt = '', waiting = 0;

        var googleCssDone = function () {
            if (waiting === 0) {
                embedCssFonts(styleCnt, callback);
            }
        };

        googleCssDone();
    }
    else {
        callback();
    }
};

/**
 * Makes all relative font URLs absolute in the given font CSS.
 */
const absoluteCssFonts = (fontCss, graph) => {
    var result = null;

    if (fontCss != null) {
        var parts = fontCss.split('url(');

        if (parts.length > 0) {
            result = [parts[0]];

            // Gets path for URL
            var path = window.location.pathname;
            var idx = (path !== null) ? path.lastIndexOf('/') : -1;

            if (idx >= 0) {
                path = path.substring(0, idx + 1);
            }

            // Gets base tag from head
            var temp = document.getElementsByTagName('base');
            var base = null;

            if (temp != null && temp.length > 0) {
                base = temp[0].getAttribute('href');
            }

            for (var i = 1; i < parts.length; i++) {
                var idx = parts[i].indexOf(')');

                if (idx > 0) {
                    var url = trimCssUrl(parts[i].substring(0, idx));

                    if (graph.isRelativeUrl(url)) {
                        url = (base != null) ? base + url : (window.location.protocol + '//' + window.location.hostname +
                            ((url.charAt(0) === '/') ? '' : path) + url);
                    }

                    result.push('url("' + url + '"' + parts[i].substring(idx));
                }
                else {
                    result.push(parts[i]);
                }
            }
        }
        else {
            result = [fontCss]
        }
    }

    return (result != null) ? result.join('') : null;
};

/**
 * Copies MathJax CSS into the SVG output.
 */
const addMathCss = (svgRoot) => {
    var defs = svgRoot.getElementsByTagName('defs');

    if (defs !== null && defs.length > 0) {
        var styles = document.getElementsByTagName('style');

        for (var i = 0; i < styles.length; i++) {
            // Ignores style elements with no MathJax CSS
            if (mxUtils.getTextContent(styles[i]).indexOf('MathJax') > 0) {
                defs[0].appendChild(styles[i].cloneNode(true));
            }
        }
    }
};

/**
 * Adds the global fontCss configuration.
 */
const addFontCss = (svgRoot, fontCss) => {
    fontCss = (fontCss !== null) ? fontCss : absoluteCssFonts(null);

    // Creates defs element if not available
    if (fontCss != null) {
        var defs = svgRoot.getElementsByTagName('defs');
        var svgDoc = svgRoot.ownerDocument;
        var defsElt = null;

        if (defs.length === 0) {
            defsElt = (svgDoc.createElementNS != null) ?
                svgDoc.createElementNS(mxConstants.NS_SVG, 'defs') : svgDoc.createElement('defs');

            if (svgRoot.firstChild != null) {
                svgRoot.insertBefore(defsElt, svgRoot.firstChild);
            }
            else {
                svgRoot.appendChild(defsElt);
            }
        }
        else {
            defsElt = defs[0];
        }

        var style = (svgDoc.createElementNS !== null) ?
            svgDoc.createElementNS(mxConstants.NS_SVG, 'style') : svgDoc.createElement('style');
        style.setAttribute('type', 'text/css');
        mxUtils.setTextContent(style, fontCss);
        defsElt.appendChild(style);
    }
};

/**
 * Export to canvas
 */
export const exportToCanvas = (callback, width, imageCache, error, limitHeight,
    ignoreSelection, scale, transparentBackground, addShadow, converter, graph, border, noCrop, grid,
    keepTheme) => {



    try {
        limitHeight = (limitHeight != null) ? limitHeight : true;
        ignoreSelection = (ignoreSelection !== null) ? ignoreSelection : true;
        border = (border != null) ? border : 0;

        var bg = null;
        
        convertImages(getSvg(graph, null, null, border, noCrop, null, ignoreSelection,
            null, null, null, addShadow, null, keepTheme), function (svgRoot) {
                try {
                    var img = new Image();

                    img.onload = function () {
                        try {
                            var canvas = document.createElement('canvas');
                            var w = parseInt(svgRoot.getAttribute('width'));
                            var h = parseInt(svgRoot.getAttribute('height'));
                            scale = (scale != null) ? scale : 1;

                            if (width != null) {
                                scale = (!limitHeight) ? width / w : Math.min(1, Math.min((width * 3) / (h * 4), width / w));
                            }

                            w = Math.ceil(scale * w);
                            h = Math.ceil(scale * h);

                            canvas.setAttribute('width', w);
                            canvas.setAttribute('height', h);
                            var ctx = canvas.getContext('2d');

                            if (bg != null) {
                                ctx.beginPath();
                                ctx.rect(0, 0, w, h);
                                ctx.fillStyle = bg;
                                ctx.fill();
                            }

                            ctx.scale(scale, scale);

                            function drawImage() {
                                // Workaround for broken data URI images in Safari on first export
                                if (mxClient.IS_SF) {
                                    window.setTimeout(function () {
                                        ctx.drawImage(img, 0, 0);
                                        callback(canvas);
                                    }, 0);
                                }
                                else {
                                    ctx.drawImage(img, 0, 0);
                                    callback(canvas);
                                }
                            };

                            if (grid) {
                                var view = graph.view;
                                var curViewScale = view.scale;
                                view.scale = 1; //Reset the scale temporary to generate unscaled grid image which is then scaled
                                var gridImage = btoa(unescape(encodeURIComponent(view.createSvgGrid(view.gridColor))));
                                view.scale = curViewScale;
                                gridImage = 'data:image/svg+xml;base64,' + gridImage;
                                var phase = graph.gridSize * view.gridSteps * scale;

                                var b = graph.getGraphBounds();
                                var tx = view.translate.x * curViewScale;
                                var ty = view.translate.y * curViewScale;
                                var x0 = tx + (b.x - tx) / curViewScale - border;
                                var y0 = ty + (b.y - ty) / curViewScale - border;

                                var background = new Image();

                                background.onload = function () {
                                    try {
                                        var x = -Math.round(phase - mxUtils.mod((tx - x0) * scale, phase));
                                        var y = -Math.round(phase - mxUtils.mod((ty - y0) * scale, phase));

                                        for (var i = x; i < w; i += phase) {
                                            for (var j = y; j < h; j += phase) {
                                                ctx.drawImage(background, i / scale, j / scale);
                                            }
                                        }

                                        drawImage();
                                    }
                                    catch (e) {
                                        if (error != null) {
                                            error(e);
                                        }
                                    }
                                };

                                background.onerror = function (e) {
                                    if (error != null) {
                                        error(e);
                                    }
                                };

                                background.src = gridImage;
                            }
                            else {
                                drawImage();
                            }
                        }
                        catch (e) {
                            if (error != null) {
                                error(e);
                            }
                        }
                    };

                    img.onerror = function (e) {
                        //console.log('img', e, img.src);

                        if (error != null) {
                            error(e);
                        }
                    };

                    if (addShadow) {
                        graph.addSvgShadow(svgRoot);
                    }

                    if (graph.mathEnabled) {
                        addMathCss(svgRoot);
                    }

                    let resolvedFontCss = null;

                    var done = function () {
                        try {
                            if (resolvedFontCss != null) {
                                addFontCss(svgRoot, resolvedFontCss);
                            }

                            img.src = createSvgDataUri(mxUtils.getXml(svgRoot));
                        }
                        catch (e) {
                            if (error != null) {
                                error(e);
                            }
                        }
                    };

                    embedExtFonts(function (extFontsEmbeddedCss) {
                        try {
                            if (extFontsEmbeddedCss != null) {
                                addFontCss(svgRoot, extFontsEmbeddedCss);
                            }

                            done();
                        }
                        catch (e) {
                            if (error != null) {
                                error(e);
                            }
                        }
                    });
                }
                catch (e) {
                    //console.log('src', e, img.src);

                    if (error != null) {
                        error(e);
                    }
                }
            }, imageCache, converter);
    }
    catch (e) {
        console.error(e)
    }
};