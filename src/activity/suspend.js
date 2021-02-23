function suspendActivity_ (mm0, mm1) {
  if (mm0 > mm1) throw new Error('suspendActivity_(): Invalid range.');

  const h_ = TABLE_DIMENSION.height;

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('_Backstage');
  if (!sheet) return;

  const max = sheet.getMaxColumns();
  if (max < 2) return;

  const range = sheet.getRange(2 + h_ * mm0, 2, h_ * (mm1 - mm0 + 1), max - 1);

  SpreadsheetApp.flush();
  const values = range.getValues();
  range.setValues(values);

  const optimize_load = new Array(12).fill(false);

  for (let i = mm0; i <= mm1; i++) {
    optimize_load[i] = true;
  }

  setSpreadsheetSettings_('optimize_load', optimize_load);
  SpreadsheetApp.flush();
}
