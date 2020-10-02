/**
 * Prefix for URLs that reference Google fonts.
 */
const GOOGLE_FONTS = 'https://fonts.googleapis.com/css?family=';

/**
 * Returns true if the given font URL references a Google font.
 */
const isGoogleFontUrl = (url) => {
    return url.substring(0, GOOGLE_FONTS.length) === GOOGLE_FONTS;
};

/**
 * Returns true if the given font URL is a CSS file.
 */
export const isCssFontUrl = (url) => {
    return isGoogleFontUrl(url);
};

/**
 * Lookup table for mapping from font URL and name to elements in the DOM.
 */
let customFontElements = {};

/**
 * Returns all custom fonts (old and new).
 */
export const getCustomFonts = function () {
    var fonts = null; //this.extFonts;

    if (fonts != null) {
        fonts = fonts.slice();
    }
    else {
        fonts = [];
    }

    for (var key in customFontElements) {
        var font = customFontElements[key];
        fonts.push({ name: font.name, url: font.url });
    }

    return fonts;
};