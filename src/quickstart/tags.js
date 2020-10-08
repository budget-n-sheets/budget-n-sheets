var QUICKSTART_DATA_TAGS = Object.freeze({
  1: [['Coffee', 'Food and supply', 'My coffee addiction tracker', 'TRUE', 'coffee']],
  2: [
    [3, 'Bus to Abc', null, '#trip1'],
    [3, 'Abc Pizza, lunch', null, '#trip1'],
    [4, 'Coffee Abc', null, '#trip1 #coffee'],
    [7, 'Flight to Def', null, '#trip2'],
    [8, 'Tower Def', null, '#trip2']
  ],
  3: [
    ['All trips', 'Traveling', 'Accounts statements with #trip, #trip1 or #trip2 tag', 'TRUE', 'trip'],
    ['Trip to Abc', 'Traveling', 'Accounts statements with #trip1 tag', 'FALSE', 'trip1'],
    ['Trip to Def', 'Traveling', 'Accounts statements with #trip1 tag', 'FALSE', 'trip2']
  ]
});

function playQuickTags_ (n) {
  switch (n) {
    case 1:
    case 3:
      playQuickTags0103_(n);
      break;
    case 2:
      playQuickTags02_(n);
      break;
    case 4:
      showPanelAnalytics();
      break;

    default:
      throw new Error('playQuickTags_(): Switch case is default. ' + n);
  }
}

function playQuickTags0103_ (n) {
  const data = QUICKSTART_DATA_TAGS[n];
  if (!data) throw new Error("playQuickTags0103_(): Values for quickstart example couldn't be found. tags:" + n);

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Tags');
  if (!sheet) {
    alertQuickstartSheetMissing('Tags');
    return;
  }

  spreadsheet.setActiveSheet(sheet);

  sheet.insertRowsBefore(3, data.length);
  sheet.getRange(3, 1, data.length, data[0].length)
    .setValues(data)
    .activate();

  SpreadsheetApp.flush();
}

function playQuickTags02_ (n) {
  const data = QUICKSTART_DATA_TAGS[n];
  if (!data) throw new Error("playQuickTags2_(): Values for quickstart example couldn't be found. tags:" + n);

  for (var i = 0; i < 5; i++) {
    data[i][2] = randomValueNegative(2, 2);
  }

  const name = (getConstProperties_('financial_year') === DATE_NOW.getFullYear() ? MN_SHORT[DATE_NOW.getMonth()] : MN_SHORT[0]);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    alertQuickstartSheetMissing(name);
    return;
  }

  spreadsheet.setActiveSheet(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 4) lastRow = 4;

  sheet.getRange(lastRow + 1, 6, data.length, data[0].length)
    .setValues(data)
    .activate();

  SpreadsheetApp.flush();
  fillMonthWithZeros(sheet);
}
