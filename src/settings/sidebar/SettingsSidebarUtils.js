class SettingsSidebarUtils {
  getScriptletValuesByPanel (name) {
    switch (name) {
      case 'settings':
        return this.panelSettings_();
      case 'maintenance':
        return this.panelMaintenance_();

      default:
        break;
    }
  }

  panelSettings_ () {
    const _values = {};

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const financial_year = getConstProperties_('financial_year');
    const isOperationActive = (financial_year >= DATE_NOW.getFullYear());

    _values.isOperationActive = isOperationActive;

    if (isOperationActive) {
      const calendars = getAllOwnedCalendars();
      _values.isCalendarEnabled = (calendars.md5.length > 0);
      _values.calendars_data = calendars;
    } else {
      _values.isCalendarEnabled = false;
    }

    _values.doc_name = spreadsheet.getName();
    _values.financial_year = financial_year;

    return _values;
  }

  panelMaintenance_ () {
    const _values = {};

    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const owner = spreadsheet.getOwner();

    if (owner) {
      _values.isOwner = (Session.getEffectiveUser().getEmail() === owner.getEmail());
      _values.isSharedDrive = false;
    } else {
      _values.isOwner = false;
      _values.isSharedDrive = true;
    }

    return _values;
  }
}
