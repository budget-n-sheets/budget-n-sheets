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
        ['', '', '', '', '', 'v0m51p5_', '', 'v0m51p7_', 'v0m51p8_']
      ]
    ]

    super(v0, vA, list)
    this._key = 'script'
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
