/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TablesUtils {
  static getUtid () {
    const accounts = new AccountsService();
    const cards = new CardsService();

    let i = 0;
    let id = '';

    do {
      id = Noise.randomString(7, 'lonum');
    } while (accounts.hasId(id) && cards.hasId(id) && ++i < 99);

    return (i < 99 ? id : null);
  }
}
