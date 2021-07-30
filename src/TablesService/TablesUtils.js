class TablesUtils {
  static getUtid() {
    const accounts = new AccountsService();
    const cards = new CardsService();

    let i = 0;
    let id = '';

    do {
      id = randomString(7, 'lonum');
    } while (accounts.hasId(id) && cards.hasId(id) && i++ < 99);

    return (i < 99 ? id : '');
  }
}
