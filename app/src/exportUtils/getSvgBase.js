import {
    mxConstants,
    mxImageExport,
    mxUtils,
    mxResources,
    mxRectangle,
    mxSvgCanvas2D
} from "mxgraph-js";

/**
 * Uses CSS transforms for scale and translate.
 */
let useCssTransforms = false;

/**
 * Hook for creating the canvas used in getSvg.
 */
const createSvgCanvas = (node) => {
    var canvas = new mxSvgCanvas2D(node);

    canvas.pointerEvents = true;

    return canvas;
};

/**
 * Adds support for page links.
 */
const isCustomLink = (href) => {
    return href.substring(0, 5) == 'data:';
};

/**
 * Hook for creating the canvas used in getSvg.
 */
const updateSvgLinks = (node, target, removeCustom) => {
    var links = node.getElementsByTagName('a');

    for (var i = 0; i < links.length; i++) {
        var href = links[i].getAttribute('href');

        if (href == null) {
            href = links[i].getAttribute('xlink:href');
        }

        if (href != null) {
            if (target != null && /^https?:\/\//.test(href)) {
                links[i].setAttribute('target', target);
            }
            else if (removeCustom && isCustomLink(href)) {
                links[i].setAttribute('href', 'javascript:void(0);');
            }
        }
    }
};

/**
 * Returns the link for the given cell.
 */
const getLinkForCell = (cell) => {
    if (cell.value != null && typeof (cell.value) == 'object') {
        var link = cell.value.getAttribute('link');

        // Removes links with leading javascript: protocol
        // TODO: Check more possible attack vectors
        if (link != null && link.toLowerCase().substring(0, 11) === 'javascript:') {
            link = link.substring(11);
        }

        return link;
    }

    return null;
};

const createSvgImageExport = () => {
    var exp = new mxImageExport();

    // Adds hyperlinks (experimental)
    exp.getLinkForCellState = function (state, canvas) {
        return getLinkForCell(state.cell);
    };

    return exp;
};

/**
 * Text for foreign object warning.
 */
const foreignObjectWarningText = 'Viewer does not support full SVG 1.1';

/**
 * Link for foreign object warning.
 */
const foreignObjectWarningLink = 'https://icemlab.vercel.app';

/**
 * Adds warning for truncated labels in older viewers.
 */
const addForeignObjectWarning = (canvas, root) => {
    if (root.getElementsByTagName('foreignObject').length > 0) {
        var sw = canvas.createElement('switch');
        var g1 = canvas.createElement('g');
        g1.setAttribute('requiredFeatures', 'http://www.w3.org/TR/SVG11/feature#Extensibility');
        var a = canvas.createElement('a');
        a.setAttribute('transform', 'translate(0,-5)');

        // Workaround for implicit namespace handling in HTML5 export, IE adds NS1 namespace so use code below
        // in all IE versions except quirks mode. KNOWN: Adds xlink namespace to each image tag in output.
        if (a.setAttributeNS == null || (root.ownerDocument != document && document.documentMode == null)) {
            a.setAttribute('xlink:href', foreignObjectWarningLink);
            a.setAttribute('target', '_blank');
        }
        else {
            a.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', foreignObjectWarningLink);
            a.setAttributeNS(mxConstants.NS_XLINK, 'target', '_blank');
        }

        var text = canvas.createElement('text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '10px');
        text.setAttribute('x', '50%');
        text.setAttribute('y', '100%');
        mxUtils.write(text, foreignObjectWarningText);

        sw.appendChild(g1);
        a.appendChild(text);
        sw.appendChild(a);
        root.appendChild(sw);
    }
};

/**
 * Get svg from mxgraph
 */
export const getSvgBase = (graph, background, scale, border, nocrop, crisp,
    ignoreSelection, showText, imgExport, linkTarget, hasShadow) => {
    //Disable Css Transforms if it is used
    var origUseCssTrans = useCssTransforms;

    if (origUseCssTrans) {
        useCssTransforms = false;
        graph.view.revalidate();
        graph.sizeDidChange();
    }

    try {
        scale = (scale != null) ? scale : 1;
        border = (border != null) ? border : 0;
        crisp = (crisp != null) ? crisp : true;
        ignoreSelection = (ignoreSelection != null) ? ignoreSelection : true;
        showText = (showText != null) ? showText : true;

        var bounds = (ignoreSelection || nocrop) ?
            graph.getGraphBounds() : graph.getBoundingBox(
                graph.getSelectionCells());

        if (bounds == null) {
            throw Error(mxResources.get('drawingEmpty'));
        }

        var vs = graph.view.scale;

        // Prepares SVG document that holds the output
        var svgDoc = mxUtils.createXmlDocument();
        var root = (svgDoc.createElementNS != null) ?
            svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');

        if (background != null) {
            if (root.style != null) {
                root.style.backgroundColor = background;
            }
            else {
                root.setAttribute('style', 'background-color:' + background);
            }
        }

        if (svgDoc.createElementNS == null) {
            root.setAttribute('xmlns', mxConstants.NS_SVG);
            root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
        }
        else {
            // KNOWN: Ignored in IE9-11, adds namespace for each image element instead. No workaround.
            root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxConstants.NS_XLINK);
        }

        var s = scale / vs;
        var w = Math.max(1, Math.ceil(bounds.width * s) + 2 * border) + ((hasShadow) ? 5 : 0);
        var h = Math.max(1, Math.ceil(bounds.height * s) + 2 * border) + ((hasShadow) ? 5 : 0);

        root.setAttribute('version', '1.1');
        root.setAttribute('width', w + 'px');
        root.setAttribute('height', h + 'px');
        root.setAttribute('viewBox', ((crisp) ? '-0.5 -0.5' : '0 0') + ' ' + w + ' ' + h);
        svgDoc.appendChild(root);

        // Renders graph. Offset will be multiplied with state's scale when painting state.
        // TextOffset only seems to affect FF output but used everywhere for consistency.
        var group = (svgDoc.createElementNS != null) ?
            svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
        root.appendChild(group);

        var svgCanvas = createSvgCanvas(group);
        svgCanvas.foOffset = (crisp) ? -0.5 : 0;
        svgCanvas.textOffset = (crisp) ? -0.5 : 0;
        svgCanvas.imageOffset = (crisp) ? -0.5 : 0;
        svgCanvas.translate(Math.floor((border / scale - bounds.x) / vs),
            Math.floor((border / scale - bounds.y) / vs));

        // Convert HTML entities
        var htmlConverter = document.createElement('div');

        // Adds simple text fallback for viewers with no support for foreignObjects
        var getAlternateText = svgCanvas.getAlternateText;
        svgCanvas.getAlternateText = function (fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation) {
            // Assumes a max character width of 0.5em
            if (str != null && graph.state.fontSize > 0) {
                try {
                    if (mxUtils.isNode(str)) {
                        str = str.innerText;
                    }
                    else {
                        htmlConverter.innerHTML = str;
                        str = mxUtils.extractTextWithWhitespace(htmlConverter.childNodes);
                    }

                    // Workaround for substring breaking double byte UTF
                    var exp = Math.ceil(2 * w / graph.state.fontSize);
                    var result = [];
                    var length = 0;
                    var index = 0;

                    while ((exp == 0 || length < exp) && index < str.length) {
                        var char = str.charCodeAt(index);

                        if (char == 10 || char == 13) {
                            if (length > 0) {
                                break;
                            }
                        }
                        else {
                            result.push(str.charAt(index));

                            if (char < 255) {
                                length++;
                            }
                        }

                        index++;
                    }

                    // Uses result and adds ellipsis if more than 1 char remains
                    if (result.length < str.length && str.length - result.length > 1) {
                        str = mxUtils.trim(result.join('')) + '...';
                    }

                    return str;
                }
                catch (e) {
                    return getAlternateText(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation);
                }
            }
            else {
                return getAlternateText(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation);
            }
        };

        // Paints background image
        var bgImg = graph.backgroundImage;

        if (bgImg != null) {
            var s2 = vs / scale;
            var tr = graph.view.translate;
            var tmp = new mxRectangle(tr.x * s2, tr.y * s2, bgImg.width * s2, bgImg.height * s2);

            // Checks if visible
            if (mxUtils.intersects(bounds, tmp)) {
                svgCanvas.image(tr.x, tr.y, bgImg.width, bgImg.height, bgImg.src, true);
            }
        }

        svgCanvas.scale(s);
        svgCanvas.textEnabled = showText;

        imgExport = (imgExport != null) ? imgExport : createSvgImageExport();

        imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);
        updateSvgLinks(root, linkTarget, true);
        addForeignObjectWarning(svgCanvas, root);

        return root;
    }
    finally {
        if (origUseCssTrans) {
            useCssTransforms = true;
            graph.view.revalidate();
            graph.sizeDidChange();
        }
    }
};