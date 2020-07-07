function validateFormatRegistry_() {
	var range = SpreadsheetApp.getActiveRange();
	var sheet = range.getSheet();
	var name = sheet.getSheetName();
	var mm;

	if (name === "Cards") {
		mm = range.getColumn();
		mm = (mm - (mm % 6)) / 6;
		formatCards_(mm);

	} else {
		mm = MN_SHORT.indexOf(name);
		if (mm === -1) {
			SpreadsheetApp.getUi().alert(
				"Can't sort registry",
				"Select a month or Cards to sort the registry.",
				SpreadsheetApp.getUi().ButtonSet.OK);
			return;
		}
		formatAccounts_(mm);
	}
}

function formatAccounts_(mm) {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT[mm]);
	var date1, date2;
	var table, nd;
	var c, n, i, k;

	const w_ = TABLE_DIMENSION.width;
	const num_acc = getConstProperties_('number_accounts');

	if (!sheet) return;
	if (sheet.getMaxColumns() < 5 + 5*num_acc) return;

	n = sheet.getMaxRows() - 4;
	if (n < 1) return;

	c = 0;
	sheet.showRows(5, n);

	for (k = 0; k < 1 + num_acc; k++) {
		sheet.getRange(5, 1 + w_*k, n, 4).sort([
			{column:(1 + w_*k), ascending:true},
			{column:(3 + w_*k), ascending:true}
		]);

		i = 0;
		nd = 0;
		table = sheet.getRange(5, 1 + w_*k, n, 4).getValues();
		while (i < n && table[i][2] !== '') {
			if (table[i][0] < 0) nd++;
			i++;
		}

		if (i > c) c = i;
		if (nd > 1) sheet.getRange(5, 1 + w_*k, nd, 4).sort({column:1 + w_*k, ascending:false});
	}

	date1 = DATE_NOW.getTime();
	date2 = getConstProperties_('financial_year');
	date2 = new Date(date2, mm + 1, 0).getTime();

	if (c > 0 && c < n && date2 < date1) sheet.hideRows(5 + c, n - c);
}

function formatCards_(mm) {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cards');
	var table, card;
	var c, n, w_;
	var i, j;

	if (!sheet) return;

	w_ = 6;
	n = sheet.getMaxRows() - 5;

	sheet.getRange(6, 1 + w_*mm, n, 5).sort([
		{column:(3 + w_*mm), ascending:true},
		{column:(1 + w_*mm), ascending:true},
		{column:(4 + w_*mm), ascending:true}
	]);

	i = 0;
	j = 0;
	table = sheet.getRange(6, 1 + w_*mm, n, 5).getValues();
	while (i < n && table[i][3] !== '') {
		c = 0;
		card = table[i][2];
		while (j < n && table[j][3] !== '' && table[j][2] === card) {
			if (table[j][0] < 0) c++;
			j++;
		}

		if (c > 1) sheet.getRange(6 + i, 1 + w_*mm, c, 5).sort({column:1 + w_*mm, ascending:false});
		i = j;
	}
}
