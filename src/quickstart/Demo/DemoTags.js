/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoTags extends QuickstartDemo {
  demo1_ () {
    new LedgerTags().mergeTransactions(this.data).activate();
  }

  demo2_ () {
    new LedgerTtt(this.mm).appendTransactions(this.data).fillInWithZeros().activate();
  }

  makeConfig (num) {
    const code = QuickstartUtils.getRandomAccount().name

    switch (num) {
      case 1:
        this.required = ['Tags'];
        this.data = [['Coffee', 'Food and supply', 'My coffee addiction tracker', 'TRUE', 'coffee']];
        break;
      case 2:
        this.required = ['mm'];
        this.data = [
          [code, 3, 'Bus to Abc', Noise.randomValueNegative(2, 2), '#trip1', false],
          [code, 3, 'Abc Pizza, lunch', Noise.randomValueNegative(2, 2), '#trip1', false],
          [code, 4, 'Coffee Abc', Noise.randomValueNegative(2, 2), '#trip1 #coffee', false],
          [code, 7, 'Flight to Def', Noise.randomValueNegative(2, 2), '#trip2', false],
          [code, 8, 'Tower Def', Noise.randomValueNegative(2, 2), '#trip2', false]
        ];
        break;
      case 3:
        this.required = ['Tags'];
        this.data = [
          ['All trips', 'Traveling', 'Accounts statements with #trip, #trip1 or #trip2 tag', 'TRUE', 'trip'],
          ['Trip to Abc', 'Traveling', 'Accounts statements with #trip1 tag', 'FALSE', 'trip1'],
          ['Trip to Def', 'Traveling', 'Accounts statements with #trip1 tag', 'FALSE', 'trip2']
        ];
        break;
      case 4:
        break;

      default:
        return;
    }

    this.getSheets_();

    this.isReady = true;
    return this;
  }

  play (num) {
    switch (num) {
      case 1:
        this.demo1_();
        break;
      case 2:
        this.demo2_();
        break;
      case 3:
        this.demo1_();
        break;
      case 4:
        showPanelAnalytics();
        break;
    }
  }
}
