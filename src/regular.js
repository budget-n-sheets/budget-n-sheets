function postEventsForDate_ (date) {
  const calendar = getFinancialCalendar_();
  if (!calendar) return;

  const eventos_day = calendar.getEventsForDay(date);
  if (eventos_day.length === 0) return;

  const list_eventos = calendarDigestListEvents_(eventos_day);
  if (list_eventos.length === 0) return;

  const num_acc = getConstProperties_('number_accounts') + 1;

  const cards_balances = getTablesService_('cardsbalances');
  const hasCards = (cards_balances && cards_balances !== 1);

  const mm = date.getMonth();
  const dd = date.getDate();

  const accounts = {};
  for (let k = 0; k < num_acc; k++) {
    accounts[k] = { table: [], values: [] };
  }

  const cards = { table: [], values: [] };

  for (let i = 0; i < list_eventos.length; i++) {
    const evento = list_eventos[i];
    let value = 0;

    if (evento.Description === '') continue;
    if (evento.hasAtMute) continue;

    if (!isNaN(evento.Value)) {
      value = evento.Value;
    } else if (hasCards && evento.hasQcc) {
      let c = 0;

      if (evento.Card !== -1) {
        c = cards_balances.cards.indexOf(evento.Card);
        if (c === -1) continue;
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

    let tags = '';
    if (evento.Tags.length > 0) tags = '#' + evento.Tags.join(' #');

    if (evento.Table !== -1) {
      accounts[evento.Table].table.push([dd, evento.Title, '', tags]);
      accounts[evento.Table].values.push(value);
    } else if (evento.Card !== -1) {
      cards.table.push([dd, evento.Title, evento.Card, '', tags]);
      cards.values.push(value);
    }
  }

  if (cards.table.length > 0) {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
    if (sheet) {
      mergeEventsInTable_(sheet, cards, 6, 1 + 6 * mm, 5, 3);
    }
  }

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(MONTH_NAME.short[mm]);
  if (!sheet) return;

  for (let k = 0; k < num_acc; k++) {
    if (accounts[k].table.length === 0) continue;
    mergeEventsInTable_(sheet, accounts[k], 5, 1 + 5 * k, 4, 2);
  }
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
