const SpreadsheetApp2 = {
  _spreadsheet: null,
  _ui: null,

  getUi: function () {
    return this._ui || (this._ui = SpreadsheetApp.getUi());
  },

  getActiveSpreadsheet: function () {
    return this._spreadsheet || (this._spreadsheet = SpreadsheetApp.getActiveSpreadsheet());
  }
};

function mergeEventsInTable_ (sheet, data, dest) {
  if (data.table.length === 0) return;

  const _s = {};
  if (dest.name === 'accs') {
    if (dest.k > 5) return;

    _s.row = 5;
    _s.offset = 1 + 5 * dest.k;
    _s.width = 4;
    _s.col = 2;
  } else if (dest.name === 'cards') {
    if (dest.k > 11) return;

    _s.row = 6;
    _s.offset = 1 + 6 * dest.k;
    _s.width = 5;
    _s.col = 3;
  }

  const lastRow = sheet.getLastRow();
  let table, i;

  {
    const num = (lastRow < _s.row ? _s.row - 1 : lastRow) + data.table.length;
    while (sheet.getMaxRows() < num) {
      blankRows_(sheet.getName());
    }
  }

  if (lastRow < _s.row) {
    i = 0;
    table = data.table;
  } else {
    table = sheet.getRange(_s.row, _s.offset, lastRow - _s.row + 1, _s.width).getValues();

    i = 0;
    while (i < table.length && table[i][_s.col] !== '') { i++; }

    if (i < table.length) {
      table.splice.apply(table, [i, 0].concat(data.table));
    } else {
      table = table.concat(data.table);
    }
  }

  sheet.getRange(_s.row, _s.offset, table.length, _s.width).setValues(table);

  const value = transpose([data.values]);
  sheet.getRange(_s.row + i, _s.offset + _s.col, value.length, 1).setFormulas(value);
}

function updateDecimalPlaces_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet, max;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const num_acc = getConstProperties_('number_accounts');
  const col = 2 + w_ + w_ * num_acc;

  const dec_p = getSpreadsheetSettings_('decimal_places');
  const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
  const number_format = '#,##0' + dec_c + ';' + '(#,##0' + dec_c + ')';

  sheet = spreadsheet.getSheetByName('_Settings');
  if (sheet) {
    sheet.getRange(8, 2).setNumberFormat('0' + dec_c).setFormula('RAND()');
    sheet.getRange(9, 2).setValue(dec_p);
    sheet.getRange(11, 2).setValue(number_format);
  }

  sheet = spreadsheet.getSheetByName('Summary');
  if (sheet) {
    sheet.getRangeList([
      'D9:I22', 'D25:G36', 'D55:E65', 'D75:E88', 'I75:K86'
    ])
      .setNumberFormat(number_format);
  }

  for (let i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    if (!sheet) continue;

    max = sheet.getMaxRows() - 4;
    if (max < 1) continue;

    const list = [];
    for (let k = 0; k < num_acc; k++) {
      list[k] = rollA1Notation(5, 8 + 5 * k, max, 1);
    }
    list.push(rollA1Notation(5, 3, max, 1));

    sheet.getRangeList(list).setNumberFormat(number_format);
  }

  sheet = spreadsheet.getSheetByName('Cards');
  max = (sheet ? sheet.getMaxRows() - 5 : 0);
  if (max > 0) {
    const list = [];
    for (let i = 0; i < 12; i++) {
      list[i] = rollA1Notation(6, 4 + 6 * i, max, 1);
    }

    sheet.getRangeList(list).setNumberFormat(number_format);
  }

  sheet = spreadsheet.getSheetByName('Cash Flow');
  if (sheet) {
    const list = [];
    for (let i = 0; i < 12; i++) {
      list[i] = rollA1Notation(4, 2 + 4 * i, 31, 2);
    }
    sheet.getRangeList(list).setNumberFormat(number_format);
  }

  sheet = spreadsheet.getSheetByName('Tags');
  max = (sheet ? sheet.getMaxRows() - 1 : 0);
  if (max > 0) {
    sheet.getRange(2, 6, max, 12).setNumberFormat(number_format);
    sheet.getRange(2, 19, max, 2).setNumberFormat(number_format);
  }

  sheet = spreadsheet.getSheetByName('_Backstage');
  if (sheet) {
    sheet.getRange(2, 2, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).setNumberFormat(number_format);
  }
}

function updateDecimalSeparator_ () {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet, cell, t;

  const dec_p = getSpreadsheetSettings_('decimal_places');
  const format = '0' + (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '.0');

  sheet = spreadsheet.getSheetByName('_Settings');
  if (!sheet) {
    sheet = spreadsheet.insertSheet();
    t = true;
  }

  cell = sheet.getRange(8, 2);

  cell.setNumberFormat(format);
  cell.setFormula('RAND()');
  SpreadsheetApp.flush();

  cell = cell.getDisplayValue();
  const v = /\./.test(cell);
  if (dec_p === 0) sheet.getRange(8, 2).setNumberFormat('0');

  if (t) spreadsheet.deleteSheet(sheet);
  else sheet.getRange(10, 2).setValue(v);

  setSpreadsheetSettings_('decimal_separator', v);
  setSpreadsheetSettings_('spreadsheet_locale', spreadsheet.getSpreadsheetLocale());
}

function updateHideShowSheets (sheets, financial_year, yyyy, mm) {
  let delta;

  if (mm === 0) {
    if (yyyy === financial_year) {
      for (i = 0; i < 4; i++) {
        if (sheets[i]) sheets[i].showSheet();
      }
      for (; i < 12; i++) {
        if (sheets[i]) sheets[i].hideSheet();
      }
    } else {
      for (i = 0; i < 12; i++) {
        if (sheets[i]) sheets[i].showSheet();
      }
    }
  } else {
    delta = getMonthDelta(mm);

    for (i = 0; i < 12; i++) {
      if (i < mm + delta[0] || i > mm + delta[1]) {
        if (sheets[i]) sheets[i].hideSheet();
      } else {
        if (sheets[i]) sheets[i].showSheet();
      }
    }
  }
}

function updateTabsColors (sheets, financial_year, yyyy, mm) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let date, delta, i;

  const init_month = getUserSettings_('initial_month');

  if (!sheets) {
    date = getLocaleDate();
    yyyy = date.getFullYear();
    mm = date.getMonth();

    sheets = [];
    for (i = 0; i < 12; i++) {
      sheets[i] = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    }

    financial_year = getConstProperties_('financial_year');
  }

  for (i = 0; i < init_month; i++) {
    if (sheets[i]) sheets[i].setTabColor('#b7b7b7');
  }

  if (financial_year === yyyy) {
    delta = getMonthDelta(mm);

    for (; i < 12; i++) {
      if (i < mm + delta[0] || i > mm + delta[1]) {
        if (sheets[i]) sheets[i].setTabColor('#a4c2f4');
      } else {
        if (sheets[i]) sheets[i].setTabColor('#3c78d8');
      }
    }

    if (sheets[mm]) sheets[mm].setTabColor('#6aa84f');
  } else {
    for (; i < 12; i++) {
      if (sheets[i]) sheets[i].setTabColor('#a4c2f4');
    }
  }
}
