/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CalendarService {
  static syncDayWithSpreadsheet (date) {
    const finCalEvents = new FinCal().getEventsForDay(date);
    const events = CalendarUtils.digestEvents(finCalEvents);
    if (events.length === 0) return;

    const tableCards = [];
    const tableTtt = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

    const mm = date.getMonth();
    const dd = date.getDate();

    const formater = new FormatNumber();

    const db_accounts = new AccountsService().getAll();

    const cardsService = new CardsService();
    const db_cards = cardsService.getAllBalances() || {};
    const hasCards = cardsService.hasCards();

    for (const evento of events) {
      if (evento.description === '') continue;
      if (evento.hasAtMute) continue;

      const tags = (evento.tags.length > 0 ? '#' + evento.tags.join(' #') : '');

      let value = evento.value || 0;

      if (isNaN(evento.value)) {
        if (!evento.hasQcc) continue;
        if (!evento.card) continue;
        if (!evento.hasWallet && !evento.account) continue;

        if (mm > 0) {
          const card = db_cards[evento.card.id];
          value = card.balances[mm - 1];
        }
      }

      value = '=' + formater.localeSignal(value);

      if (evento.hasWallet) {
        tableTtt[0].push([dd, evento.title, value, tags]);
      } else if (evento.account) {
        const index = db_accounts[evento.account].index;
        tableTtt[1 + index].push([dd, evento.title, value, tags]);
      } else if (evento.card) {
        tableCards.push([dd, evento.title, evento.card.code, value, tags]);
      }
    }

    if (tableCards.length > 0 && SpreadsheetApp2.getActive().getSheetByName('Cards')) {
      new LedgerTtt(mm).mergeTransactions(tableCards);
    }

    const num_ttt = 1 + SettingsConst.get('number_accounts');
    const ledger = new LedgerTtt(mm);
    for (const k in tableTtt) {
      if (tableTtt[k].length === 0) continue;
      ledger.mergeTransactions(tableTtt[k]);
    }
  }
}
