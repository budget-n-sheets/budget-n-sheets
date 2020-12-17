function setupWest_ () {
  SPREADSHEET.getSheetByName('_About BnS')
    .protect()
    .setWarningOnly(true);

  const sheet = SPREADSHEET.getSheetByName('Quick Actions');

  const ranges = [];
  ranges[0] = sheet.getRange(3, 3, 3, 1);
  ranges[1] = sheet.getRange(8, 3, 2, 1);
  ranges[2] = sheet.getRange(12, 2, 1, 2);

  sheet.protect()
    .setUnprotectedRanges(ranges)
    .setWarningOnly(true);

  SpreadsheetApp.flush();
}
