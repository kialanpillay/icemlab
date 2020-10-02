import { createImageUrlConverter } from "./createImageUrlConverter";
import { convertImageToDataUri } from "./convertImageToDataUri";

/**
 * Converts all images in the SVG output to data URIs for immediate rendering
 */
export const convertImages = (svgRoot, callback, converter) => {
	// Converts images to data URLs for immediate painting
	if (converter === null) {
		converter = createImageUrlConverter();
	}

	// Barrier for asynchronous image loading
	var counter = 0;

	function inc() {
		counter++;
	};

	function dec() {
		counter--;

		if (counter === 0) {
			callback(svgRoot);
		}
	};

	var convertImages = function (tagName, srcAttr) {
		var images = svgRoot.getElementsByTagName(tagName);

		for (var i = 0; i < images.length; i++) {
			(function (img) {
				try {
					if (img != null) {
						var src = converter.convert(img.getAttribute(srcAttr));

						// Data URIs are pass-through
						if (src !== null && src.substring(0, 5) !== 'data:') {
							inc();

							convertImageToDataUri(src, function (uri) {
								if (uri != null) {
									img.setAttribute(srcAttr, uri);
								}

								dec();
							});
						}
						else if (src != null) {
							img.setAttribute(srcAttr, src);
						}
					}
				}
				catch (e) {
					// ignore
				}
			})(images[i]);
		}
	};

	// Converts all known image tags in output
	// LATER: Add support for images in CSS
	convertImages('image', 'xlink:href');
	convertImages('img', 'src');

	// All from cache or no images
	if (counter === 0) {
		callback(svgRoot);
	}
};