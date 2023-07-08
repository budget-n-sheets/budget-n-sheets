/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SjclService {
  static decrypt (password, blob) {
    return sjcl.decrypt(
      password,
      Utilities.base64DecodeWebSafe(
        blob.getDataAsString(),
        Utilities.Charset.UTF_8
      )
    );
  }

  static encrypt (password, name, data) {
    const options = Object.freeze({
      ks: 256,
      mode: 'gcm',
      iter: 1010010,
      ts: 128,
      adata: name
    });

    return Utilities.newBlob(
      Utilities.base64EncodeWebSafe(
        sjcl.encrypt(password, data, options),
        Utilities.Charset.UTF_8
      ),
      'application/octet-stream',
      name
    );
  }
}
