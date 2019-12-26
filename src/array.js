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
	var i, j;

	for (i = 0; i < src[0].length; i++) {
		dest.push([ ]);
		for (j = 0; j < src.length; j++) {
			dest[i].push(src[j][i]);
		}
	}

	return dest;
}
