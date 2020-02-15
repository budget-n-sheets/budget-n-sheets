function cardsGetData_() {
	var sheet, db_cards;
	var output, data;
	var c, n, v, i, k;
	var h_, w_;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	n = getUserConstSettings_('number_accounts');

	db_cards = getPropertiesService_("document", "obj", "DB_TABLES");
	db_cards = db_cards.cards;
	if (db_cards.count == 0) return;

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
	if (!sheet) return;
	if (sheet.getMaxRows() < 1 + h_*12) return;

	output = {
		cards: [ "All" ],
		balance: [
			[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
		]
	};


	data = sheet.getRange(
		1, 1 + w_ + n*w_ + 1,
		1 + 12*h_, w_
	).getValues();
	for (i = 0; i < 12; i++) {
		output.balance[0][i] = data[5 + h_*i][0];
	}

	data = sheet.getRange(
		1, 1 + w_ + n*w_ + w_ + 1,
		1 + 12*h_, w_*db_cards.count
	).getValues();
	for (k = 0; k < db_cards.count; k++) {
		c = data[0].indexOf(db_cards.codes[k]);
		if (c === -1) continue;

		v = [ ];
		for (i = 0; i < 12; i++) {
			v[i] = data[5 + h_*i][c];
		}

		output.cards.push(db_cards.codes[k]);
		output.balance.push(v);
	}

	return output;
}


function optCard_Remove_(input) {
	var db_tables, db_cards;
	var k;

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');
	db_cards = db_tables.cards;

	k = db_cards.ids.indexOf(input);
	if (k == -1) return 1;

	db_cards.count--;
	db_cards.ids.splice(k, 1);
	db_cards.codes.splice(k, 1);
	db_cards.data.splice(k, 1);

	db_tables.cards = db_cards;
	setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);

	optCard_Refresh_();
	return -1;
}



function optCard_Update_(input) {
	var db_tables, db_cards;
	var k;

	if ( !/^\w+$/.test(input.code) ) return 10;

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');
	db_cards = db_tables.cards;

	if (db_cards.codes.indexOf(input.code) != -1) return 20;

	k = db_cards.ids.indexOf(input.id);
	if (k == -1) return 2;

	db_cards.codes[k] == input.code;

	db_cards.data[k].name = input.name;
	db_cards.data[k].code = input.code;

	db_tables.cards = db_cards;

	setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);

	optCard_Refresh_();
	return -1;
}


function optCard_Add_(input) {
	var db_tables, db_cards, cell, string;
	var c, k;

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');
	db_cards = db_tables.cards;

	if (db_cards.count >= 10) return 30;
	if ( !/^\w+$/.test(input.code) ) return 10;

	if (db_cards.codes.indexOf(input.code) != -1) return 20;

	string = optTable_GenerateRandomId_();
	if (!string) return 2;

	cell = {
		id: string,
		name: input.name,
		code: input.code,
		limit: 0
	};

	db_cards.count++;
	db_cards.ids.push(string);
	db_cards.codes.push(input.code);
	db_cards.data.push(cell);

	db_tables.cards = db_cards;

	setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);

	optCard_Refresh_();
	return -1;
}


function optCard_Refresh_() {
	var sheetBackstage = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage"),
			sheetSettings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Settings");
	var number_accounts = getUserConstSettings_('number_accounts');
	var db_cards;
	var h_, w_;
	var c, i;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	db_cards = getPropertiesService_("document", "obj", "DB_TABLES");
	db_cards = db_cards.cards;

	c = 1 + 1 + w_ + w_*number_accounts;
	sheetBackstage.getRange(1, c, 1, w_*11).setValue("");
	sheetBackstage.getRange(1, c).setValue("All");

	sheetSettings.getRange("B11:B20").setValue("");
	sheetSettings.getRange("B10").setValue("All");

	c += w_;
	for (i = 0; i < db_cards.count; i++) {
		sheetBackstage.getRange(1, c + w_*i).setValue(db_cards.codes[i]);
		sheetSettings.getRange(11 + i, 2).setValue(db_cards.codes[i]);
	}

	SpreadsheetApp.flush();
}
