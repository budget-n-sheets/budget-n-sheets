/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Noise {
  /**
   * Generates a random integer from the interval [0, n).
   * @param  {number} n Upper limit.
   * @return {number}   Random integer.
   */
  static randomInteger (n) {
    return Math.floor(Math.random() * Math.floor(n))
  }

  /**
   * Generates a random number from the interval [0, 10^p).
   * @param  {number} p Upper limit.
   * @return {number}   Random number.
   */
  static randomNumber (p) {
    return Math.random() * Math.pow(10, p)
  }

  /**
   * Generates a random truncated number from the interval [0, 10^p).
   * @param  {number} p Upper limit.
   * @param  {number} d Number of decimal places.
   * @return {number}   Random number.
   */
  static randomValue (p, d) {
    return +this.randomNumber(p).toFixed(d)
  }

  /**
   * Generates a random truncated number from the interval (-10^p, 10^p).
   * @param  {number} p Upper limit.
   * @param  {number} d Number of decimal places.
   * @return {number}   Random number.
   */
  static randomValueSign (p, d) {
    return (Math.random() < 0.5 ? 1 : -1) * +this.randomNumber(p).toFixed(d)
  }

  /**
   * Generates a random negative truncated number from the interval (-10^p, 0].
   * @param  {number} p Upper limit.
   * @param  {number} d Number of decimal places.
   * @return {number}   Random number.
   */
  static randomValueNegative (p, d) {
    return -this.randomNumber(p).toFixed(d)
  }

  /**
   * Generates a list of n UUIDs.
   * @param  {number} n Upper limit.
   * @return {array}
   */
  static listUuid (n) {
    const a = []
    do {
      const v = Utilities.getUuid()
      if (a.indexOf(v) === -1) a.push(v)
    } while (a.length < n)
    return a
  }

  /**
   * Generates a random string.
   * @param  {number} n Length of string.
   * @param  {string} p Class of characters.
   * @return {string}   Random string.
   */
  static randomString (n, p) {
    let b = ''
    switch (p) {
      case 'digit':
        b = '0123456789'
        break
      case 'lower':
        b = 'abcdefghijklmnopqrstuvwxyz'
        break
      case 'upper':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        break
      case 'alpha':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        break
      case 'lonum':
        b = 'abcdefghijklmnopqrstuvwxyz0123456789'
        break
      case 'upnum':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        break
      case 'alnum':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        break
      case 'word':
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_'
        break

      default:
        b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        break
    }

    let s = ''
    for (let i = 0; i < n; i++) {
      s += b.charAt(Math.floor(Math.random() * b.length))
    }

    return s
  }
}
