/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetSettings extends ExtendedSheet {
  constructor () {
    super('_Settings')
  }

  resetDefault () {
    this.resetProtection()
      .testDecimalSeparator()
  }

  resetFormulas () {
    const formulaBuilder = FormulaBuild.settings().formulas()
    const formater = new NumberFormatter()
    this.sheet
      .getRange(2, 2, 10, 1)
      .setFormulas([
        [formater.localeSignal(SettingsConst.get('financial_year'))],
        [formulaBuilder.actualMonth()],
        [formater.localeSignal(SettingsUser.get('initial_month') + 1)],
        [formulaBuilder.activeMonths()],
        [formulaBuilder.mFactor()],
        [formulaBuilder.countTags()],
        ['RAND()'],
        [formater.localeSignal(SettingsSpreadsheet.get('decimal_places'))],
        [SettingsSpreadsheet.get('decimal_separator')],
        ['CONCATENATE("#,##0."; REPT("0"; B9); ";(#,##0."; REPT("0"; B9); ")")']
      ])
    return this
  }

  resetNumberFormat () {
    const numberFormat = NumberFormatterUtils.getNumberFormat(false)
    this.sheet
      .getRange(8, 2)
      .setNumberFormat(numberFormat)
    return this
  }

  resetProtection () {
    this.removeProtection()
    this.sheet
      .protect()
      .setWarningOnly(true)
    return this
  }

  testDecimalSeparator () {
    const a = this.sheet
      .getRange(8, 2)
      .setNumberFormat('0.0')
      .setValue(0.1)
    SpreadsheetApp.flush()
    SettingsSpreadsheet.set(
        'decimal_separator',
        /\./.test(a.getDisplayValue()))
      .updateMetadata()
    this.resetNumberFormat().resetFormulas()
    return this
  }
}
