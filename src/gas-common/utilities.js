/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

/**
 * Converts an array of bytes to string.
 * @param  {Object} b Array of bytes.
 * @return {String} String.
 */
function byte2string(b) {
	var r = "";
	var v, i;

	for (i = 0; i < b.length; i++) {
		v = b[i];
		if (v < 0) v += 256;
		v = v.toString(16);
		if (v.length === 1) v = "0" + v;
		r += v;
	}

	return r;
}


function getDigestAlgorithm(v) {
	switch (v) {
		case "MD5":
			return Utilities.DigestAlgorithm.MD5;
		case "SHA_1":
			return Utilities.DigestAlgorithm.SHA_1;
		case "SHA_256":
			return Utilities.DigestAlgorithm.SHA_256;
		case "SHA_512":
			return Utilities.DigestAlgorithm.SHA_512;

		default:
			return;
	}
}


function getMacAlgorithm(v) {
	switch (v) {
		case "MD5":
			return Utilities.MacAlgorithm.HMAC_MD5;
		case "SHA_1":
			return Utilities.MacAlgorithm.HMAC_SHA_1;
		case "SHA_256":
			return Utilities.MacAlgorithm.HMAC_SHA_256;
		case "SHA_512":
			return Utilities.MacAlgorithm.HMAC_SHA_512;

		default:
			return;
	}
}


function getCharset(v) {
	switch (v) {
		case "US_ASCII":
			return Utilities.Charset.US_ASCII;
		case "UTF_8":
			return Utilities.Charset.UTF_8;

		default:
			return;
	}
}

/**
 * Decodes a base-64 encoded string into a byte array in a specific character set.
 *
 * @param  {string} base64data The string of data to decode.
 * @param  {string} charset    A Charset representing the input character set.
 * @param  {bool} byte       	 A bool to return output true:byte[] or false:string.
 *
 * @return {byte[]/string}     A byte[]/string representing the output signature.
 */
function base64Decode(base64data, charset, byte) {
	var decoded;

	charset = getCharset(charset);

	decoded = Utilities.base64Decode(base64data, charset);

	if (!byte) {
		decoded = Utilities.newBlob(decoded).getDataAsString();
	}

	return decoded;
}

/**
 * Decodes a base-64 web-safe encoded string into a byte array in a specific character set.
 *
 * @param  {string} base64data The string of web-safe data to decode.
 * @param  {string} charset    A Charset representing the input character set.
 * @param  {bool} byte       	 A bool to return output true:byte[] or false:string.
 *
 * @return {byte[]/string}     A byte[]/string representing the output signature.
 */
function base64DecodeWebSafe(base64data, charset, byte) {
	var decoded;

	charset = getCharset(charset);

	decoded = Utilities.base64DecodeWebSafe(base64data, charset);

	if (!byte) {
		decoded = Utilities.newBlob(decoded).getDataAsString();
	}

	return decoded;
}

/**
 * Compute a digest using the specified algorithm on the specified String value with the given character set.
 *
 * @param  {string} algorithm A DigestAlgorithm algorithm to use to hash the input value.
 * @param  {string} value     The input value to generate a hash for.
 * @param  {string} charset   A Charset representing the input character set.
 * @param  {bool} byte      	A bool to return output true:byte[] or false:string.
 *
 * @return {byte[]/string}    A byte[]/string representing the output signature.
 */
function computeDigest(algorithm, value, charset, byte) {
	var digest;

	algorithm = getDigestAlgorithm(algorithm);
	charset = getCharset(charset);

	digest = Utilities.computeDigest(algorithm, value, charset);

	if (!byte) {
		digest = byte2string(digest);
	}

	return digest;
}

/**
 * Compute a message authentication code using the specified algorithm on the specified key and value.
 *
 * @param  {string} algorithm A MacAlgorithm algorithm to use to hash the input value.
 * @param  {string} value     The input value to generate a hash for.
 * @param  {string} key       A key to use to generate the hash with.
 * @param  {string} charset   A Charset representing the input character set.
 * @param  {bool} byte      	A bool to return output true:byte[] or false:string.
 *
 * @return {byte[]/string}    A byte[]/string representing the output signature.
 */
function computeHmacSignature(algorithm, value, key, charset, byte) {
	var digest;

	algorithm = getMacAlgorithm(algorithm);
	charset = getCharset(charset);

	digest = Utilities.computeHmacSignature(algorithm, value, key, charset);

	if (!byte) {
		digest = byte2string(digest);
	}

	return digest;
}
