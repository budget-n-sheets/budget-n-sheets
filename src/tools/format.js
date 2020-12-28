function validateFormatRegistry_ () {
  const range = SpreadsheetApp.getActiveRange();
  const sheet = range.getSheet();
  const name = sheet.getSheetName();
  let mm;

  if (name === 'Cards') {
    mm = range.getColumn();
    mm = (mm - (mm % 6)) / 6;
    formatCards_(mm);
  } else if (name === 'Tags') {
    formatTags_();
  } else {
    mm = MN_SHORT.indexOf(name);
    if (mm === -1) {
      SpreadsheetApp.getUi().alert(
        "Can't sort registry",
        'Select a month, Cards or Tags to sort the registry.',
        SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    formatAccounts_(mm);
  }
}

function formatTags_ () {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');
  if (!sheet) return;

  const maxRows = sheet.getMaxRows() - 1;
  if (maxRows < 1) return;

  sheet.getRange(2, 1, maxRows, 5).sort([
    { column: 2, ascending: true },
    { column: 1, ascending: true }
  ]);
  sheet.getRange(2, 4, maxRows, 1).insertCheckboxes();
  SpreadsheetApp.flush();
}

function formatAccounts_ (mm) {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(MN_SHORT[mm]);
  let date2;
  let table;
  let cc, n, i, k;

  const w_ = TABLE_DIMENSION.width;
  const num_acc = getConstProperties_('number_accounts');

  if (!sheet) return;
  if (sheet.getMaxColumns() < 5 + 5 * num_acc) return;

  const lastRow = sheet.getLastRow() - 4;
  if (lastRow < 1) return;

  sheet.showRows(5, lastRow);

  const snapshot = sheet.getRange(5, 1, lastRow, w_ * (1 + num_acc)).getValues();

  for (k = 0; k < 1 + num_acc; k++) {
    i = 0;
    cc = w_ * k;
    while (i < lastRow && snapshot[i][2 + cc] !== '') { i++; }

    if (i === 0) continue;

    n = i;
    range = sheet.getRange(5, 1 + cc, n, 4);

    range.sort([
      { column: (1 + cc), ascending: true },
      { column: (3 + cc), ascending: true }
    ]);

    i = 0;
    table = range.getValues();
    while (i < n && table[i][0] < 0) { i++; }

    if (i > 1) sheet.getRange(5, 1 + cc, i, 4).sort({ column: 1 + cc, ascending: false });
  }

  const date1 = DATE_NOW.getTime();
  date2 = getConstProperties_('financial_year');
  date2 = new Date(date2, mm + 1, 0).getTime();

  n = sheet.getMaxRows();
  if (lastRow + 4 < n && date2 < date1) sheet.hideRows(lastRow + 5, n - lastRow - 4);
}

function formatCards_ (mm) {
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
  let table, card;
  let c, n;
  let i, j;

  if (!sheet) return;

  const w_ = 6;
  const cc = w_ * mm;

  const lastRow = sheet.getLastRow();
  if (lastRow < 6) return;

  i = 0;
  n = lastRow - 5;
  table = sheet.getRange(6, 4 + cc, n, 1).getValues();
  while (i < n && table[i][0] !== '') { i++; }

  if (i === 0) return;
  n = i;

  sheet.getRange(6, 1 + w_ * mm, n, 5).sort([
    { column: (3 + cc), ascending: true },
    { column: (1 + cc), ascending: true },
    { column: (4 + cc), ascending: true }
  ]);

  i = 0;
  j = 0;
  table = sheet.getRange(6, 1 + cc, n, 5).getValues();
  while (i < n) {
    c = j;
    card = table[i][2];
    while (j < n && table[j][2] === card && table[j][0] < 0) { j++; }
    c = j - c;

    if (c > 1) sheet.getRange(6 + i, 1 + cc, c, 5).sort({ column: 1 + cc, ascending: false });

    while (j < n && table[j][2] === card) { j++; }
    i = j;
  }
}
