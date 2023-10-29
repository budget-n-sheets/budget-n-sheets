/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoStatements {
  static play1 () {
    const data = [['Wallet', 7, 'Coffee shop', Noise.randomValueNegative(2, 2), '', false]]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play2 () {
    const code = QuickstartUtils.getRandomAccount().name

    const data = [[code, 7, 'Grocery shop', Noise.randomValueNegative(2, 2), '', false]]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play3 () {
    const code = QuickstartUtils.getRandomAccount().name

    const data = [
      [code, 7, 'Income (in cash), add #inc tag', Noise.randomValue(3, 2), '#inc', false],
      [code, 7, 'Income (via transfer #trf), add #inc tag', Noise.randomValue(3, 2), '#trf #inc', false],
      [code, 7, 'Income (via deposit #dp), add #inc tag', Noise.randomValue(3, 2), '#dp #inc', false]
    ]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play4 () {
    const code = QuickstartUtils.getRandomAccount().name
    const value = -Noise.randomInteger(20)

    const data = [
      [code, 7, 'Pizza, my share', value, '', false],
      [code, 7, 'Pizza, others share (not accounted in expenses)', 3 * value, '', true]
    ]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }
}
