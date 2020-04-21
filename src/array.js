/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

/**
 * Transpose a 2D array.
 * @param  {array} src The array to be transposed.
 * @return {array}     The tranposed array.
 */
function transpose(src) {
	var dest = [ ];

	for (var i = 0; i < src[0].length; i++) {
		dest[i] = [ ];
		for (var j = 0; j < src.length; j++) {
			dest[i][j] = src[j][i];
		}
	}

	return dest;
}
