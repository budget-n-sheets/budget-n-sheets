/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ClassVersion extends Settings {
  static get _key () {
    return 'class_version2'
  }

  static get _scope () {
    return 'document'
  }

  static updateMetadata () {
    const keys = ['script', 'template']
    const properties = this.getAll(keys)
    SpreadsheetApp2.getActive()
      .getMetadata()
      .set(this._key, properties)
  }
}
