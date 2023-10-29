/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class QuickstartDemo {
  static accCards (num) {
    switch (num) {
      case 1:
        DemoAccCards.play1()
        break
      case 2:
        DemoAccCards.play2()
        break
      case 3:
        DemoAccCards.play3()
        break
      case 4:
        DemoAccCards.play4()
        break

      default:
        throw new Error('Invalid demonstration number.')
    }
  }

  static calendar (num) {
    switch (num) {
      case 1:
        DemoCalendar.play1()
        break
      case 2:
        DemoCalendar.play2()
        break

      default:
        throw new Error('Invalid demonstration number.')
    }
  }

  static cashFlow (num) {
    switch (num) {
      case 1:
        DemoCashFlow.play1()
        break

      default:
        throw new Error('Invalid demonstration number.')
    }
  }

  static statements (num) {
    switch (num) {
      case 1:
        DemoStatements.play1()
        break
      case 2:
        DemoStatements.play2()
        break
      case 3:
        DemoStatements.play3()
        break
      case 4:
        DemoStatements.play4()
        break

      default:
        throw new Error('Invalid demonstration number.')
    }
  }

  static tags (num) {
    switch (num) {
      case 1:
        DemoTags.play1()
        break
      case 2:
        DemoTags.play2()
        break
      case 3:
        DemoTags.play3()
        break
      case 4:
        DemoTags.play4()
        break

      default:
        throw new Error('Invalid demonstration number.')
    }
  }

  static transactions (num) {
    switch (num) {
      case 1:
        DemoTransactions.play1()
        break
      case 2:
        DemoTransactions.play2()
        break
      case 3:
        DemoTransactions.play3()
        break
      case 4:
        DemoTransactions.play4()
        break

      default:
        throw new Error('Invalid demonstration number.')
    }
  }

  static alertSheetMissing (name) {
    SpreadsheetApp2.getUi().alert(
      "Can't show demonstration",
      `Sheet ${name} could not be found.`,
      SpreadsheetApp2.getUi().ButtonSet.OK)
  }
}
