/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class QuickstartDemo {
  constructor (required) {
    this.spreadsheet = SpreadsheetApp2.getActive().spreadsheet;
    this.sheet = null;

    this.required = required || [];
    this.missing = '';
    this.mm = -1;

    this.isReady = false;
  }

  static pick (name) {
    switch (name) {
      case 'acc_cards':
        return new DemoAccCards();
      case 'blank_value':
        return new DemoBlankValue();
      case 'calendar':
        return new DemoCalendar();
      case 'cash_flow':
        return new DemoCashFlow();
      case 'statements':
        return new DemoStatements();
      case 'tags':
        return new DemoTags();
      case 'transactions':
        return new DemoTransactions();

      default:
        console.warn('QuickstartDemo: pick(): Switch case is default.', name);
        break;
    }
  }

  getSheets_ () {
    const c = this.required.indexOf('mm');
    if (c !== -1) {
      this.mm = SettingsConst.get('financial_year') === Consts.date.getFullYear() ? Consts.date.getMonth() : 0;
      this.required[c] = Consts.month_name.short[this.mm];
    }

    this.sheets = {};
    for (let i = 0; i < this.required.length; i++) {
      const name = this.required[i];
      if (this.sheets[name]) continue;

      this.sheets[name] = this.spreadsheet.getSheetByName(name);
      if (!this.sheets[name]) {
        this.missing = name;
        break;
      }
    }

    if (this.required.length === 1) this.sheet = this.sheets[this.required[0]];

    return this;
  }

  alertSheetMissing () {
    SpreadsheetApp2.getUi().alert(
      "Can't show example",
      'Sheet "' + this.missing + "\" couldn't be found.",
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return this;
  }

  hasMissing () {
    return this.required.length > 0 && this.missing !== '';
  }
}
