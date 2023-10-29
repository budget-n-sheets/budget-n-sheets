/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoTags {
  static play1 () {
    const data = [['Coffee', 'Food and supply', 'My coffee addiction tracker', true, 'coffee']]

    new LedgerTags().mergeTransactions(data).activate()
  }

  static play2 () {
    const code = QuickstartUtils.getRandomAccount().name

    const data = [
      [code, 3, 'Bus to Abc', Noise.randomValueNegative(2, 2), '#trip1', false],
      [code, 3, 'Abc Pizza, lunch', Noise.randomValueNegative(2, 2), '#trip1', false],
      [code, 4, 'Coffee Abc', Noise.randomValueNegative(2, 2), '#trip1 #coffee', false],
      [code, 7, 'Flight to Def', Noise.randomValueNegative(2, 2), '#trip2', false],
      [code, 8, 'Tower Def', Noise.randomValueNegative(2, 2), '#trip2', false]
    ]

    const mm = LocaleUtils.getDate().getMonth()
    new LedgerTtt(mm).mergeTransactions(data).activate()
  }

  static play3 () {
    const data = [
      ['All trips', 'Traveling', 'Accounts statements with #trip, #trip1 or #trip2 tag', true, 'trip'],
      ['Trip to Abc', 'Traveling', 'Accounts statements with #trip1 tag', false, 'trip1'],
      ['Trip to Def', 'Traveling', 'Accounts statements with #trip1 tag', false, 'trip2']
    ]

    new LedgerTags().mergeTransactions(data).activate()
  }

  static play4 () {
    showPanelAnalytics()
  }
}
