/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoBlankValue extends QuickstartDemo {
  constructor () {
    super(['mm'])
  }

  makeConfig (num) {
    const code = QuickstartUtils.getRandomAccount().name

    switch (num) {
      case 1:
        this.list = [
          [
            [code, 5, 'Parking', Noise.randomValueNegative(3, 2), '', false],
            [code, 7, 'No transactions below are accounted for due\nto this blank value', '', '', false],
            [code, 11, 'Book Store', Noise.randomValueNegative(3, 2), '', false],
            [code, 13, 'Shopping', Noise.randomValueNegative(3, 2), '', false],
            [code, 17, 'Parking', Noise.randomValueNegative(3, 2), '', false]
          ],
          [
            [code, 5, 'Coffee shop', Noise.randomValueNegative(3, 2), '', false],
            [code, 7, 'Fill in the blank values with zeros', '', '', false],
            [code, '', '', '', '', false],
            [code, 13, 'Deposit', Noise.randomValue(4, 2), '#dp', false],
            [code, 17, 'Transfer to Joe', Noise.randomValueNegative(3, 2), '#trf', false]
          ]
        ]
        break
      case 2:
        this.list = [
          [],
          [
            [code, 5, 'Some deposit', Noise.randomValue(4, 2), '#dp', false],
            [code, 7, 'Delete the value to peek the balance and\nexpenses before the following transactions\nUndo with Ctrl+z or ⌘+z', Noise.randomValueNegative(3, 2), '', false],
            [code, 11, 'Some expenses', Noise.randomValueNegative(3, 2), '', false],
            [code, 13, 'Some expenses', Noise.randomValueNegative(3, 2), '', false]
          ]
        ]
        break

      default:
        return
    }

    this.getSheets_()

    this.isReady = true
    return this
  }

  play (num) {
    const ledger = new LedgerTtt(this.mm)
    const rangeList = []

    this.list.forEach((values, index) => {
      if (values.length === 0) return

      const lastRange = ledger.appendTransactions(values)
      if (num === 2) ledger.fillInWithZeros()
      if (lastRange) rangeList.push(lastRange.getA1Notation())
    })

    this.sheet.getRangeList(rangeList).activate()
  }
}
