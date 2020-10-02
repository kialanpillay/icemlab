import { base64ToBlob } from "./convertBase64ToBlob";

/**
 * Save local file
 */
export const saveLocalFile = (data, filename, mimeType, base64Encoded) => {

    var a = document.createElement('a');

    a.href = URL.createObjectURL((base64Encoded) ?
        base64ToBlob(data, mimeType) :
        new Blob([data], { type: mimeType }));

    a.download = filename;

    document.body.appendChild(a);

    try {
        window.setTimeout(function () {
            URL.revokeObjectURL(a.href);
        }, 20000);

        a.click();
        a.parentNode.removeChild(a);
    }
    catch (e) {
        console.error(e);
    }

};