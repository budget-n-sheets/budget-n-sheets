function blankRows_ (name) {
  let sheet;

  if (!name) {
    sheet = SpreadsheetApp.getActiveSheet();
    name = sheet.getSheetName();
  } else {
    sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(name);
    if (!sheet) return;
  }

  const maxRows = sheet.getMaxRows();
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

  if (maxRows < header + 3) return;

  insertRowsBefore_(sheet, maxRows);
}

function insertRowsBefore_ (sheet, maxRows) {
  const num = 400;

  sheet.insertRowsBefore(maxRows, num);

  if (sheet.getLastRow() === maxRows + num) {
    const maxCols = sheet.getMaxColumns();
    const values = sheet.getRange(maxRows + num, 1, 1, maxCols).getValues();

    sheet.getRange(maxRows + num, 1, 1, maxCols).clearContent();
    sheet.getRange(maxRows, 1, 1, maxCols).setValues(values);
  }

  SpreadsheetApp.flush();
}
