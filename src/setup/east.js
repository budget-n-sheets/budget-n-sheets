function setupEast_ (yyyy_mm) {
  const spreadsheet = SPREADSHEET;
  let sheets, sheet;
  let md, t, i;

  const init_month = SETUP_SETTINGS.init_month;

  if (yyyy_mm.yyyy === SETUP_SETTINGS.financial_year) {
    t = true;
    md = getMonthDelta(yyyy_mm.mm);
  } else {
    t = false;
  }

  sheets = [];
  for (i = 0; i < 12; i++) {
    sheets[i] = spreadsheet.getSheetByName(MN_SHORT[i]);
  }

  sheet = spreadsheet.getSheetByName('Summary');
  spreadsheet.setActiveSheet(sheet);
  sheet.setTabColor('#e69138');

  for (i = 0; i < 12; i++) {
    sheet = sheets[i];

    if (i < init_month) {
      if (t && (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1])) {
        sheet.setTabColor('#b7b7b7');
      } else {
        sheet.setTabColor('#b7b7b7');
      }
    } else if (t) {
      if (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1]) {
        sheet.setTabColor('#a4c2f4');
      } else {
        sheet.setTabColor('#3c78d8');
      }
    } else {
      sheet.setTabColor('#a4c2f4');
    }
  }

  if (t) {
    sheets[yyyy_mm.mm].setTabColor('#6aa84f');
  }

  spreadsheet.getSheetByName('Cards').setTabColor('#e69138');
  spreadsheet.getSheetByName('Cash Flow').setTabColor('#e69138');
  spreadsheet.getSheetByName('Tags').setTabColor('#e69138');
  spreadsheet.getSheetByName('_Backstage').setTabColor('#cc0000');
  spreadsheet.getSheetByName('_Settings').setTabColor('#cc0000');
  spreadsheet.getSheetByName('Quick Actions').setTabColor('#6aa84f');
  spreadsheet.getSheetByName('_About BnS').setTabColor('#6aa84f');

  if (t) {
    for (i = 0; i < 12; i++) {
      sheet = sheets[i];

      if (i < init_month && (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1])) {
        sheet.hideSheet();
      } else if (i < yyyy_mm.mm + md[0] || i > yyyy_mm.mm + md[1]) {
        sheet.hideSheet();
      }
    }

    if (yyyy_mm.mm === 11) {
      sheets[8].showSheet();
    }
  }

  spreadsheet.getSheetByName('_Backstage').hideSheet();
  spreadsheet.getSheetByName('_Settings').hideSheet();
  spreadsheet.getSheetByName('_About BnS').hideSheet();

  SpreadsheetApp.flush();
}
