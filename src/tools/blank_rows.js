function blankRows_ (name) {
  let sheet;

  if (!name) {
    sheet = SpreadsheetApp.getActiveSheet();
    name = sheet.getSheetName();
  } else {
    sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(name);
    if (!sheet) return;
  }

  let header;

  if (name === 'Cards') header = 5;
  else if (name === 'Tags') header = 1;
  else if (MONTH_NAME.short.indexOf(name) !== -1) header = 4;
  else {
    if (!name) {
      SpreadsheetApp2.getUi().alert(
        "Can't add rows",
        'Select a month, Cards or Tags to add rows.',
        SpreadsheetApp2.getUi().ButtonSet.OK);
    }
    return;
  }

  if (sheet.getMaxRows() < header + 3) return;

  insertRowsBefore_(sheet);
}

function insertRowsBefore_ (sheet) {
  const maxRows = sheet.getMaxRows();
  const num = 400;

  sheet.insertRowsBefore(maxRows, num);

  if (sheet.getLastRow() === maxRows + num) {
    const maxCols = sheet.getMaxColumns();
    const rangeOff = sheet.getRange(maxRows + num, 1, 1, maxCols);

    const values = rangeOff.getValues();

    rangeOff.clearContent();
    rangeOff.offset(0 - num, 0).setValues(values);
  }

  SpreadsheetApp.flush();
}
