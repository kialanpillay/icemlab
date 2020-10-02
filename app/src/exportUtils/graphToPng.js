let crcTable = [];
	
for (var n = 0; n < 256; n++)
{
	var c = n;
	
	for (var k = 0; k < 8; k++)
	{
		if ((c & 1) == 1)
		{
			c = 0xedb88320 ^ (c >>> 1);
		}
		else
		{
			c >>>= 1;
		}

		crcTable[n] = c;
	}
}

const updateCRC = (crc, data, off, len) =>
{
	var c = crc;

	for (var n = 0; n < len; n++)
	{
		c = crcTable[(c ^ data.charCodeAt(off + n)) & 0xff] ^ (c >>> 8);
	}

	return c;
};

/**
 * Adds the given text to the compressed or non-compressed text chunk.
 */
export const writeGraphModelToPng = (data, type, key, value, error) => {
	var base64 = data.substring(data.indexOf(',') + 1);
	var f = atob(base64);
	var pos = 0;

	function fread(d, count) {
		var start = pos;
		pos += count;

		return d.substring(start, pos);
	};

	// Reads unsigned long 32 bit big endian
	function _freadint(d) {
		var bytes = fread(d, 4);

		return bytes.charCodeAt(3) + (bytes.charCodeAt(2) << 8) +
			(bytes.charCodeAt(1) << 16) + (bytes.charCodeAt(0) << 24);
	};

	function writeInt(num) {
		return String.fromCharCode((num >> 24) & 0x000000ff, (num >> 16) & 0x000000ff,
			(num >> 8) & 0x000000ff, num & 0x000000ff);
	};

	// Checks signature
	if (fread(f, 8) != String.fromCharCode(137) + 'PNG' + String.fromCharCode(13, 10, 26, 10)) {
		if (error !== null) {
			error();
		}

		return;
	}

	// Reads header chunk
	fread(f, 4);

	if (fread(f, 4) !== 'IHDR') {
		if (error !== null) {
			error();
		}

		return;
	}

	fread(f, 17);
	var result = f.substring(0, pos);

	do {
		var n = _freadint(f);
		var chunk = fread(f, 4);

		if (chunk === 'IDAT') {
			result = f.substring(0, pos - 8);

			if (type === 'pHYs' && key === 'dpi') {
				var dpm = Math.round(value / 0.0254); //One inch is equal to exactly 0.0254 meters.
				var chunkData = writeInt(dpm) + writeInt(dpm) + String.fromCharCode(1);
			}
			else {
				var chunkData = key + String.fromCharCode(0) +
					((type === 'zTXt') ? String.fromCharCode(0) : '') +
					value;
			}

			var crc = 0xffffffff;
			crc = updateCRC(crc, type, 0, 4);
			crc = updateCRC(crc, chunkData, 0, chunkData.length);

			result += writeInt(chunkData.length) + type + chunkData + writeInt(crc ^ 0xffffffff);
			result += f.substring(pos - 8, f.length);

			break;
		}

		result += f.substring(pos - 8, pos - 4 + n);
		fread(f, n);
		fread(f, 4);
	}
	while (n);

	return 'data:image/png;base64,' + btoa(result);
};