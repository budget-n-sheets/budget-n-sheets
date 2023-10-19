/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheetSummary extends MakeSheet {
  constructor () {
    super(MakeSheetSummary.metadata);
  }

  static get metadata () {
    return {
      name: 'Summary',
      requires: ['_Settings', '_Backstage']
    }
  }

  make () {
    new SheetSummary().resetDefault()
    SpreadsheetApp.flush();
  }

  makeConfig () {
    return this;
  }
}
