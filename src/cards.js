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

	return -1;
}



function optCard_Update_(input) {
	var db_tables, db_cards;
	var aliases;
	var c, i, k;

	if ( !/^\w+$/.test(input.code) ) return 10;

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');
	db_cards = db_tables.cards;

	k = db_cards.ids.indexOf(input.id);
	if (k == -1) return 2;

	c = db_cards.codes.indexOf(input.code);
	if (c != -1) {
		if (db_cards.data[c].id != input.id) return 20;
	}

	aliases = input.aliases.match(/\w+/g);
	if (aliases == null) aliases = [ ];

	for (i = 0; i < aliases.length; i++) {
		if (! /^\w+$/.test(aliases[i])) return 40;
	}

	c = aliases.indexOf(input.code);
	while (c != -1) {
		aliases.splice(c, 1);
		c = aliases.indexOf(input.code);
	}

	db_cards.codes[k] == input.code;

	db_cards.data[k].name = input.name;
	db_cards.data[k].code = input.code;
	db_cards.data[k].limit = Number(input.limit);
	db_cards.data[k].aliases = aliases;

	db_tables.cards = db_cards;

	setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);

	return -1;
}


function optCard_Add_(input) {
	var db_tables, db_cards, cell, string;
	var aliases;
	var c, i, k;

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');
	db_cards = db_tables.cards;

	if (db_cards.count >= 10) return 30;
	if ( !/^\w+$/.test(input.code) ) return 10;

	if (db_cards.codes.indexOf(input.code) != -1) return 20;

	string = optTable_GenerateRandomId_();
	if (!string) return 2;

	aliases = input.aliases.match(/\w+/g);
	if (aliases == null) aliases = [ ];

	for (i = 0; i < aliases.length; i++) {
		if (! /^\w+$/.test(aliases[i])) return 40;
	}

	c = aliases.indexOf(input.code);
	while (c != -1) {
		aliases.splice(c, 1);
		c = aliases.indexOf(input.code);
	}

	cell = {
		id: string,
		name: input.name,
		code: input.code,
		limit: Number(input.limit),
		aliases: aliases
	};

	db_cards.count++;
	db_cards.ids.push(string);
	db_cards.codes.push(input.code);
	db_cards.data.push(cell);

	db_tables.cards = db_cards;

	setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);

	return -1;
}


function cardsRefresh_() {
	var sheet, ranges, rule1, rule2;
	var db_cards, card, list1, list2;
	var text, col, n1, i, j, k;

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
	if (!sheet) return;

	const h_ = TABLE_DIMENSION_.height;
	const w_ = TABLE_DIMENSION_.width;

	const num_acc = getUserConstSettings_('number_accounts');

	db_cards = getPropertiesService_("document", "obj", "DB_TABLES");
	db_cards = db_cards.cards;

	list1 = [ "All" ];
	list2 = [ ];
	col = 2 + w_ + w_*num_acc;

	sheet.getRange(1, col, 1, 11*w_).setValue("");
	sheet.getRange(1, col).setValue("All");

	col += w_;

	for (i = 0; i < db_cards.count; i++) {
		card = db_cards.data[i];

		list1.push(card.code);
		list2.push(card.code);

		for (j = 0; j < card.aliases.length; j++) {
			list2.push(card.aliases[j]);
		}

		ranges = [ ];
		for (j = 0; j < 12; j++) {
			ranges[j] = rollA1Notation(2 + h_*j, 1 + col + w_*i);
		}

		text = "^" + card.code;
		if (card.aliases.length > 0) {
			text += "|" + card.aliases.join("|");
		}
		text += "$";

		sheet.getRange(1, col + w_*i).setValue(text);
		sheet.getRangeList(ranges).setValue("=" + Number(card.limit).formatLocaleSignal());
	}

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
	if (!sheet) return;

	n1 = sheet.getMaxRows() - 5;
	if (n1 < 1) return;

	rule1 = SpreadsheetApp.newDataValidation()
						.requireValueInList(list1, true)
						.setAllowInvalid(true)
						.build();

	rule2 = SpreadsheetApp.newDataValidation()
						.requireValueInList(list2, true)
						.setAllowInvalid(true)
						.build();

	for (i = 0; i < 12; i++) {
		sheet.getRange(2, 2 + 6*i)
			.clearDataValidations()
			.setDataValidation(rule1);

		sheet.getRange(6, 3 + 6*i, n1, 1)
			.clearDataValidations()
			.setDataValidation(rule2);
	}

	SpreadsheetApp.flush();
}
