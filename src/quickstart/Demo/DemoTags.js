class DemoTags extends QuickstartDemo {
  demo1_ () {
    new LedgerTags(this.sheet).mergeTransactions(0, this.data).activate();
  }

  demo2_ () {
    new LedgerAccounts(this.sheet).appendTransactions(1, this.data).fillInWithZeros(1).activate();
  }

  makeConfig (num) {
    switch (num) {
      case 1:
        this.required = ['Tags'];
        this.data = [['Coffee', 'Food and supply', 'My coffee addiction tracker', 'TRUE', 'coffee']];
        break;
      case 2:
        this.required = ['mm'];
        this.data = [
          [3, 'Bus to Abc', Noise.randomValueNegative(2, 2), '#trip1'],
          [3, 'Abc Pizza, lunch', Noise.randomValueNegative(2, 2), '#trip1'],
          [4, 'Coffee Abc', Noise.randomValueNegative(2, 2), '#trip1 #coffee'],
          [7, 'Flight to Def', Noise.randomValueNegative(2, 2), '#trip2'],
          [8, 'Tower Def', Noise.randomValueNegative(2, 2), '#trip2']
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
