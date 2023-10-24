/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class Utilities2 {
  static getDigestAlgorithm (v) {
    switch (v) {
      case 'MD5':
        return Utilities.DigestAlgorithm.MD5
      case 'SHA_1':
        return Utilities.DigestAlgorithm.SHA_1
      case 'SHA_256':
        return Utilities.DigestAlgorithm.SHA_256
      case 'SHA_512':
        return Utilities.DigestAlgorithm.SHA_512
    }
  }

  static getMacAlgorithm (v) {
    switch (v) {
      case 'MD5':
        return Utilities.MacAlgorithm.HMAC_MD5
      case 'SHA_1':
        return Utilities.MacAlgorithm.HMAC_SHA_1
      case 'SHA_256':
        return Utilities.MacAlgorithm.HMAC_SHA_256
      case 'SHA_512':
        return Utilities.MacAlgorithm.HMAC_SHA_512
    }
  }

  static getCharset (v) {
    switch (v) {
      case 'US_ASCII':
        return Utilities.Charset.US_ASCII
      case 'UTF_8':
        return Utilities.Charset.UTF_8
    }
  }

  /**
   * Decodes a base-64 encoded string into a byte array in a specific character set.
   *
   * @param  {string} base64data The string of data to decode.
   * @param  {string} charset    A Charset representing the input character set.
   * @param  {bool} byte         A bool to return output true:byte[] or false:string.
   *
   * @return {byte[]/string}     A byte[]/string representing the output signature.
   */
  static base64Decode (base64data, charset, byte) {
    const c = this.getCharset(charset)
    const d = Utilities.base64Decode(base64data, c)
    return byte ? d : Utilities.newBlob(d).getDataAsString()
  }

  /**
   * Decodes a base-64 web-safe encoded string into a byte array in a specific character set.
   *
   * @param  {string} base64data The string of web-safe data to decode.
   * @param  {string} charset    A Charset representing the input character set.
   * @param  {bool} byte         A bool to return output true:byte[] or false:string.
   *
   * @return {byte[]/string}     A byte[]/string representing the output signature.
   */
  static base64DecodeWebSafe (base64data, charset, byte) {
    const c = this.getCharset(charset)
    const d = Utilities.base64DecodeWebSafe(base64data, c)
    return byte ? d : Utilities.newBlob(d).getDataAsString()
  }

  /**
   * Compute a digest using the specified algorithm on the specified String value with the given character set.
   *
   * @param  {string} algorithm A DigestAlgorithm algorithm to use to hash the input value.
   * @param  {string} value     The input value to generate a hash for.
   * @param  {string} charset   A Charset representing the input character set.
   * @param  {bool} byte        A bool to return output true:byte[] or false:string.
   *
   * @return {byte[]/string}    A byte[]/string representing the output signature.
   */
  static computeDigest (algorithm, value, charset, byte) {
    const c = this.getCharset(charset)
    const a = this.getDigestAlgorithm(algorithm)
    const d = Utilities.computeDigest(a, value, c)
    return byte ? d : Utils.toHexString(d)
  }

  /**
   * Compute a message authentication code using the specified algorithm on the specified key and value.
   *
   * @param  {string} algorithm A MacAlgorithm algorithm to use to hash the input value.
   * @param  {string} value     The input value to generate a hash for.
   * @param  {string} key       A key to use to generate the hash with.
   * @param  {string} charset   A Charset representing the input character set.
   * @param  {bool} byte        A bool to return output true:byte[] or false:string.
   *
   * @return {byte[]/string}    A byte[]/string representing the output signature.
   */
  static computeHmacSignature (algorithm, value, key, charset, byte) {
    const c = this.getCharset(charset)
    const a = this.getMacAlgorithm(algorithm)
    const d = Utilities.computeHmacSignature(a, value, key, c)
    return byte ? d : Utils.toHexString(d)
  }
}
