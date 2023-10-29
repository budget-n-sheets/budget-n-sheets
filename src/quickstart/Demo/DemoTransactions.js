/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoTransactions {
  static play1 () {
    const name = QuickstartUtils.getRandomAccount().name
    const data = [[name, 7, 'Deposit (to my account #dp)', Noise.randomValue(3, 2), '#dp', false]]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play2 () {
    const name = QuickstartUtils.getRandomAccount().name
    const data = [[name, 7, 'Transfer (from someone #trf)', Noise.randomValue(3, 2), '#trf', false]]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play3 () {
    const name = QuickstartUtils.getRandomAccount().name
    const data = [[name, 7, 'Transfer (to someone #trf)', Noise.randomValueNegative(3, 2), '#trf', false]]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play4 () {
    const name = QuickstartUtils.getRandomAccount().name
    const data = [[name, 7, 'Withdrawal (cash dispenser #wd)', Noise.randomValueNegative(3, 2), '#wd', false]]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }
}
