class CalendarUtils {
  static digestEvents (events) {
    const output = [];

    const dateOffset = Utils.getDateOffset();
    const dec_p = SettingsSpreadsheet.getValueOf('decimal_places');
    const dec_s = SettingsSpreadsheet.getValueOf('decimal_separator');
    const valueRegExp = FormatNumberUtils.getCurrencyRegExp();

    const accountsService = new AccountsService();
    const cardsService = new CardsService();

    const hasCards = cardsService.hasCards();

    const regExp = {
      accounts: accountsService.getNamesRegExp(),
      cards: cardsService.getCodesRegExp(true)
    };

    let i = -1;
    while (++i < events.length) {
      const evento = events[i];
      let matches = null;

      const description = evento.getDescription();
      if (description === '') continue;

      const metadata = {
        id: evento.getId(),

        start: 0,
        end: 0,
        isRecurring: evento.isRecurringEvent(),

        title: evento.getTitle(),
        description: description,

        hasWallet: false,
        account: '',
        card: '',
        value: 0,

        tags: [],
        tagImportant: '',

        translation: null,
        hasAtMute: true,
        hasQcc: false
      };

      metadata.hasWallet = description.indexOf('Wallet') !== -1;

      matches = description.match(regExp.accounts) || [];
      for (const name of matches) {
        const acc = accountsService.getByName(name);
        if (acc) {
          metadata.account = acc.id;
          break;
        }
      }

      if (hasCards) {
        matches = description.match(regExp.cards) || [];
        for (const code of matches) {
          const card = cardsService.getByCode(code);
          if (card) {
            metadata.card = { id: card.id, code: code };
            break;
          }
        }
      }

      if (!metadata.hasWallet && !metadata.account && !metadata.card) continue;

      metadata.hasAtMute = /@mute/.test(description);
      metadata.hasQcc = /#qcc/.test(description);
      metadata.translation = Utils.getTranslation(description);

      matches = description.match(valueRegExp);
      if (matches) {
        matches = matches[0];
        if (!dec_s) matches = matches.replace(',', '.');
        metadata.value = +matches.replace(/[$\s]/g, '');
      } else {
        metadata.value = NaN;
      }

      matches = description.match(/!#\w+/);
      if (matches) metadata.tagImportant = match[0].slice(2);

      metadata.tags = description.match(/#\w+/g) || [];
      metadata.tags.forEach((t, i, a) => { a[i] = t.slice(1); });

      if (evento.isAllDayEvent()) {
        metadata.startDate = evento.getAllDayStartDate();
        metadata.endDate = evento.getAllDayEndDate();
      } else {
        metadata.startDate = new Date(evento.getStartTime() - dateOffset);
        metadata.endDate = new Date(evento.getEndTime() - dateOffset) + 1;
      }

      output.push(metadata);
    }

    return output;
  }
}