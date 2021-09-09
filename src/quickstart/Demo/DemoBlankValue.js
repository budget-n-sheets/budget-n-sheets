class DemoBlankValue extends QuickstartDemo {
  constructor () {
    super(['mm']);
  }

  makeConfig (num) {
    switch (num) {
      case 1:
        this.list = [
          [
            [5, 'Parking', Noise.randomValueNegative(3, 2), ''],
            [7, 'No transactions below are accounted for due\nto this blank value', '', ''],
            [11, 'Book Store', Noise.randomValueNegative(3, 2), ''],
            [13, 'Shopping', Noise.randomValueNegative(3, 2), ''],
            [17, 'Parking', Noise.randomValueNegative(3, 2), '']
          ],
          [
            [5, 'Coffee shop', Noise.randomValueNegative(3, 2), ''],
            [7, 'Fill in the blank values with zeros', '', ''],
            ['', '', '', ''],
            [13, 'Deposit', Noise.randomValue(4, 2), '#dp'],
            [17, 'Transfer to Joe', Noise.randomValueNegative(3, 2), '#trf']
          ]
        ];
        break;
      case 2:
        this.list = [
          [],
          [
            [5, 'Some deposit', Noise.randomValue(4, 2), '#dp'],
            [7, 'Delete the value to peek the balance and\nexpenses before the following transactions\nUndo with Ctrl+z or ⌘+z', Noise.randomValueNegative(3, 2), ''],
            [11, 'Some expenses', Noise.randomValueNegative(3, 2), ''],
            [13, 'Some expenses', Noise.randomValueNegative(3, 2), '']
          ]
        ];
        break;

      default:
        return;
    }

    this.getSheets_();

    this.isReady = true;
    return this;
  }

  play (num) {
    const ledger = new LedgerAccounts(this.mm);
    const rangeList = [];

    this.list.forEach((values, index) => {
      if (values.length === 0) return;

      ledger.appendTransactions(index, values);
      if (num === 2) ledger.fillInWithZeros(index);

      rangeList.push(ledger.lastRange.getA1Notation());
    });

    this.sheet.getRangeList(rangeList).activate();
  }
}
