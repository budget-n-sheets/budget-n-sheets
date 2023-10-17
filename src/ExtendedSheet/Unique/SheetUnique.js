/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetUnique extends ExtendedSheet {
  constructor () {
    super('_Unique')
  }

  resetDefault () {
    this.resetFormulas()
      .resetProtection()
  }

  resetFormulas () {
    const formulas = [[
      SheetUniqueFormulas.getTttTransaction_(),
      SheetUniqueFormulas.getTttTags_()
    ]]
    this.sheet
      .getRange('A1:B1')
      .setFormulas(formulas)
    return this
  }

  resetProtection () {
    this.removeProtection()
    this.sheet
      .protect()
      .setWarningOnly(true)
    return this
  }
}
