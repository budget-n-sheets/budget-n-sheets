/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupUtils {
  static showSetupNotice () {
    SpreadsheetApp2.getUi().alert(
      'Notice',
      `Due to a bug with Google Sheets, if you experience
      any issues with the "Start budget spreadsheet" dialog,
      please use your browser in incognito/private mode
      and try again.

      Learn more at budgetnsheets.com/notice-to-x-frame`,
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }
}
