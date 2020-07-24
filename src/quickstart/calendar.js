var QUICKSTART_DATA_CALENDAR = Object.freeze({
  1: [
    { day: 2, title: 'The simplest event', description: 'acc_name\nvalue', value: -1.23 },
    { day: 3, title: 'Muted event', description: 'acc_name\nvalue\n\n@muted', value: -1.23 },
    { day: 5, title: 'Payday', description: 'acc_name\nvalue\n\n#trf #rct', value: 1234.56 }
  ],
  2: [
    { day: 7, title: 'Card bill payment', description: 'card_code\n\n#qcc' }
  ],
  3: [
    { day: 11, length: 2, title: 'Two-days event', description: 'acc_name\n-$1.23' }
  ]
});

function playQuickCalendar_ (n) {
  var ui = SpreadsheetApp.getUi();
  var calendar = getFinancialCalendar_();
  var data, value, description, mm, i;

  if (!calendar) {
    ui.alert(
      "Can't create events",
      'Select a bill calendar first in the settings.',
      ui.ButtonSet.OK);
    showSidebarMainSettings();
    return;
  } else if (!calendar.isOwnedByMe()) {
    ui.alert(
      'Permission denied',
      'You are not the owner of the selected calendar.',
      ui.ButtonSet.OK);
    return;
  }

  const yyyy = DATE_NOW.getFullYear();
  const financial_year = getConstProperties_('financial_year');

  if (yyyy === financial_year) {
    mm = DATE_NOW.getMonth() + 1;
    if (mm === 12) {
      ui.alert(
        "Can't create events",
        'This example is unavailble because the year is almost round. Try in the budget sheet of the next year.',
        ui.ButtonSet.OK);
      return;
    }
  } else if (yyyy < financial_year) {
    mm = getUserSettings_('initial_month');
  } else {
    ui.alert(
      "Can't create events",
      'This example is unavailble. Try in a budget sheet of the current year.',
      ui.ButtonSet.OK);
    return;
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Cash Flow');

  if (!sheet) {
    alertQuickstartSheetMissing(name);
    return;
  }

  spreadsheet.setActiveSheet(sheet);

  const dec_p = getSpreadsheetSettings_('decimal_separator');
  const db_tables = getDbTables_();
  const acc_name = db_tables.accounts.names[0];
  const card_code = (db_tables.cards.count > 0 ? db_tables.cards.codes[0] : '');

  data = QUICKSTART_DATA_CALENDAR[1];
  if (!data) throw new Error("Values for quickstart example couldn't be found. calendar:" + n);

  for (i = 0; i < data.length; i++) {
    description = data[i].description;
    description = description.replace('acc_name', acc_name);

    if (data[i].value) {
      value = numberFormatCalendarSignal.call(data[i].value, dec_p);
      description = description.replace('value', value);
    }

    calendar.createAllDayEvent(
      data[i].title,
      new Date(financial_year, mm, data[i].day),
      { description: description }
    );
    Utilities.sleep(200);
  }

  if (card_code) {
    data = QUICKSTART_DATA_CALENDAR[2];
    if (!data) throw new Error("Values for quickstart example couldn't be found. calendar:" + n);

    for (i = 0; i < data.length; i++) {
      description = data[i].description;
      description = description.replace('card_code', card_code);

      if (data[i].value) {
        value = numberFormatCalendarSignal.call(data[i].value, dec_p);
        description = description.replace('value', value);
      }

      calendar.createAllDayEvent(
        data[i].title,
        new Date(financial_year, mm, data[i].day),
        { description: description }
      );
    }
  }

  data = QUICKSTART_DATA_CALENDAR[3];
  if (!data) throw new Error("Values for quickstart example couldn't be found. calendar:" + n);

  for (i = 0; i < data.length; i++) {
    description = data[i].description;
    description = description.replace('acc_name', acc_name);

    if (data[i].value) {
      value = numberFormatCalendarSignal.call(data[i].value, dec_p);
      description = description.replace('value', value);
    }

    calendar.createAllDayEvent(
      data[i].title,
      new Date(financial_year, mm, data[i].day),
      new Date(financial_year, mm, data[i].day + data[i].length),
      { description: description }
    );
  }

  setUserSettings_('cash_flow_events', true);
  updateCashFlow_(mm);

  sheet.getRange(1, 2 + 4 * mm, 1, 3).activate();
}
