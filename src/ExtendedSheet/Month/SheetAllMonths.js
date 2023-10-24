/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetAllMonths {
  static call_ (func) {
    for (let mm = 0; mm < 12; mm++) {
      const sheet = new SheetMonth(mm)
      sheet[func]()
    }
  }

  static resetConditionalFormat () {
    this.call_('resetConditionalFormat')
    return this
  }

  static resetNumberFormat () {
    this.call_('resetNumberFormat')
    return this
  }

  static resetProtection () {
    this.call_('resetProtection')
    return this
  }

  static resetSelectors () {
    this.call_('resetSelectors')
    return this
  }
}
