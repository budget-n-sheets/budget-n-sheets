/**
 * Copyright (c) 2019 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

class Noise {
  /**
   * Generates a random integer from the interval [0, n).
   * @param  {number} n Upper limit.
   * @return {number}   Random integer.
   */
  static randomInteger (n) {
    return Math.floor(Math.random() * Math.floor(n));
  }

  /**
   * Generates a random number from the interval [0, 10^p).
   * @param  {number} p Upper limit.
   * @return {number}   Random number.
   */
  static randomNumber (p) {
    return Math.random() * Math.pow(10, p);
  }

  /**
   * Generates a random truncated number from the interval [0, 10^p).
   * @param  {number} p Upper limit.
   * @param  {number} d Number of decimal places.
   * @return {number}   Random number.
   */
  static randomValue (p, d) {
    return +this.randomNumber(p).toFixed(d);
  }

  /**
   * Generates a random truncated number from the interval (-10^p, 10^p).
   * @param  {number} p Upper limit.
   * @param  {number} d Number of decimal places.
   * @return {number}   Random number.
   */
  static randomValueSign (p, d) {
    return (Math.random() < 0.5 ? 1 : -1) * +this.randomNumber(p).toFixed(d);
  }

  /**
   * Generates a random negative truncated number from the interval (-10^p, 0].
   * @param  {number} p Upper limit.
   * @param  {number} d Number of decimal places.
   * @return {number}   Random number.
   */
  static randomValueNegative (p, d) {
    return -this.randomNumber(p).toFixed(d);
  }

  /**
   * Generates a random string.
   * @param  {number} n Length of string.
   * @param  {string} p Class of characters.
   * @return {string}   Random string.
   */
  static randomString (n, p) {
    let b = '';
    switch (p) {
      case 'digit':
        b = '0123456789';
        break;
      case 'lower':
        b = 'abcdefghijklmnopqrstuvwxyz';
        break;
      case 'upper':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        break;
      case 'alpha':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        break;
      case 'lonum':
        b = 'abcdefghijklmnopqrstuvwxyz0123456789';
        break;
      case 'upnum':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        break;
      case 'alnum':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        break;
      case 'word':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
        break;

      default:
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        break;
    }

    let s = '';
    for (let i = 0; i < n; i++) {
      s += b.charAt(Math.floor(Math.random() * b.length));
    }

    return s;
  }
}
