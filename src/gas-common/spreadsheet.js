function copySheetsFromSource_ () {
  const source = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
  const destination = SpreadsheetApp2.getActiveSpreadsheet();
  const sheets = destination.getSheets();
  let i;

  const list = APPS_SCRIPT_GLOBAL.template_sheets;

  for (i = 0; i < list.length; i++) {
    source.getSheetByName(list[i])
      .copyTo(destination)
      .setName(list[i]);
  }

  for (i = 0; i < sheets.length; i++) {
    destination.deleteSheet(sheets[i]);
  }
}

function deleteAllSheets_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();

  sheets[0].showSheet();
  spreadsheet.setActiveSheet(sheets[0]);

  for (let i = sheets.length - 1; i > 0; i--) {
    spreadsheet.deleteSheet(sheets[i]);
  }

  spreadsheet.insertSheet();
  spreadsheet.deleteSheet(sheets[0]);
}

function isMissingSheet () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

  const sheets = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', '_Settings', 'Cash Flow', 'Tags', '_Backstage', 'Cards', 'Summary'];

  for (let i = 0; i < sheets.length; i++) {
    if (!spreadsheet.getSheetByName(sheets[i])) return true;
  }

  return false;
}

function isTemplateAvailable () {
  try {
    SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
  } catch (err) {
    console.error('Spreadsheet template is not available!');
    return false;
  }

  return true;
}
