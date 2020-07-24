var QUICKSTART_ACC_CARDS = Object.freeze({
  3: [
    [7, 'Online shopping 1/3 (with instalments in d/d format)', null, null, null, null,
      -7, 'Online shopping 2/3 (with instalments in d/d format)', null, null, null, null,
      -7, 'Online shopping 3/3 (with instalments in d/d format)', null, null, null, null],
    [null, null, null, null, null, null,
      3, 'Grocery shop', null, -10, null, null,
      null, null, null, null, null, null],
    [null, null, null, null, null, null,
      5, 'Gas station', null, null, null, null,
      null, null, null, null, null, null],
    [null, null, null, null, null, null,
      5, 'Grocery shop refund', null, 10, null, null,
      null, null, null, null, null, null]
  ],
  4: [[7, null, null, '#qcc']]
});

function playQuickAccCards_ (n) {
  if (n === 1) {
    const db_acc = getDbTables_('accounts');
    showDialogEditAccount(db_acc.ids[0]);
    return;
  }

  switch (n) {
    case 2:
      showDialogAddCard();
      return;
    case 3:
    case 4:
      break;

    default:
      throw new Error('playQuickAccCards_(): Switch case is default. ' + n);
  }

  const db_cards = getDbTables_('cards');
  if (db_cards.count === 0) {
    showDialogAddCard();
    return;
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet, lastRow, col;
  var data, name, val, mm;

  const code = db_cards.codes[0];
  const financial_year = getConstProperties_('financial_year');

  if (n === 3) {
    name = 'Cards';
  } else {
    if (financial_year === DATE_NOW.getFullYear()) name = MN_SHORT[DATE_NOW.getMonth()];
    else name = MN_SHORT[0];
  }

  sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    alertQuickstartSheetMissing(name);
    return;
  }

  spreadsheet.setActiveSheet(sheet);
  lastRow = sheet.getLastRow();

  data = QUICKSTART_ACC_CARDS[n];
  if (!data) throw new Error("Values for quickstart example couldn't be found. acc_cards:" + n);

  if (n === 3) {
    if (lastRow < 5) lastRow = 5;
    if (financial_year === DATE_NOW.getFullYear()) {
      mm = DATE_NOW.getMonth();
      if (mm === 0) mm = 1;
      else if (mm === 11) mm = 10;
    } else {
      mm = 1;
    }

    col = 1 + 6 * mm - 6;
    val = randomValueNegative(2, 2);

    data[0][2] = code;
    data[0][3] = val;
    data[0][8] = code;
    data[0][9] = val;
    data[0][14] = code;
    data[0][15] = val;
    data[1][8] = code;
    data[2][8] = code;
    data[2][9] = randomValueNegative(3, 2);
    data[3][8] = code;
  } else {
    if (lastRow < 4) lastRow = 4;

    col = 6;
    data[0][1] = code + ' bill payment';
    data[0][2] = randomValueNegative(3, 2);
  }

  if (sheet.getMaxRows() < lastRow + data.length) {
    toolPicker_('AddBlankRows', sheet.getName());
  }

  sheet.getRange(lastRow + 1, col, data.length, data[0].length)
    .setValues(data)
    .activate();

  SpreadsheetApp.flush();
  if (n === 4) fillMonthWithZeros(sheet);
  else fillCardWithZeros(sheet, col);
}
