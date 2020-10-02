/**
 * Created SVG data url
 */
export const createSvgDataUri = (svg) => {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
};
