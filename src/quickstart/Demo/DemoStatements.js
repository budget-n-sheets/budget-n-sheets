/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoStatements extends QuickstartDemo {
  constructor () {
    super(['mm']);
  }

  makeConfig (num) {
    switch (num) {
      case 1:
        this.list = [
          [[7, 'Coffee shop', Noise.randomValueNegative(2, 2), '']]
        ];
        break;
      case 2:
        this.list = [
          [],
          [[7, 'Grocery shop', Noise.randomValueNegative(2, 2), '']]
        ];
        break;
      case 3:
        this.list = [
          [[7, 'Income (in cash), add #inc tag', Noise.randomValue(3, 2), '#inc']],
          [
            [7, 'Income (via transfer #trf), add #inc tag', Noise.randomValue(3, 2), '#trf #inc'],
            [7, 'Income (via deposit #dp), add #inc tag', Noise.randomValue(3, 2), '#dp #inc']
          ]
        ];
        break;
      case 4: {
        this.list = [];
        if (Noise.randomInteger(2) === 1) this.list.push([]);

        const val = -Noise.randomInteger(20);
        this.list.push([
          [7, 'Pizza, my share', val, ''],
          [7, 'Pizza, others share (not accounted in expenses), add #ign tag', 3 * val, '#ign']
        ]);
        break;
      }
    }

    this.getSheets_();

    this.isReady = true;
    return this;
  }

  play () {
    const ledger = new LedgerAccounts(this.mm);
    const rangeList = [];

    this.list.forEach((values, index) => {
      if (values.length === 0) return;

      ledger.appendTransactions(index, values).fillInWithZeros(index);
      rangeList.push(ledger.lastRange.getA1Notation());
    });

    this.sheet.getRangeList(rangeList).activate();
  }
}
