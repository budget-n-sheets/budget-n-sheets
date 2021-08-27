class SettingsSidebarUtils {
  static getScriptletValuesByPanel (name) {
    switch (name) {
      case 'settings':
        return this.panelSettings_();
      case 'maintenance':
        return this.panelMaintenance_();

      default:
        break;
    }
  }

  static panelSettings_ () {
    const values = {};

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const financial_year = SettingsConst.getValueOf('financial_year');
    const isOperationActive = (financial_year >= Consts.date.getFullYear());

    values.isOperationActive = isOperationActive;

    if (isOperationActive) {
      values.isCalendarEnabled = Calendar.isEnabled();
      values.calendars = Calendar.listAllCalendars();
    } else {
      values.isCalendarEnabled = false;
    }

    values.doc_name = spreadsheet.getName();
    values.financial_year = financial_year;

    return values;
  }

  static panelMaintenance_ () {
    const values = {};

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const owner = spreadsheet.getOwner();

    if (owner) {
      values.isOwner = (Session.getEffectiveUser().getEmail() === owner.getEmail());
      values.isSharedDrive = false;
    } else {
      values.isOwner = false;
      values.isSharedDrive = true;
    }

    return values;
  }
}
