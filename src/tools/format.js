function validateFormatRegistry_() {
	var range = SpreadsheetApp.getActiveRange();
	var sheet = range.getSheet();
	var name = sheet.getSheetName();
	var mm;

	if (name === "Cards") {
		mm = range.getColumn();
		mm = (mm - (mm % 6)) / 6;
		formatCards_(mm);
  } else if (name === 'Tags') {
    formatTags_();
	} else {
		mm = MN_SHORT.indexOf(name);
		if (mm === -1) {
			SpreadsheetApp.getUi().alert(
				"Can't sort registry",
				"Select a month, Cards or Tags to sort the registry.",
				SpreadsheetApp.getUi().ButtonSet.OK);
			return;
		}
		formatAccounts_(mm);
	}
}

function formatTags_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  var table, rem, i, n;

  if (!sheet) return;

  maxRows = sheet.getMaxRows() - 1;
  if (maxRows < 1) return;

  range = sheet.getRange(2, 1, maxRows, 5);

  i = -1;
  n = 0;
  table = range.getValues();
  while (++i < table.length) {
    if (table[i][4] === '') n++;
  }
  if (n === table.length) {
    sheet.getRnage(2, 4, table.length, 1).removeCheckboxes();
    return;
  }

  range.sort([
    { column: 2, ascending: true },
    { column: 1, ascending: true }
  ]);

  sheet.getRange(2, 4, table.length - n, 1).insertCheckboxes();
  if (n > 0) {
    sheet.getRange(2 + table.length - n, 4, n, 1).removeCheckboxes();
  }
  SpreadsheetApp.flush();
}

function formatAccounts_(mm) {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[mm]);
	var date1, date2;
	var table, snapshot;
	var cc, n, i, k;

	const w_ = TABLE_DIMENSION.width;
	const num_acc = getConstProperties_('number_accounts');

	if (!sheet) return;
	if (sheet.getMaxColumns() < 5 + 5*num_acc) return;

  const lastRow = sheet.getLastRow() - 4;
  if (lastRow < 1) return;

	sheet.showRows(5, lastRow);

  snapshot = sheet.getRange(5, 1, lastRow, w_*(1 + num_acc)).getValues();

	for (k = 0; k < 1 + num_acc; k++) {
    i = 0;
    cc = w_*k;
    while (i < lastRow && snapshot[i][2 + cc] !== '') { i++; }

    if (i === 0) continue;

    n = i;
    range = sheet.getRange(5, 1 + cc, n, 4);

		range.sort([
			{ column: (1 + cc), ascending: true },
			{ column: (3 + cc), ascending: true }
		]);

		i = 0;
		table = range.getValues();
		while (i < n && table[i][0] < 0) { i++; }

		if (i > 1) sheet.getRange(5, 1 + cc, i, 4).sort({column:1 + cc, ascending:false});
	}

	date1 = DATE_NOW.getTime();
	date2 = getConstProperties_('financial_year');
	date2 = new Date(date2, mm + 1, 0).getTime();

  n = sheet.getMaxRows();
	if (lastRow > 4 && lastRow < n && date2 < date1) sheet.hideRows(lastRow + 1, n - lastRow);
}

function formatCards_(mm) {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cards');
	var lastRow, table, card;
	var c, n;
	var i, j;

	if (!sheet) return;

	const w_ = 6;
  const cc = w_*mm;

  lastRow = sheet.getLastRow();
  if (lastRow < 6) return;

  i = 0;
  n = lastRow - 5;
  table = sheet.getRange(6, 4 + cc, n, 1).getValues();
  while (i < n && table[i][0] !== '') { i++; }

  if (i === 0) return;
  n = i;

	sheet.getRange(6, 1 + w_*mm, n, 5).sort([
		{column:(3 + cc), ascending:true},
		{column:(1 + cc), ascending:true},
		{column:(4 + cc), ascending:true}
	]);

	i = 0;
	j = 0;
	table = sheet.getRange(6, 1 + cc, n, 5).getValues();
	while (i < n) {
		c = j;
		card = table[i][2];
		while (j < n && table[j][2] === card && table[j][0] < 0) { j++; }
    c = j - c;

		if (c > 1) sheet.getRange(6 + i, 1 + cc, c, 5).sort({column:1 + cc, ascending:false});

    while (j < n && table[j][2] === card) { j++; }
		i = j;
	}
}
