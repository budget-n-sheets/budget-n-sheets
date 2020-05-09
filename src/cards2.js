function getCardById_(card_id) {
	const db_tables = getDbTables_("cards");
	var c = db_tables.ids.indexOf(card_id);
	if (c !== -1) return db_tables.data[c];
}


function addCard_(card) {
	var aliases, c;

	if (! /^\w+$/.test(card.code)) return 10;

	const db_cards = getDbTables_("cards");

	if (db_cards.count >= 10) return 12;
	if (db_cards.codes.indexOf(card.code) !== -1) return 11;

	aliases = card.aliases.match(/\w+/g);
	if (aliases == null) aliases = [ ];

	c = aliases.indexOf(input.code);
	while (c !== -1) {
		aliases.splice(c, 1);
		c = aliases.indexOf(input.code);
	}

	card.id = randomString(7, "lonum");
	card.aliases = aliases;
	card.limit = Number(card.limit);

	c = db_cards.count++;

	db_cards.ids[c] = card.id;
	db_cards.codes[c] = card.code;
	db_cards.data[c] = card;

	setDbTables_(db_cards, "cards");
}


function setCard_(card) {
	var aliases;
	var pos, c, i;

	if (! /^\w+$/.test(card.code)) return 10;

	const db_cards = getDbTables_("cards");

	pos = db_cards.ids.indexOf(card.id);
	if (pos === -1) return 1;

	for (i = 0; i < db_cards.codes.length; i++) {
		if (i !== pos && db_cards.codes[i] === card.code) return 11;
	}

	aliases = card.aliases.match(/\w+/g);
	if (aliases == null) aliases = [ ];

	c = aliases.indexOf(card.code);
	while (c !== -1) {
		aliases.splice(c, 1);
		c = aliases.indexOf(card.code);
	}

	db_cards.codes[pos] = card.code;

	db_cards.data[pos] = {
		id: card.id,
		name: card.name,
		code: card.code,
		aliases: aliases,
		limit: Number(card.limit)
	};

	setDbTables_(db_cards, "cards");
}


function deleteCard_(card_id) {
	const db_cards = getDbTables_("cards");

	var c = db_cards.ids.indexOf(input);
	if (c === -1) return;

	db_cards.count--;
	db_cards.ids.splice(c, 1);
	db_cards.codes.splice(c, 1);
	db_cards.data.splice(c, 1);

	setDbTables_(db_cards, "cards");
}


function getCardsBalances_() {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
	var balances, data, code;
	var v, i, k;

	if (!sheet) return;

	const h_ = TABLE_DIMENSION.height;
	const w_ = TABLE_DIMENSION.width;

	const num_acc = getConstProperties_("number_accounts");
	const db_cards = getDbTables_("cards");

	const col = 2 + w_ + w_*num_acc;
	const num_cards = db_cards.count;

	if (db_cards.count == 0) return;

	balances = {
		cards: [ "All" ],
		balance: [
			[ 0, 0, 0, 0, 0, 0, 0, 0,	0, 0, 0, 0 ]
		]
	};

	data = sheet.getRange(1, col, 1 + 12*h_, w_).getValues();
	for (i = 0; i < 12; i++) {
		balances.balance[0][i] = data[5 + h_*i][0];
	}

	data = sheet.getRange(1, col + w_, 1 + 12*h_, w_*num_cards).getValues();

	for (k = 0; k < num_cards; k++) {
		if (data[0][w_*k] == "") continue;

		code = data[0][w_*k].match(/\w+/g);
		if (code == null) continue;

		for (i = 0; i < code.length; i++) {
			if (db_cards.codes.indexOf(code[i]) !== -1) break;
		}
		if (i == code.length) continue;

		balances.cards.push(code[i]);

		v = [ ];
		for (i = 0; i < 12; i++) {
			v[i] = data[5 + h_*i][w_*k];
		}

		balances.balance.push(v);
	}

	return balances;
}


function refreshCardsRules_() {
	var sheet, ranges, rule1, rule2;
	var card, list1, list2;
	var text, col, n1, i, j, k;

	sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
	if (!sheet) return;

	const h_ = TABLE_DIMENSION.height;
	const w_ = TABLE_DIMENSION.width;

	const num_acc = getConstProperties_("number_accounts");

	const db_cards = getPropertiesService_("document", "obj", "DB_TABLES");

	col = 2 + w_ + w_*num_acc;

	list1 = [ "All" ];
	list2 = [ ];

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

		text = "^" + card.code + "$";
		for (j = 0; j < card.aliases.length; j++) {
			text += "|^" + card.aliases[j] + "$";
		}

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
