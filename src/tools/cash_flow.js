function validateUpdateCashFlow_ () {
  if (onlineUpdate_()) return;

  var range = SpreadsheetApp.getActiveRange();
  var name = range.getSheet().getSheetName();
  var mm;

  if (name === 'Cash Flow') {
    mm = range.getColumn() - 1;
    mm = (mm - (mm % 4)) / 4;
  } else {
    mm = MN_SHORT.indexOf(name);
    if (mm === -1) {
      SpreadsheetApp.getUi().alert(
        "Can't update cash flow",
        'Select a month or Cash Flow to update cash flow.',
        SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
  }

  updateCashFlow_(mm);
}

function updateCashFlow_ (mm) {
  console.time('tool/update-cash-flow');
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Cash Flow');
  if (!sheet) return;

  const dec_p = getSpreadsheetSettings_('decimal_separator');
  const num_acc = getConstProperties_('number_accounts');
  const financial_year = getConstProperties_('financial_year');

  const dd = new Date(financial_year, mm + 1, 0).getDate();
  const tags = (getUserSettings_('override_zero') ? getTagData_() : false);
  const eventos = getCalendarEventsForCashFlow_(financial_year, mm);

  const cf_flow = [
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', ''
  ];
  const cf_transactions = [
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', ''
  ];

  cfDigestAccounts_(spreadsheet, tags,
    { mm: mm, dd: dd, num_acc: num_acc, dec_p: dec_p },
    cf_flow, cf_transactions);

  cfDigestCalendar_(eventos, tags,
    { mm: mm, dec_p: dec_p },
    cf_flow, cf_transactions);

  if (dd < 31) {
    cf_flow.splice(dd - 31, 31 - dd);
    cf_transactions.splice(dd - 31, 31 - dd);
  }

  sheet.getRange(4, 2 + 4 * mm, dd, 1).setFormulas(transpose([cf_flow]));
  sheet.getRange(4, 4 + 4 * mm, dd, 1).setValues(transpose([cf_transactions]));

  SpreadsheetApp.flush();
  console.timeEnd('tool/update-cash-flow');
}

function cfDigestCalendar_ (eventos, tags, more, cf_flow, cf_transactions) {
  var evento, title, value, day;
  var c, i, j;

  const mm = more.mm;
  const dec_p = more.dec_p;

  const cards = (mm > 0 ? getTablesService_('cardsbalances') : false);

  const hasTags = (tags && tags.tags.length > 0);
  const hasCards = (cards && cards !== 1);

  i = -1;
  while (++i < eventos.length) {
    evento = eventos[i];

    if (evento.Description === '') continue;
    if (evento.hasAtMute) continue;

    if (!isNaN(evento.Value) && evento.Table !== -1) {
      value = evento.Value;
    } else if (hasCards && evento.hasQcc) {
      if (evento.Card !== -1) {
        c = cards.cards.indexOf(evento.Card);
        if (c === -1) continue;
      } else {
        c = 0;
      }

      if (evento.TranslationType === 'M' &&
          mm + evento.TranslationNumber >= 0 &&
          mm + evento.TranslationNumber <= 11) {
        value = +cards.balance[c][mm + evento.TranslationNumber].toFixed(2);
      } else {
        value = +cards.balance[c][mm - 1].toFixed(2);
      }
    } else if (hasTags && evento.Tags.length > 0) {
      j = 0;
      do {
        c = tags.tags.indexOf(evento.Tags[j++]);
      } while (j < evento.Tags.length && c === -1);
      if (c === -1) continue;

      switch (evento.TranslationType) {
        default:
          ConsoleLog.warn('cfDigestCalendar_(): Switch case is default.', evento.TranslationType);
        case '':
        case 'Avg':
          value = tags.average[c];
          break;
        case 'Total':
          value = tags.total[c];
          break;
        case 'M':
          if (mm + evento.TranslationNumber < 0 || mm + evento.TranslationNumber > 11) continue;
          value = tags.months[c][mm + evento.TranslationNumber];
          break;
      }
    } else {
      continue;
    }

    value = numberFormatLocaleSignal.call(value, dec_p);
    title = '@' + evento.Title + ' ';
    for (j = 0; j < evento.Day.length; j++) {
      day = evento.Day[j] - 1;
      cf_flow[day] += value;
      cf_transactions[day] += title;
    }
  }
}

function cfDigestAccounts_ (spreadsheet, tags, more, cf_flow, cf_transactions) {
  var day, value, matches;
  var cc, c, i, j, k;

  var sheet = spreadsheet.getSheetByName(MN_SHORT[more.mm]);
  if (!sheet) return;

  const maxRows = sheet.getLastRow() - 4;
  if (maxRows <= 0) return;

  const dd = more.dd;
  const dec_p = more.dec_p;
  const num_acc = more.num_acc;

  const hasTags = (tags && tags.tags.length > 0);
  const table = sheet.getRange(5, 6, maxRows, 5 * num_acc).getValues();

  i = -1;
  k = 0;
  cc = 0;

  while (k < num_acc) {
    i++;
    if (i >= maxRows || table[i][2 + cc] === '') {
      k++;
      cc = 5 * k;
      i = -1;
      continue;
    }

    day = table[i][cc];
    if (day <= 0 || day > dd) continue;

    value = table[i][2 + cc];
    if (value === 0 && hasTags) {
      matches = table[i][3 + cc].match(/#\w+/g);
      for (j = 0; j < matches.length; j++) {
        c = tags.tags.indexOf(matches[j].substr(1));
        if (c !== -1) {
          value = tags.average[c];
          break;
        }
      }
    }

    if (typeof value !== 'number') continue;

    day--;
    cf_flow[day] += numberFormatLocaleSignal.call(value, dec_p);
    cf_transactions[day] += '@' + table[i][1 + cc] + ' ';
  }
}
