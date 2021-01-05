/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

/**
 * Transpose a 2D array.
 * @param  {array} m   The 2D array to be transposed.
 * @return {array}     The tranposed 2D array.
 */
const transpose = m => m[0].map((x, i) => m.map(x => x[i]));
