/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class QuickstartUtils {
  static getRandomAccount () {
    const accs = new AccountsService().list()
    if (accs.length === 0) return null
    const r = Noise.randomInteger(accs.length)
    return accs[r]
  }

  static getRandomCard () {
    const cards = new AccountsService().list()
    if (cards.length === 0) return null
    const r = Noise.randomInteger(cards.length)
    return cards[r]
  }
}
