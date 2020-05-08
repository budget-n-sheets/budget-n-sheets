function getDbTables_(select) {
	var db_tables = getCacheService_("document", "DB_TABLES", "json");

	if (!db_tables) {
		db_tables = getPropertiesService_("document", "json", "DB_TABLES");
		putCacheService_("document", "DB_TABLES", "json", db_tables);
	}

	if (select) return db_tables[select];
	return db_tables;
}


function setDbTables_(db, select) {
	var db_tables;

	if (select) {
		db_tables = getPropertiesService_("document", "json", "DB_TABLES");
		db_tables[select] = db;
	} else {
		db_tables = db;
	}

	setPropertiesService_("document", "json", "DB_TABLES", db_tables);
	putCacheService_("document", "DB_TABLES", "json", db_tables);
}


function tablesService(action, select, param) {
	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(2000);
	} catch (err) {
		consoleLog_("warn", "tablesService(): Wait lock time out.", err);
		return 1;
	}

	switch (action) {
	case "get":
		return getTablesService_(select, param);
	case "set":
		return setTablesService_(select, param);
	case "refresh":
		return refreshTablesService_(select, param);

	default:
		consoleLog_("warn", "tablesService(): Switch case is default.", action);
		return 1;
	}
}

function getTablesService_(select, param) {
	switch (select) {
	case "all":
		return getTables_();
	case "accounts":
	case "cards":
		return getSelectedData_(select);
	case "account":
		return getAccountById_(param);
	case "card":
		return getCardById_(param);

	default:
		consoleLog_("warn", "getTablesService_(): Switch case is default.", select);
		return 1;
	}
}

function setTablesService_(select, param) {
	switch (select) {
	case "account":
		return setAccount_(param);
	case "addcard":
		return addCard_(param);
	case "setcard":
		return setCard_(param);
	case "deletecard":
		return deleteCard_(param);

	default:
		consoleLog_("warn", "setTablesService_(): Switch case is default.", select);
		return 1;
	}
}

function refreshTablesService_(select, param) {
	switch (select) {
	case "accountname":
		return refreshAccountName_(param);
	case "cashflow":
		return refreshCashFlowReferences_();
	case "cardsrules":
		return refreshCardsRules_();

	default:
		consoleLog_("warn", "refreshTablesService_(): Switch case is default.", select);
		return 1;
	}
}


function getTables_() {
	const db_tables = getDbTables_();

	var db = {
		accounts: db_tables.accounts.data,
		cards: db_tables.cards.data
	};

	return db;
}


function getSelectedData_(select) {
	var db = getDbTables_(select);
	return db.data;
}


function getAccountById_(acc_id) {
	const db_accounts = getDbTables_("accounts");

	var c = db_accounts.ids.indexOf(acc_id);
	if (c !== -1) return db_accounts.data[c];

	console.warn("getAccountById_(): Account was not found.");
}


function setAccount_(account) {
	var prev_time_a, c;

	const db_accounts = getDbTables_("accounts");

	c = db_accounts.ids.indexOf(account.id);
	if (c === -1) return 1;

	prev_time_a = account.time_a;

	account.time_a = Number(account.time_a);
	account.balance = Number(account.balance);

	db_accounts.names[c] = account.name;

	db_accounts.data[c].name = account.name;
	db_accounts.data[c].time_a = account.time_a;
	db_accounts.data[c].balance = account.balance;

	setDbTables_(db_accounts, "accounts");

	refreshAccountName_(c, account, prev_time_a);
	refreshCashFlowReferences_();
}


function refreshAccountName_(c, account, prev_time_a) {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = spreadsheet.getSheetByName("_Backstage");
	var spreadsheet, sheet, formula;

	if (!sheet) return 1;

	const h_ = TABLE_DIMENSION.height;
	const w_ = TABLE_DIMENSION.width;

	const col = 2 + w_ + w_*c;
	const time_a = account.time_a;

	if (time_a > 0) formula = "=R[-" + (h_ - 1) + "]C";
	else formula = "=0";

	sheet.getRange(1, col).setValue(account.name);
	sheet.getRange(2 + h_*prev_time_a, col).setFormulaR1C1(formula);
	sheet.getRange(2 + h_*time_a, col).setFormula("=" + account.balance.formatLocaleSignal());

	if (spreadsheet.getSheetByName("Jan")) {
		spreadsheet.getSheetByName("Jan")
			.getRange(1, 6 + 5*c)
			.setValue(account.name);
	}
}


function refreshCashFlowReferences_() {
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cash Flow");
	var formulas;
	var string, mm, dd, i, k;

	if (!sheet) return 1;

	const h_ = TABLE_DIMENSION.height;

	const ranges = [ "G", "L", "Q", "V", "AA" ];

	const num_acc = getConstProperties_("number_accounts");
	const yyyy = getConstProperties_("financial_year");

	const db_accounts = getDbTables_("accounts");

	formulas = [ "=0 + B4" ];

	for (i = 1; i < 12; i++) {
		dd = new Date(yyyy, i, 0).getDate();
		formulas[i] = "=" + rollA1Notation(3 + dd, 4*i - 1) + " + " + rollA1Notation(4, 2 + 4*i);
	}

	for (k = 0; k < num_acc; k++) {
		mm = db_accounts.data[k].time_a;
		formulas[mm] += " + \'_Backstage\'!" + ranges[k] + (2 + h_*mm);
	}

	for (i = 0; i < 12; i++) {
		sheet.getRange(4, 3 + 4*i).setFormula(formulas[i]);
	}
}
