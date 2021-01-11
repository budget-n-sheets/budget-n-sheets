function postEventsForDate_ (date) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let sheet;

  let list_eventos, evento;
  let value, tags;
  let c1, a, c, i, j, k;

  const calendar = getFinancialCalendar_();
  if (!calendar) return;
  list_eventos = calendar.getEventsForDay(date);
  if (list_eventos.length === 0) return;
  list_eventos = calendarDigestListEvents_(list_eventos);

  const mm = date.getMonth();
  const dd = date.getDate();

  const dec_p = getSpreadsheetSettings_('decimal_separator');
  const num_acc = getConstProperties_('number_accounts') + 1;

  const accounts = [];
  for (k = 0; k < num_acc; k++) {
    accounts[k] = {
      table: [],
      values: []
    };
  }

  const cards_balances = getTablesService_('cardsbalances');
  const hasCards = (cards_balances && cards_balances !== 1);

  c1 = 0;
  const cards = {
    table: [],
    values: []
  };

  i = -1;
  while (++i < list_eventos.length) {
    evento = list_eventos[i];

    if (evento.Description === '') continue;
    if (evento.hasAtMute) continue;

    if (!isNaN(evento.Value)) {
      value = evento.Value;
    } else if (hasCards && evento.hasQcc) {
      if (evento.Card !== -1) {
        c = cards_balances.cards.indexOf(evento.Card);
        if (c === -1) continue;
      } else {
        c = 0;
      }

      if (evento.TranslationType === 'M' &&
          mm + evento.TranslationNumber >= 0 &&
          mm + evento.TranslationNumber <= 11) {
        value = +cards_balances.balance[c][mm + evento.TranslationNumber].toFixed(2);
      } else if (mm > 0) {
        value = +cards_balances.balance[c][mm - 1].toFixed(2);
      } else {
        value = 0;
      }
    } else if (evento.Tags.length > 0) {
      value = 0;
    } else {
      continue;
    }
    value = FormatNumber.localeSignal(value);

    if (evento.Tags.length > 0) tags = '#' + evento.Tags.join(' #');
    else tags = '';

    if (evento.Table !== -1) {
      k = evento.Table;
      accounts[k].table.push([dd, evento.Title, '', tags]);
      accounts[k].values.push(value);
    } else if (evento.Card !== -1) {
      cards.table[c1] = [dd, evento.Title, evento.Card, '', tags];
      cards.values[c1] = value;
      c1++;
    }
  }

  if (cards.table.length > 0) {
    sheet = spreadsheet.getSheetByName('Cards');
    if (sheet) {
      mergeEventsInTable_(sheet, cards, 6, 1 + 6 * mm, 5, 3);
    }
  }

  sheet = spreadsheet.getSheetByName(MONTH_NAME.short[mm]);
  if (!sheet) return;

  for (k = 0; k < num_acc; k++) {
    if (accounts[k].table.length === 0) continue;
    mergeEventsInTable_(sheet, accounts[k], 5, 1 + 5 * k, 4, 2);
  }
}

function mergeEventsInTable_ (sheet, data, row, offset, width, col) {
  const lastRow = sheet.getLastRow();
  let table, i;

  if (sheet.getMaxRows() < lastRow + data.table.length) {
    addBlankRows_(sheet.getName());
  }

  if (lastRow < row) {
    i = 0;
    table = data.table;
  } else {
    table = sheet.getRange(row, offset, lastRow - row + 1, width).getValues();

    i = 0;
    while (i < table.length && table[i][col] !== '') { i++; }
    if (i < table.length) {
      table.splice.apply(table, [i, 0].concat(data.table));
    } else {
      table = table.concat(data.table);
    }
  }

  sheet.getRange(row, offset, table.length, width).setValues(table);

  const value = transpose([data.values]);
  sheet.getRange(row + i, offset + col, value.length, 1).setFormulas(value);
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
  }

  sheet = spreadsheet.getSheetByName('Summary');
  if (sheet) {
    sheet.getRangeList([
      'D9:I22', 'D25:G36', 'D53:E63', 'D73:E86', 'I73:K84'
    ])
      .setNumberFormat(number_format);
  }

  const buildMonth = FormulaBuild.ttt().header();
  for (let i = 0; i < 12; i++) {
    sheet = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    if (!sheet) continue;

    max = sheet.getMaxRows() - 4;
    if (max < 1) continue;

    const list = [];
    for (let k = 0; k < num_acc; k++) {
      list[k] = rollA1Notation(5, 8 + 5 * k, max, 1);

      formula = buildMonth.report(k, i);
      sheet.getRange(1, 8 + 5 * k).setFormula(formula);
    }
    list.push(rollA1Notation(5, 3, max, 1));

    sheet.getRangeList(list).setNumberFormat(number_format);
  }

  sheet = spreadsheet.getSheetByName('Cards');
  max = (sheet ? sheet.getMaxRows() - 5 : 0);
  const buildCards = FormulaBuild.cards().header();
  if (max > 0) {
    const list = [];
    for (let i = 0; i < 12; i++) {
      const head = rollA1Notation(2, 1 + 6 * i);
      const cell = '_Backstage!' + rollA1Notation(2 + h_ * i, col);

      list[i] = rollA1Notation(6, 4 + 6 * i, max, 1);

      let formula = 'OFFSET(' + cell + '; 4; 1 + 5*' + head + '; 1; 1)';
      formula = 'TEXT(' + formula + '; "' + number_format + '")';
      formula = 'IF(' + rollA1Notation(2, 2 + 6 * i) + ' = "All"; ""; ' + formula + ')';
      formula = 'CONCATENATE("AVAIL credit: "; ' + formula + ')';

      const testBuild = buildCards.avail_credit(i, cell);
      if (formula !== testBuild) ConsoleLog.warn('Formula build failed: FormulaBuild.cards().header().avail_credit()');

      sheet.getRange(3, 1 + 6 * i).setFormula(formula);

      formula = buildCards.report(head, cell);
      sheet.getRange(2, 4 + 6 * i).setFormula(formula);
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

  setSpreadsheetSettings_('decimal_separator', v);
  setSpreadsheetSettings_('spreadsheet_locale', spreadsheet.getSpreadsheetLocale());
}

function treatLayout_ (yyyy, mm) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const financial_year = getConstProperties_('financial_year');
  let month, i;

  if (financial_year > yyyy) return; // Too soon to format the spreadsheet.
  else if (financial_year < yyyy) mm = 0; // Last time to format the spreadsheet.

  const sheets = [];
  for (i = 0; i < 12; i++) {
    sheets[i] = spreadsheet.getSheetByName(MONTH_NAME.short[i]);
  }

  if (mm === 0) {
    if (yyyy === financial_year) month = 0;
    else month = 11;
  } else {
    month = mm - 1;
  }

  updateHideShowSheets(sheets, financial_year, yyyy, mm);
  updateTabsColors(sheets, financial_year, yyyy, mm);
  formatAccounts_(month);
  formatCards_(month);
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
    date = getSpreadsheetDate();
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
