import { saveLocalFile } from "./saveLocalFile";
import { writeGraphModelToPng } from "./graphToPng";
import { exportToCanvas } from "./exportToCanvas";

/**
 * Create image data resource
 */
const createImageDataUri = (canvas, xml, format, dpi) => {
    var data = canvas.toDataURL('image/' + format);

    // Checks if output is invalid or empty
    if (data.length <= 6 || data === canvas.cloneNode(false).toDataURL('image/' + format)) {
        throw new Error('Invalid image');
    }

    if (xml !== null) {
        data = writeGraphModelToPng(data, 'tEXt', 'mxfile', encodeURIComponent(xml));
    }

    if (dpi > 0) {
        data = writeGraphModelToPng(data, 'pHYs', 'dpi', dpi);
    }

    return data;
};

/**
 * Get filename
 */
const getBaseFilename = () => {
    return "Experiment";
};

/**
 * Save canvas
 */
const saveCanvas = (canvas, xml, format, dpi) => {
    var ext = ((format === 'jpeg') ? 'jpg' : format);
    var filename = getBaseFilename() + '.' + ext;
    var data = createImageDataUri(canvas, xml, format, dpi);
    saveLocalFile(data.substring(data.lastIndexOf(',') + 1), filename, 'image/' + format, true);
};

const exportImage = (scale, transparentBackground, ignoreSelection, addShadow,
    border, noCrop, format, grid, dpi, keepTheme, graph) => {

    format = (format != null) ? format : 'png';
    ignoreSelection = true;

    try {
        exportToCanvas(function (canvas) {
            try {
                saveCanvas(canvas, null, format, dpi);
            }
            catch (e) {
                console.error(e);
            }
        }, null, null, function (e) {
            console.error(e);
        }, null, ignoreSelection, scale || 1, transparentBackground,
            addShadow, null, graph, border, noCrop, grid, keepTheme);
    }
    catch (e) {
        console.error(e);
    }
};

export const exportPngFile = (graph) => {
    const dpi = 100;
    exportImage(null, true, true, false, 0, true, null, null, dpi, null, graph);
};