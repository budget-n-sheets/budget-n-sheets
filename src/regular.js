function postEventsForDate_ (date) {
  const calendar = getFinancialCalendar_();
  if (!calendar) return;

  const eventos_day = calendar.getEventsForDay(date);
  if (eventos_day.length === 0) return;

  const list_eventos = calendarDigestListEvents_(eventos_day);
  if (list_eventos.length === 0) return;

  const num_acc = SettingsConst.getValueOf('number_accounts') + 1;

  const cards_balances = new CardsService().getAllBalances();
  const hasCards = (cards_balances && cards_balances !== 1);

  const mm = date.getMonth();
  const dd = date.getDate();

  const cards = [];
  const accounts = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

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

    value = '=' + FormatNumber.localeSignal(value);

    let tags = '';
    if (evento.Tags.length > 0) tags = '#' + evento.Tags.join(' #');

    if (evento.Table !== -1) {
      accounts[evento.Table].push([dd, evento.Title, value, tags]);
    } else if (evento.Card !== -1) {
      cards.push([dd, evento.Title, evento.Card, value, tags]);
    }
  }

  if (cards.length > 0) {
    const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cards');
    if (sheet) new LedgerCards(sheet).mergeTransactions(mm, cards);
  }

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName(MONTH_NAME.short[mm]);
  if (!sheet) return;

  const ledger = new LedgerAccounts(sheet);
  for (let k = 0; k < num_acc; k++) {
    if (accounts[k].length === 0) continue;
    ledger.mergeTransactions(k, accounts[k]);
  }
}

function treatLayout_ (yyyy, mm) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const financial_year = SettingsConst.getValueOf('financial_year');
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
