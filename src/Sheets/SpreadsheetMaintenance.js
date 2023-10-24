/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SpreadsheetMaintenance {
  static hideShowMonths () {
    const spreadsheet2 = SpreadsheetApp2.getActive()
    const month = Consts.date.getMonth()
    const delta = Utils.getMonthDelta(month)
    const m0 = month + delta[0]
    const m1 = month + delta[1]

    let mm = SettingsUser.get('initial_month') - 1

    while (++mm < 12) {
      const sheet = spreadsheet2.getSheetByName(Consts.month_name.short[mm])
      if (mm < m0 || mm > m1) sheet.hideSheet()
      else sheet.showSheet()
    }
  }

  static setMonthsColoring () {
    const spreadsheet2 = SpreadsheetApp2.getActive()
    const month = Consts.date.getMonth()
    const delta = Utils.getMonthDelta(month)
    const m0 = month + delta[0]
    const m1 = month + delta[1]

    let mm = SettingsUser.get('initial_month') - 1
    while (++mm < 12) {
      const sheet = spreadsheet2.getSheetByName(Consts.month_name.short[mm])
      if (mm < m0 || mm > m1) sheet.setTabColor('#a4c2f4')
      else sheet.setTabColor('#3c78d8')
    }

    const financialYear = SettingsConst.get('financial_year')
    const year = Consts.date.getFullYear()
    if (year === financialYear) {
      spreadsheet2.getSheetByName(Consts.month_name.short[month]).setTabColor('#6aa84f')
    }
  }
}
