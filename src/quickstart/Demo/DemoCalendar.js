/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class DemoCalendar extends QuickstartDemo {
  constructor () {
    super(['Cash Flow']);

    this.isReady = 0;

    this.finCal = new FinCal();
    this.eves = [];

    this.date = {
      yyyy: Consts.date.getFullYear(),
      mm: 0
    };

    this.acc_name = '';
    this.card_code = '';

    this._settings = {
      financial_year: SettingsConst.get('financial_year'),
      initial_month: SettingsUser.get('initial_month')
    };
  }

  createEvents_ () {
    const formater = new FormatNumber();

    this.eves.forEach(eve => {
      let description = eve.description;

      description = description.replace('acc_name', this.acc_name);
      description = description.replace('card_code', this.card_code);

      const value = formater.calendarSignal(eve.value);
      description = description.replace('value', value);

      this.finCal.calendar.createAllDayEvent(
        eve.title,
        new Date(this._settings.financial_year, this.date.mm, eve.day),
        new Date(this._settings.financial_year, this.date.mm, eve.day + eve.length),
        { description: description });

      Utilities.sleep(300);
    });
  }

  demo1_ () {
    this.eves = [
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
    ];

    this.createEvents_();
  }

  demo2_ () {
    if (!this.card_code) return;

    this.eves = [
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
    ];

    this.createEvents_();
  }

  demo3_ () {
    this.eves = [
      {
        day: 11,
        length: 2,
        title: 'Two-days event',
        description: 'acc_name\nvalue\n---\nMultiple-days events behave like a series of one-day event.',
        value: -1.23
      }
    ];

    this.createEvents_();
  }

  evalPermission_ () {
    const ui = SpreadsheetApp2.getUi();

    if (!this.finCal.calendar) {
      ui.alert(
        "Can't create events",
        'Select a calendar first in the settings.',
        ui.ButtonSet.OK);
      return false;
    } else if (!this.finCal.isOwner) {
      ui.alert(
        'Permission denied',
        'You are not the owner of the selected calendar.',
        ui.ButtonSet.OK);
      return false;
    }

    const response = ui.alert(
      'Permission Required',
      'Allow add-on "Budget n Sheets" to create calendar events?',
      ui.ButtonSet.YES_NO);

    return response === ui.Button.YES;
  }

  makeConfig (num) {
    if (num === 1) {
      showSidebarSettings();
      return;
    }

    if (!this.evalPermission_()) return;

    if (this.date.yyyy === this._settings.financial_year) {
      this.date.mm = Consts.date.getMonth() + 1;
    } else if (this.date.yyyy < this._settings.financial_year) {
      this.date.mm = this._settings.initial_month;
    } else {
      return;
    }

    this.acc_name = new AccountsService().getAny().metadata.name;
    this.card_code = new CardsService().getAny()?.metadata.code || '';

    this.getSheets_();

    this.isReady = 1;
    return this;
  }

  play () {
    this.demo1_();
    this.demo2_();
    this.demo3_();

    const indexes = new Array(12).fill(false);
    indexes[this.date.mm] = true;

    const tool = new RefreshCashFlow();
    tool.indexes = indexes;
    tool.refresh();

    SpreadsheetApp2.getActive().spreadsheet.setActiveSheet(this.sheet);
    this.sheet.getRange(1, 2 + 4 * this.date.mm, 1, 3).activate();
  }
}
