const urlParams = (function(url) {
	var result = new Object();
	var idx = url.lastIndexOf('?');

	if (idx > 0) {
		var params = url.substring(idx + 1).split('&');

		for ( var i = 0; i < params.length; i++) {
			idx = params[i].indexOf('=');

			if (idx > 0) {
				result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
			}
		}
	}

	return result;
})(window.location.href);

/**
 * Returns true if the given URL is known to have CORS headers and is
 * allowed by CSP.
 */
export const isCorsEnabledForUrl = (url) => {
    let corsRegExp = null;

    // Blocked by CSP in production but allowed for hosted deployment
    if (urlParams['cors'] != null && corsRegExp == null) {
        corsRegExp = new RegExp(decodeURIComponent(urlParams['cors']));
    }

    // No access-control-allow-origin for some Iconfinder images, add this when fixed:
    // /^https?:\/\/[^\/]*\.iconfinder.com\//.test(url) ||
    return (corsRegExp != null && corsRegExp.test(url)) ||
        url.substring(0, 34) === 'https://raw.githubusercontent.com/';
};