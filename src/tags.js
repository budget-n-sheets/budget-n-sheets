function optMainTags(opt, input) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		console.warn("optMainTags(): Wait lock time out.");
		return 0;
	}

	switch (opt) {
		case "GetData":
			return tagGetData_();
		case 'GetList':
			return optTag_GetList_();
		case 'GetInfo':
			return optTag_GetInfo_(input);
		case 'GetStat':
			return optTag_GetStat_(input);

		case 'isBusy':
			return -1;
		default:
			console.warn("optMainTags(): Switch case is default.", opt);
			return 3;
	}
}


function tagGetData_() {
	var sheet, lastRow;
	var output, data;
	var n, i, j, k, v;

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
	lastRow = sheet.getLastRow();
	if (lastRow < 2) return;
	if (sheet.getMaxColumns() < 20) return;

	output = {
		tags: [ ],
		months: [ ],
		average: [ ],
		total: [ ]
	};

	n = lastRow - 1;
	data = sheet.getRange(2, 5, n, 16).getValues();

	i = 0;
	j = 0;
	while (i < data.length && j < n) {
		if ( /^\w+$/.test(data[i][0]) ) {
			output.tags.push(data[i][0]);

			v = [ ];
			for (k = 0; k < 12; k++) {
			v[k] = data[i][1 + k];
			}
			output.months.push(v);

			output.average.push(data[i][14]);
			output.total.push(data[i][15]);
			i++;
		} else {
			data.splice(i, 1);
		}

		j++;
	}

	output.data = data;
	return output;
}


function optTag_GetList_() {
	var sheet;
	var data, cell, output;
	var a, n, i;

	output = [
		[ 0 ], [ 0 ], [ 0 ], [ 0 ], [ 0 ],
		[ 0 ], [ 0 ], [ 0 ], [ 0 ], [ 0 ]
	];

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
	if (sheet.getMaxColumns() < 20) return 2;

	n = sheet.getLastRow() - 1;
	if (n < 1) return output;

	data = sheet.getRange(2, 1, n, 5).getValues();

	for (i = 0; i < n; i++) {
		if ( !/^\w+$/.test(data[i][4]) ) continue;

		a = TC_NAME_.indexOf(data[i][1]);
		if (a === -1) a = 5;

		cell = {
			name: data[i][0],
			category: TC_CODE_[a],
			description: data[i][2],
			tag: data[i][4],
			analytics: data[i][3]
		}
		output[a].push(cell);
		output[a][0]++;
	}

	return output;
}


function optTag_GetInfo_(input) {
	if (!input) return 3;

	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
	var lastRow = sheet.getLastRow() - 1;
	var vIndex, output;
	var listTags, listTagsExtras;
	var auxCell;
	var a, n, i, j;

	if (lastRow < 1) return 2;

	output = {
		Name: '',
		C: 5,
		Description: '',
		Tag: '',
		analytics: false
	}

	listTags = sheet.getRange(2, 1, lastRow, 5).getValues();
	for (i = 0; i < lastRow; i++) {
		if (listTags[i][4] == input) {
			output.Name = listTags[i][0];
			output.Description = listTags[i][2];
			output.Tag = listTags[i][4];
			output.analytics = listTags[i][3];

			a = TC_NAME_.indexOf(listTags[i][1]);
			if (a === -1) output.C = 5;
			else output.C = a;

			return output;
		}
	}

	return 2;
}


function optTag_GetStat_(input) {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");

	var init = getUserSettings_("InitialMonth");
	var ActualMonth = getUserSettings_('ActualMonth');
	var MFactor = getUserSettings_('MFactor');

	var output;
	var data, avgValue;
	var value, auxValue;
	var lastRow;
	var a, i, v, ta;

	var dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

	if (!dec_p) dec_p = "] [";

	ta = MFactor > 0;
	value = { min: 0, max: 0 };
	output = {
		Interval: "",
		Total: "",
		Average: "",
		Min: "",
		Max: "",
		Data: [ ]
	};

	lastRow = sheet.getLastRow();
	if (lastRow <= 1) return 1;

	data = sheet.getRange(2, 5, lastRow, 1).getValues();

	for (i = 0; i < data.length; i++) {
		if (data[i][0] === input) break;
	}
	if (i == data.length) return 1;

	data = sheet.getRange(2 + i, 6, 1, 12).getValues();
	data = data[0];

	if (ta) {
		avgValue = sheet.getRange(2 + i, 19).getValue().toFixed(2);
		avgValue = +avgValue;
		value.min = +data[init];
		value.max = value.min;

		output.Interval = MN_FULL_[init] + " - " + MN_FULL_[ActualMonth-1];
		output.Total = sheet.getRange(2 + i, 20).getValue().formatFinancial(dec_p);
		output.Average = avgValue.formatFinancial(dec_p);
	}

	output.Data = [
		["Month", "Month", "Month", "Month", "Average"]
	];

	for (i = 0; i < init && i < 12; i++) {
		v = [ MN_SHORT_[i], +data[i].toFixed(2), null, null, null ];
		output.Data.push(v);
	}

	for (; i < init + MFactor && i < 12; i++) {
		v = [ MN_SHORT_[i], null, null, +data[i].toFixed(2), avgValue ];
		output.Data.push(v);

		a = +data[i].toFixed(2);
		if (a < value.min) value.min = a;
		if (a > value.max) value.max = a;
	}

	for (; i < 12; i++) {
		v = [ MN_SHORT_[i], null, +data[i].toFixed(2), null, null ];
		output.Data.push(v);
	}

	if (ta) {
		output.Min = value.min.formatFinancial(dec_p);
		output.Max = value.max.formatFinancial(dec_p);
	}

	return output;
}
