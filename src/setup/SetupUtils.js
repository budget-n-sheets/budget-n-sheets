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
