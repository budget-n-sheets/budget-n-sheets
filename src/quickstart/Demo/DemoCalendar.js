/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoCalendar {
  static createEvents_ (finCal, eventos) {
    for (const evento of eventos) {
      finCal.calendar
        .createAllDayEvent(
          evento.title,
          evento.startDate, evento.endDate,
          { description: evento.description })

      Utilities.sleep(300)
    }
  }

  static refreshCashFlow_ (mm) {
    const indexes = new Array(12).fill(false)

    indexes[mm] = true
    RefreshCashFlow.refresh(indexes)

    SpreadsheetApp.flush()
    SpreadsheetApp2.getActive()
      .getSheetByName('Cash Flow')
      .getRange('B2:D2')
      .offset(0, 4 * mm)
      .activate()
  }

  static getUserPermission (finCal) {
    const ui = SpreadsheetApp2.getUi()

    if (!finCal.calendar) {
      ui.alert(
        "Can't create events",
        'Select a calendar first in the settings.',
        ui.ButtonSet.OK)
      return false
    } else if (!finCal.isOwner) {
      ui.alert(
        'Permission denied',
        'You are not the owner of the selected calendar.',
        ui.ButtonSet.OK)
      return false
    }

    const response = ui.alert(
      'Permission Required',
      'Allow add-on "Budget n Sheets" to create calendar events?\nExplanation: this one-time "create" permission allows the add-on to create examples of how to write financial events in your selected calendar.',
      ui.ButtonSet.YES_NO)

    return response === ui.Button.YES
  }

  static play1 () {
    showSidebarSettings()
  }

  static play2 () {
    const finCal = new FinCal()
    if (!this.getUserPermission(finCal)) return

    const list = [
      [
        {
          day: 2,
          length: 1,
          title: 'The simplest event',
          description: 'acc_name\nvalue\n---\nThis simple event has the name of an account and a number formatted.',
          value: -1.23
        },
        {
          day: 3,
          length: 1,
          title: 'Ignored event',
          description: 'acc_name\nvalue\n\n@ignore\n---\nThis event has the "@ignore" - or "@ign" for short - indicator, so it is not included in cash flow, nor posted in the table.',
          value: -1.23
        },
        {
          day: 5,
          length: 1,
          title: 'Income',
          description: 'acc_name\nvalue\n\n#trf #inc\n---\nSimilar to <b>The simplest event</b> but with a few tags. While the tags don\'t play any role in cash flow, they are posted in the table along with the other details.',
          value: 1234.56
        }
      ],
      [
        {
          day: 2,
          length: 1,
          title: 'The simplest card event',
          description: 'card_code\nvalue\n---\nThis simple event has the code of a card and a number formatted. This event is not synced with the cash flow.',
          value: -1.23
        },
        {
          day: 7,
          length: 1,
          title: 'Card bill payment',
          description: 'acc_name\ncard_code\n\n#qcc\n---\nThis event has the "#qcc" built-in tag and no number formatted. The add-on gets the card\'s balance of the previous month and puts it in the cash flow.'
        }
      ],
      [
        {
          day: 11,
          length: 2,
          title: 'Two-days event',
          description: 'acc_name\nvalue\n---\nMultiple-days events behave like a series of one-day event.',
          value: -1.23
        }
      ]
    ]

    const financialYear = SettingsConst.get('financial_year')
    const date = LocaleUtils.getDate()
    const yyyy = date.getFullYear()
    let mm = date.getMonth()

    if (yyyy === financialYear) {
      mm = Consts.date.getMonth() + 1
    } else if (yyyy < financialYear) {
      mm = SettingsUser.get('initial_month')
    } else {
      return
    }

    const formatter = new NumberFormatter()
    const accName = QuickstartUtils.getRandomAccount().name
    const cardCode = QuickstartUtils.getRandomCard().code

    for (const eventos of list) {
      for (const evento of eventos) {
        evento.description = evento.description.replace('acc_name', accName)
        evento.description = evento.description.replace('card_code', cardCode)

        const value = formatter.calendarSignal(evento.value)
        evento.description = evento.description.replace('value', value)

        evento.startDate = new Date(financialYear, mm, evento.day)
        evento.endDate = new Date(financialYear, mm, evento.day + evento.length)
      }

      this.createEvents_(finCal, eventos)
    }

    this.refreshCashFlow_(mm)
  }
}
