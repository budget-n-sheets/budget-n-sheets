function addBlankRows_ (name) {
  let sheet, c;

  if (!name) {
    sheet = SpreadsheetApp.getActiveSheet();
    name = sheet.getSheetName();
  }

  if (name === 'Cards') c = 5;
  else if (name === 'Tags') c = 1;
  else if (MN_SHORT.indexOf(name) !== -1) c = 4;
  else {
    SpreadsheetApp.getUi().alert(
      "Can't add rows",
      'Select a month, Cards or Tags to add rows.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  if (!sheet) {
    sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(name);
    if (!sheet) return;
  }

  let maxRows = sheet.getMaxRows();
  let maxCols, values;

  const n = 400;

  if (maxRows < c + 3) return;

  if (sheet.getLastRow() === maxRows) {
    maxCols = sheet.getMaxColumns();
    values = sheet.getRange(maxRows, 1, 1, maxCols).getValues();
  }

  sheet.insertRowsBefore(maxRows, n);
  maxRows += n;

  if (values) {
    sheet.getRange(maxRows, 1, 1, maxCols).clearContent();
    sheet.getRange(maxRows - n, 1, 1, maxCols).setValues(values);
  }

  SpreadsheetApp.flush();
}
