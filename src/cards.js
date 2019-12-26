function cardsGetData_() {
	var sheet;
	var output, data;
	var c, n, v, i, k;
	var h_, w_;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	n = getUserConstSettings_('number_accounts');

	db_cards = getPropertiesService_("document", "obj", "DB_CARD");
	if (!db_cards) return;
	if (db_cards.length == 0) return;

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
		1 + 12*h_, w_*db_cards.length
	).getValues();
	for (k = 0; k < db_cards.length; k++) {
		c = data[0].indexOf(db_cards[k].Code);
		if (c === -1) continue;

		v = [ ];
		for (i = 0; i < 12; i++) {
			v[i] = data[5 + h_*i][c];
		}

		output.cards.push(db_cards[k].Code);
		output.balance.push(v);
	}

	return output;
}


function optCard_Remove_(input) {
	var dbCard;
	var k;

	dbCard = getPropertiesService_('document', 'json', 'DB_CARD');

	for (k = 0; k < dbCard.length; k++) {
		if (dbCard[k].Id === input) break;
	}
	if (k >= dbCard.length || dbCard[k].Id !== input) return 1;

	dbCard.splice(k, 1);
	setPropertiesService_('document', 'json', 'DB_CARD', dbCard);

	optCard_Refresh_();
	return -1;
}



function optCard_Update_(input) {
	var dbCard;
	var k;

	if ( !/^\w+$/.test(input.Code) ) return 10;

	dbCard = getPropertiesService_('document', 'json', 'DB_CARD');

	for (k = 0; k < dbCard.length; k++) {
		if (dbCard[k].Code === input.Code) return 20;
		if (dbCard[k].Id === input.Id) break;
	}
	if (k >= dbCard.length) return 2;

	dbCard[k].Name = input.Name;
	dbCard[k].Code = input.Code;
	dbCard[k].Limit = 0;

	setPropertiesService_('document', 'json', 'DB_CARD', dbCard);

	optCard_Refresh_();
	return -1;
}


function optCard_Add_(input) {
	var dbCard, cell, string;
	var c, k;

	dbCard = getPropertiesService_('document', 'json', 'DB_CARD');

	if (dbCard.length >= 10) return 30;
	if ( !/^\w+$/.test(input.Code) ) return 10;

	for (k = 0; k < dbCard.length; k++) {
		if (dbCard[k].Code === input.Code) return 20;
	}

	string = optTable_GenerateRandomId_();
	if (!string) return 2;

	cell = {
		Id: string,
		Name: input.Name,
		Code: input.Code,
		Limit: 0
	};

	dbCard.push(cell);
	setPropertiesService_('document', 'json', 'DB_CARD', dbCard);

	optCard_Refresh_();
	return -1;
}


function optCard_Refresh_() {
	var sheetBackstage = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage"),
			sheetSettings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Settings");
	var number_accounts = getUserConstSettings_('number_accounts');
	var db_card;
	var h_, w_;
	var c, i;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	db_card = getPropertiesService_("document", "obj", "DB_CARD");

	c = 1 + 1 + w_ + w_*number_accounts;
	sheetBackstage.getRange(1, c, 1, w_*11).setValue("");
	sheetBackstage.getRange(1, c).setValue("All");

	sheetSettings.getRange("B11:B20").setValue("");
	sheetSettings.getRange("B10").setValue("All");

	c += w_;
	for (i = 0; i < db_card.length; i++) {
		sheetBackstage.getRange(1, c + w_*i).setValue(db_card[i].Code);
		sheetSettings.getRange(11 + i, 2).setValue(db_card[i].Code);
	}

	SpreadsheetApp.flush();
}
