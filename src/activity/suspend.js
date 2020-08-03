function suspendActivity_ (mm) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('_Backstage');
  const h_ = TABLE_DIMENSION.height;

  if (!sheet) return;
  const max = sheet.getMaxColumns();

  const range = sheet.getRange(2, 2, h_ * mm, max - 1);
  const values = range.getValues();
  range.setValues(values);

  SpreadsheetApp.flush();
}
