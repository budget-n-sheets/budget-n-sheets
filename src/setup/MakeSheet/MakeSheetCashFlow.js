/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetCashFlow extends MakeSheet {
  constructor () {
    super(MakeSheetCashFlow.metadata)
  }

  static get metadata () {
    return {
      name: 'Cash Flow',
      requires: ['_Backstage']
    }
  }

  make () {
    new SheetCashFlow().resetDefault().resetWeekendColoring()
    const service = new AccountsService()
    service.initSpreadsheet_()
    service.updateReferences_()
    SpreadsheetApp.flush()
  }

  makeConfig () {
    return this
  }
}
