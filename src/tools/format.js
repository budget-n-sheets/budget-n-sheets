function validateFormatRegistry_ () {
  const ranges = SpreadsheetApp.getActiveRangeList().getRanges();
  const name = ranges[0].getSheet().getSheetName();

  if (name === 'Tags') {
    formatTags_();
  } else if (name === 'Cards') {
    for (let i = 0; i < ranges.length; i++) {
      let mm = ranges[i].getColumn() - 1;

      if (mm % 6 === 0 && ranges[i].getNumColumns() === 5) {
        if (ranges[i].getNumRows() > 1) sortCardsRange_(ranges[i]);
      } else {
        mm = (mm - (mm % 6)) / 6;
        formatCards_(mm);
      }
    }
  } else {
    const mm = MONTH_NAME.short.indexOf(name);

    if (mm === -1) {
      SpreadsheetApp2.getUi().alert(
        "Can't sort registry",
        'Select a month, Cards or Tags to sort the registry.',
        SpreadsheetApp2.getUi().ButtonSet.OK);
      return;
    }

    let t = true;

    for (let i = 0; i < ranges.length; i++) {
      if ((ranges[i].getColumn() - 1) % 5 === 0 && ranges[i].getNumColumns() === 4) {
        if (ranges[i].getNumRows() > 1) sortAccountsRange_(ranges[i]);
      } else if (t) {
        formatAccounts_(mm);
        t = false;
      }
    }
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
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(MONTH_NAME.short[mm]);
  if (!sheet) return;

  const num_acc = SettingsConst.getValueOf('number_accounts');

  if (sheet.getMaxColumns() < 5 + 5 * num_acc) return;

  const numRows = sheet.getLastRow() - 4;
  if (numRows < 1) return;

  sheet.showRows(5, numRows);

  const range = sheet.getRange(5, 1, numRows, 5 * (1 + num_acc));
  const snapshot = range.getValues();

  for (let k = 0; k < 1 + num_acc; k++) {
    const col = 5 * k;

    let i = 0;
    while (i < snapshot.length && snapshot[i][2 + col] !== '') { i++; }

    if (i === 0) continue;

    const rangeOffset = range.offset(0, col, i, 4);
    sortAccountsRange_(rangeOffset);
  }

  const date1 = DATE_NOW.getTime();
  let date2 = SettingsConst.getValueOf('financial_year');
  date2 = new Date(date2, mm + 1, 0).getTime();

  const maxRows = sheet.getMaxRows();
  if (numRows + 4 < maxRows && date2 < date1) sheet.hideRows(numRows + 5, maxRows - numRows - 4);
}

function sortAccountsRange_ (range) {
  const col = range.getColumn() - 1;

  range.sort([
    { column: (1 + col), ascending: true },
    { column: (3 + col), ascending: true }
  ]);

  const snapshot = range.getValues();

  let i = 0;
  while (i < snapshot.length && snapshot[i][0] < 0) { i++; }
  if (i < 2) return;

  range.offset(0, 0, i, 4).sort({ column: 1 + col, ascending: false });
}

function formatCards_ (mm) {
  const w_ = 6;

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
  if (!sheet) return;

  const numRows = sheet.getLastRow() - 5;
  if (numRows < 1) return;

  let range = sheet.getRange(6, 4 + w_ * mm, numRows, 1);
  const snapshot = range.getValues();

  let i = 0;
  while (i < snapshot.length && snapshot[i][0] !== '') { i++; }
  if (i === 0) return;

  range = range.offset(0, -3, i, 5);
  sortCardsRange_(range);
}

function sortCardsRange_ (range) {
  const col = range.getColumn() - 1;

  range.sort([
    { column: (3 + col), ascending: true },
    { column: (1 + col), ascending: true },
    { column: (4 + col), ascending: true }
  ]);

  const snapshot = range.getValues();

  let i = 0;
  let j = 0;
  let num = 0;
  while (i < snapshot.length) {
    const card = snapshot[i][2];

    num = j;
    while (j < snapshot.length && snapshot[j][2] === card && snapshot[j][0] < 0) { j++; }

    num = j - num;
    if (num > 1) range.offset(i, 0, num, 5).sort({ column: 1 + col, ascending: false });

    while (j < snapshot.length && snapshot[j][2] === card) { j++; }
    i = j;
  }
}
