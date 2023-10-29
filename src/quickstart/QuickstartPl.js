/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class QuickstartPl {
  static ay (name, num) {
    switch (name) {
      case 'acc_cards':
        QuickstartDemo.accCards(num)
        break
      case 'blank_value':
        QuickstartDemo.blankValue(num)
        break
      case 'calendar':
        QuickstartDemo.calendar(num)
        break
      case 'cash_flow':
        QuickstartDemo.cashFlow(num)
        break
      case 'statements':
        QuickstartDemo.statements(num)
        break
      case 'tags':
        QuickstartDemo.tags(num)
        break
      case 'transactions':
        QuickstartDemo.transactions(num)
        break

      default:
        console.warn('Switch case is default.', name)
        return
    }

    SpreadsheetApp2.getActive().spreadsheet.toast('Done.', 'Quickstart')
  }
}
