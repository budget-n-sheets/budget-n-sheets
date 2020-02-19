function optMainTables(opt, param) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		consoleLog_('warn', 'optMainTables(): Wait lock time out.', err);
		return 0;
	}

	switch (opt) {
		case 'GetList':
			return optTable_GetList_();
		case 'GetInfo':
			return optTable_GetInfo_(param);
		case 'GenerateRandomId':
			return optTable_GenerateRandomId_();

		case 'UpdateAccount':
			return optAccount_Update_(param);
		case 'UpdateTableRef':
			return optAccount_UpdateTableRef_();

		case 'AddCard':
			return optCard_Add_(param);
		case 'UpdateCard':
			return optCard_Update_(param);
		case 'RemoveCard':
			return optCard_Remove_(param);

		case 'isBusy':
			return -1;
		default:
			console.warn("optMainTables(): Switch case is default.", opt);
			return 3;
	}
}


function optTable_GetInfo_(r) {
	var db_tables;
	var array, k;

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');

	k = db_tables.accounts.ids.indexOf(r);
	if (k != -1) return db_tables.accounts.data[k];

	k = db_tables.cards.ids.indexOf(r);
	if (k != -1) return db_tables.cards.data[k];

	console.warn("optTable_GetInfo_(): Table was not found.");
	return 2;
}


function optTable_GetList_() {
	var db_tables, db;

	db = {
		accounts: [ ],
		cards: [ ]
	}

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');

	db.accounts = db_tables.accounts.data;
	db.cards = db_tables.cards.data;

	return db;
}


function getTableGreatList_() {
	var db, db_account, db_card;
	var k;

	db = {
		list: [ ],
		list_account: [ ],
		list_card: [ ]
	};

	db_account = getPropertiesService_('document', 'json', 'DB_ACCOUNT');
	db_card = getPropertiesService_('document', 'json', 'DB_CARD');

	for (k = 0; k < db_account.length; k++) {
		db_account[k].BalanceString = db_account[k].Balance.formatCurrency();
		db_account[k].Type = 'Account';

		db.list.push(db_account[k]);
		db.list_account.push(db_account[k].Name);
	}

	for (k = 0; k < db_card.length; k++) {
		db_card[k].LimitString = db_card[k].Limit.formatCurrency();
		db_card[k].Type = 'Card';

		db.list.push(db_card[k]);
		db.list_card.push(db_card[k].Code);
	}

	return db;
}


function optTable_GenerateRandomId_() {
	var db_tables, list;
	var string, i;

	string = '';
	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');

	list = [ db_tables.wallet ].concat(db_tables.accounts.ids);
	list = list.concat(db_tables.cards.ids);

	i = 0;
	do {
		string = randomString(7, "lonum");
		if (list.indexOf(string) == -1) break;
		i++;
	} while (i < 99);

	if (i >= 99) {
		console.warn("optTable_GenerateRandomId_(): Maximum iterations allowed hit.");
		return;
	}

	return string;
}


function optAccount_UpdateTableRef_() {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cash Flow');
	var db_accounts;
	var number_accounts = getUserConstSettings_('number_accounts'),
			yyyy = getUserConstSettings_('financial_year');
	var range_, string, mm, dd,
			i, k, h_;

	if (!sheet) return 2;

	h_ = TABLE_DIMENSION_.height;
	range_ = [ "G", "L", "Q", "V", "AA" ];

	db_accounts = getPropertiesService_('document', 'json', 'DB_TABLES');
	db_accounts = db_accounts.accounts;

	sheet.getRange(3, 3).setFormula('=B3');
	for (i = 1; i < 12; i++) {
		dd = new Date(yyyy, i, 0).getDate();
		sheet.getRange(3, 3+i*4).setFormulaR1C1('=R[' + (dd - 1) + ']C[-4]+RC[-1]');
	}
	SpreadsheetApp.flush();

	k = 0;
	while (k < number_accounts) {
		mm = db_accounts.data[k].time_a;

		string = sheet.getRange(3, 3 + 4*mm).getFormula();
		string += "+\'_Backstage\'!" + range_[k] + (2 + h_*mm);
		sheet.getRange(3, 3+mm*4).setFormula(string);
		Utilities.sleep(137);

		k++;
	}

	return -1;
}



function optAccount_Update_(input) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
			sheet = spreadsheet.getSheetByName('_Backstage');
	var db_tables, db_accounts;
	var auxCell, newCell;
	var a, b, k, h_, w_;

	if (!sheet) return 2;

	db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');
	db_accounts = db_tables.accounts;

	h_ = TABLE_DIMENSION_.height;
	w_ = TABLE_DIMENSION_.width;

	k = db_accounts.ids.indexOf(input.id);
	if (k == -1) return 2;

	a = db_accounts.data[k].time_a;

	db_accounts.names[k] = input.name;

	db_accounts.data[k].name = input.name;
	db_accounts.data[k].time_a = Number(input.time_a);
	db_accounts.data[k].balance = Number(input.balance);

	db_tables.accounts = db_accounts;

	setPropertiesService_('document', 'json', 'DB_TABLES', db_tables);

	try {
		if (a > 0) b = "=R[-"+(h_-1)+"]C";
		else b = "=0";
		sheet.getRange(2+h_*a, 1+w_+1+w_*k).setFormulaR1C1(b);

		spreadsheet.getSheetByName('Jan')
			.getRange(1, 6+k*5)
			.setValue(input.name);
		sheet.getRange(1, 1+w_+1+w_*k).setValue(input.name);
		sheet.getRange(2+input.time_a*h_, 1+w_+1+k*w_).setFormula('='+Number(input.balance).formatLocaleSignal());

		optAccount_UpdateTableRef_();
	} catch (err) {
		consoleLog_('error', 'optAccount_Update_(): Spreadsheet update failed.', err);
		return 1;
	}

	return -1;
}
