/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoAccCards {
  static play1 () {
    const id = QuickstartUtils.getRandomAccount().id
    showDialogEditAccount(id)
  }

  static play2 () {
    showDialogAddCard()
  }

  static play3 () {
    const cardsService = new CardsService()
    if (cardsService.list().length === 0) {
      showDialogAddCard()
      return
    }

    const code = QuickstartUtils.getRandomCard().code

    const data = [
      [code, -7, 'Online shopping 2/3 (with instalments in d/d format)', Noise.randomValueNegative(2, 2), '', false],
      [code, 3, 'Grocery shop', -10, '', false],
      [code, 5, 'Gas station', Noise.randomValueNegative(3, 2), '', false],
      [code, 5, 'Grocery shop refund', 10, '', false]
    ]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play4 () {
    const cardsService = new CardsService()
    if (cardsService.list().length === 0) {
      showDialogAddCard()
      return
    }

    const name = QuickstartUtils.getRandomAccount().name
    const code = QuickstartUtils.getRandomCard().code

    const data = [[name, 7, `Card ${code} bill payment`, Noise.randomValueNegative(3, 2), '#qcc', false]]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }
}
