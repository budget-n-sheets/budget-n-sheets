/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function treatLayout_ (yyyy, mm) {
  const spreadsheet = SpreadsheetApp3.getActive();
  const financial_year = SettingsConst.get('financial_year');
  let month, i;

  if (financial_year > yyyy) return; // Too soon to format the spreadsheet.
  else if (financial_year < yyyy) mm = 0; // Last time to format the spreadsheet.

  const sheets = [];
  for (i = 0; i < 12; i++) {
    sheets[i] = spreadsheet.getSheetByName(Consts.month_name.short[i]);
  }

  if (mm === 0) {
    if (yyyy === financial_year) month = 0;
    else month = 11;
  } else {
    month = mm - 1;
  }

  updateHideShowSheets(sheets, financial_year, yyyy, mm);
  updateTabsColors(sheets, financial_year, yyyy, mm);

  const formatAccs = new FormatTableAccounts(month);
  formatAccs.indexes = [0, 1, 2, 3, 4, 5];
  formatAccs.format();

  const formatCards = new FormatTableCards();
  formatCards.indexes = [month];
  formatCards.format();
}
