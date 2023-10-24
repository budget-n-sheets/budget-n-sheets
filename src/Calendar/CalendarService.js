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
    const tableTtt = []

    const mm = date.getMonth();
    const dd = date.getDate();

    const formater = new NumberFormatter();
    const accounts = new AccountsService().list()
    const balances = new SheetBackstage().getCardsBalances()

    for (const evento of events) {
      if (evento.description === '') continue;
      if (evento.hasAtMute) continue;

      const tags = (evento.tags.length > 0 ? '#' + evento.tags.join(' #') : '');

      let value = evento.value || 0;

      if (isNaN(evento.value)) {
        if (!evento.hasQcc) continue;
        if (!evento.card) continue;
        if (!evento.hasWallet && !evento.account) continue;
        if (mm > 0) value = balances[evento.card.id][mm - 1]
      }

      value = '=' + formater.localeSignal(value);

      if (evento.hasWallet) {
        tableTtt.push(['Wallet', dd, evento.title, value, tags, evento.hasIgn]);
      } else if (evento.account) {
        const name = accounts.find(acc => acc.id === evento.account).name
        tableTtt.push([name, dd, evento.title, value, tags, evento.hasIgn]);
      } else if (evento.card) {
        tableCards.push([evento.card.code, dd, evento.title, value, tags, evento.hasIgn]);
      }
    }

    const ledger = new LedgerTtt(mm)
    if (tableCards.length > 0) ledger.mergeTransactions(tableCards)
    ledger.mergeTransactions(tableTtt)
  }
}
