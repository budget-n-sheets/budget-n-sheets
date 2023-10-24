/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class BnsSpreadsheet {
  static showMonths () {
    const spreadsheet2 = SpreadsheetApp2.getActive()
    for (let mm = 0; mm < 12; mm++) {
      spreadsheet2.getSheetByName(Consts.month_name.short[mm]).showSheet()
    }
  }

  static resetMonthsColoring () {
    const spreadsheet2 = SpreadsheetApp2.getActive()
    const initialMonth = SettingsUser.get('initial_month')

    let mm = 0
    for (; mm < initialMonth; mm++) {
      spreadsheet2.getSheetByName(Consts.month_name.short[mm]).setTabColor('#b7b7b7')
    }

    for (; mm < 12; mm++) {
      spreadsheet2.getSheetByName(Consts.month_name.short[mm]).setTabColor('#a4c2f4')
    }
  }

  static resetTabsColoring () {
    const spreadsheet2 = SpreadsheetApp2.getActive()
    const initialMonth = SettingsUser.get('initial_month')

    spreadsheet2.getSheetByName('Summary').setTabColor('#e69138')

    let mm = 0
    for (; mm < initialMonth; mm++) {
      spreadsheet2.getSheetByName(Consts.month_name.short[mm]).setTabColor('#b7b7b7')
    }

    for (; mm < 12; mm++) {
      spreadsheet2.getSheetByName(Consts.month_name.short[mm]).setTabColor('#a4c2f4')
    }

    spreadsheet2.getSheetByName('Tags').setTabColor('#e69138')
    spreadsheet2.getSheetByName('Cash Flow').setTabColor('#e69138')

    spreadsheet2.getSheetByName('_Settings').setTabColor('#cc0000')
    spreadsheet2.getSheetByName('_Backstage').setTabColor('#cc0000')
    spreadsheet2.getSheetByName('_Unique').setTabColor('#cc0000')

    spreadsheet2.getSheetByName('_About BnS').setTabColor('#6aa84f')
  }

  static resetTabsPosition () {
    const spreadsheet2 = SpreadsheetApp2.getActive()
    const spreadsheet = spreadsheet2.spreadsheet

    spreadsheet2.getSheetByName('Summary').activate()
    spreadsheet.moveActiveSheet(1)

    for (let mm = 0; mm < 12; mm++) {
      spreadsheet2.getSheetByName(Consts.month_name.short[mm]).activate()
      spreadsheet.moveActiveSheet(2 + mm)
    }

    spreadsheet2.getSheetByName('Cash Flow').activate()
    spreadsheet.moveActiveSheet(14)

    spreadsheet2.getSheetByName('Tags').activate()
    spreadsheet.moveActiveSheet(15)
  }
}
