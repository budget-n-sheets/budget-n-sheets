/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class UpdateScript extends Update {
  constructor () {
    const v0 = ClassVersion.get('script')
    const vA = Info.apps_script.version
    const list = [
      [
        null, [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [],
        ['', '', '', '', '', '', 'v0m49p6_', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '', 'v0m51p5_', '', 'v0m51p7_', 'v0m51p8_', '', '', '', '', 'v0m51p13_', '', '', '', '', 'v0m51p18_', '', '', 'v0m51p21_', 'v0m51p22_']
      ]
    ]

    super(v0, vA, list)
    this._key = 'script'
  }

  /**
   * Fix card balance calculation.
   *
   * 0.51.22
   */
  v0m51p22_ () {
    RecalculationService.resume(0, 12)
    return 0
  }

  /**
   * Fix transaction and tags suggestions to Jan and Feb.
   *
   * 0.51.21
   */
  v0m51p21_ () {
    new SheetMonth(0).resetUniqueSuggestions()
    new SheetMonth(1).resetUniqueSuggestions()
    return 0
  }

  /**
   * Reset formulas.
   *
   * 0.51.18
   */
  v0m51p18_ () {
    SpreadsheetSettings.updateDecimalSeparator()
    new SheetSettings().resetFormulas()
    new SheetSummary().resetFormulas()
    new SheetCashFlow().resetFormulas()
    RecalculationService.resume(0, 12)
    return 0
  }

  /**
   * Reset months formatting.
   *
   * 0.51.13
   */
  v0m51p13_ () {
    for (let mm = 0; mm < 12; mm++) {
      new SheetMonth(mm).resetFormatting()
    }

    return 0
  }

  /**
   * Reset Cash Flow formulas.
   *
   * 0.51.8
   */
  v0m51p8_ () {
    new SheetCashFlow().resetFormulas()
    return 0
  }

  /**
   * Reset defaults on month sheet.
   * Flush Accounts and Cards changes.
   *
   * 0.51.7
   */
  v0m51p7_ () {
    for (let mm = 0; mm < 12; mm++) {
      new SheetMonth(mm).resetFormatting()
    }
    new AccountsService().flush()
    new CardsService().flush()
    return 0
  }

  /**
   * Reset defaults on month sheet.
   *
   * 0.51.5
   */
  v0m51p5_ () {
    if (BnsTemplate.isPre15()) return 0
    for (let mm = 0; mm < 12; mm++) {
      new SheetMonth(mm).resetFormatting()
    }
    return 0
  }

  /**
   * Stamp.
   *
   * 0.49.6
   */
  v0m49p6_ () {
    Stamp.seal()
    return 0
  }
}
