function optMainTables(opt, param) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(2000);
  } catch(err) {
    return 0;
  }

  switch(opt) {
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
      Logger.log("optMainTables(): Switch case is default.");
      Logger.log(opt);
      return 3;
  }
}



function optTable_GetInfo_(r) {
  var array, k;

  array = getPropertiesService_('document', 'json', 'DB_ACCOUNT');
  array = array.concat( getPropertiesService_('document', 'json', 'DB_CARD') );


  for(k = 0;  k < array.length;  k++) {
    if(r === array[k].Id) {
      return array[k];
    }
  }

  console.warn("optTable_GetInfo_(): Table was not found.");
  return 2;
}


function optTable_GetList_() {
  var dbAccountInfo, dbCardInfo;
  var k;

  dbAccountInfo = getPropertiesService_('document', 'json', 'DB_ACCOUNT');
  dbCardInfo = getPropertiesService_('document', 'json', 'DB_CARD');


  for(k = 0;  k < dbAccountInfo.length;  k++) {
    dbAccountInfo[k].BalanceString = dbAccountInfo[k].Balance.formatCurrency();
    dbAccountInfo[k].Type = 'Account';
  }

  for(k = 0;  k < dbCardInfo.length;  k++) {
    dbCardInfo[k].LimitString = dbCardInfo[k].Limit.formatCurrency();
    dbCardInfo[k].Type = 'Card';
  }

  return dbAccountInfo.concat(dbCardInfo);
}


function optTable_GenerateRandomId_() {
  var array, string;
  var n, i, k;

  string = '';
  array = getPropertiesService_('document', 'json', 'DB_ACCOUNT');
  array = array.concat( getPropertiesService_('document', 'json', 'DB_CARD') );


  i = 0;
  n = array.length;
  do {
    string = randomString(11, "word");
    for(k = 0;  k < n;  k++) {
      if(string === array[k].Id) break;
    }
    i++;
  } while(k !== n  &&  i < 100);

  if(i === 100) {
    console.warn("optTable_GenerateRandomId_(): Maximum iterations allowed hit.");
    return;
  }

  return string;
}



function optCard_SetCard_(input) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBackstage = spreadsheet.getSheetByName('_Backstage'),
      sheetSettings = spreadsheet.getSheetByName('_Settings');
  var number_accounts = getPropertiesService_('document', 'number', 'number_accounts');
  var col, maxRows;
  var formula,
      ref, i;

  if(!sheetBackstage) return 2;
  if(!sheetSettings) return 2;

  col = 3 + number_accounts*3 + 2 + 1;
  maxRows = sheetBackstage.getMaxRows();
  ref = 'LNECARD(FILTER(\'Cards\'!';


  try {
    sheetBackstage.insertColumnAfter(col-1);
    sheetBackstage.getRange(1,col-1, maxRows,1)
      .copyTo(sheetBackstage.getRange(1,col, maxRows,1), {formatOnly:true});
    sheetBackstage.getRange(1, col).setValue(input.Code);

    for(i = 0;  i < 12;  i++) {
      formula = ref;
      formula += rollA1Notation(6,2+i*6, -1,4);
      formula += "; \'Cards\'!" + rollA1Notation(6,3+i*6, -1,1);
      formula += "=" + rollA1Notation(1, col);
      formula += "; \'Cards\'!" + rollA1Notation(6,4+i*6, -1,1);
      formula += "<>\"\"";
      formula += "))";

      sheetBackstage.getRange(3+i*6, col).setFormula(formula); // LNECARD
    }


    ref = sheetSettings.getRange("B11:B20").getValues();
    for(i = 0;  i < 10;  i++) {
      if(ref[i][0] == "") {
        sheetSettings.getRange(11+i, 2).setValue(input.Code);
        break;
      }
    }
  } catch(err) {
    console.error("optCard_SetCard_(): Spreadsheet update failed.", err);
    Logger.log("optCard_SetCard_(): Spreadsheet update failed.");
    Logger.log(err.message);
    return 1;
  }

  return -1;
}


function optCard_Load_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBackstage = spreadsheet.getSheetByName('_Backstage'),
      sheetCards = spreadsheet.getSheetByName('Cards');
  var number_accounts = getPropertiesService_('document', 'number', 'number_accounts');
  var maxColumns;
  var range,
      ref, i;

  if(!sheetBackstage) return 2;
  if(!sheetCards) return 2;

  maxColumns = sheetBackstage.getMaxColumns();
  ref = rollA1Notation(1,maxColumns-1, 1,2);


  try {
    for(i = 0;  i < 12;  i++) {
      range = sheetCards.getRange(2,1+i*6);
      range.setValue('All');

      sheetCards.getRange(2, 4+i*6).setFormula('LNEINFCARD(OFFSET(INDIRECT(ADDRESS(2; '+(3+number_accounts*3+1)+'+MATCH('+range.getA1Notation()+'; \'_Backstage\'!'+ref+'; 0); 4; true; "_Backstage")); '+(i*6)+'; 0; 6; 1))');

      sheetBackstage.getRange(3+i*6, maxColumns-1)
        .setFormula('SUM(OFFSET('+rollA1Notation(3+i*6, maxColumns-1)+'; 0; 1; 1; \'_Settings\'!$B9))'); // Credit
      sheetBackstage.getRange(4+i*6, maxColumns-1)
        .setFormula('SUM(OFFSET('+rollA1Notation(4+i*6, maxColumns-1)+'; 0; 1; 1; \'_Settings\'!$B9))'); // Expenses
      sheetBackstage.getRange(5+i*6, maxColumns-1)
        .setFormula('SUM(OFFSET('+rollA1Notation(5+i*6, maxColumns-1)+'; 0; 1; 1; \'_Settings\'!$B9))'); // Expenses ^ign
      sheetBackstage.getRange(6+i*6, maxColumns-1)
        .setFormula('SUM(OFFSET('+rollA1Notation(6+i*6, maxColumns-1)+'; 0; 1; 1; \'_Settings\'!$B9))'); // Balance
    }
  } catch(err) {
    console.error("optCard_Load_(): Spreadsheet update failed.", err);
    Logger.log("optCard_Load_(): Spreadsheet update failed.");
    Logger.log(err.message);
    return 1;
  }

  sheetCards.showSheet();
  return -1;
}


function optCard_PurgeCard_(input, n) {
  var sheetBackstage = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Backstage'),
      sheetSettings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Settings');
  var maxColumns;
  var ref, i;

  if(!sheetBackstage) return 2;
  if(!sheetSettings) return 2;

  maxColumns = sheetBackstage.getMaxColumns();


  try {
    ref = sheetBackstage.getRange(1,1, 1,maxColumns).getValues();
    for(i = maxColumns-n;  i < maxColumns;  i++) {
      if(ref[0][i] === input) {
        sheetBackstage.deleteColumn(1 + i);
        break;
      }
    }

    ref = sheetSettings.getRange("B11:B20").getValues();
    for(i = 0;  i < 10;  i++) {
      if(ref[i][0] === input) {
        sheetSettings.getRange(11+i, 2).setValue("");
        break;
      }
    }
  } catch(err) {
    console.error("optCard_PurgeCard_(): Spreadsheet update failed.", err);
    Logger.log("optCard_PurgeCard_(): Spreadsheet update failed.");
    Logger.log(err.message);
    return 1;
  }

  return -1;
}


function optCard_Unload_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBackstage = spreadsheet.getSheetByName('_Backstage'),
      sheetCards = spreadsheet.getSheetByName('Cards');
  var maxColumns;
  var ref, n, i;

  if(!sheetBackstage) return 2;
  if(!sheetCards) return 2;

  maxColumns = sheetBackstage.getMaxColumns();
  n = sheetCards.getMaxRows() - 5;


  try {
    for(i = 0;  i < 12;  i++) {
      sheetCards.getRange(2, 1+i*6).setValue(null);
      sheetCards.getRange(2, 4+i*6).setValue(null);
    }

    sheetBackstage.getRange(2, maxColumns, sheetBackstage.getMaxRows()-1, 1)
      .setValue(null);
  } catch(err) {
    console.error("optCard_Unload_(): Spreadsheet update failed.", err);
    Logger.log("optCard_Unload_(): Spreadsheet update failed.");
    Logger.log(err.message);
    return 1;
  }

  return -1;
}


function optCard_Remove_(input) {
  var dbCard, cell;
  var k;

  dbCard = getPropertiesService_('document', 'json', 'DB_CARD');


  for(k = 0;  k < dbCard.length;  k++) {
    if(dbCard[k].Id === input) break;
  }
  if(dbCard[k].Id !== input) return 1;

  cell = dbCard[k];


  if(optCard_PurgeCard_(cell.Code, dbCard.length) !== -1) return 2;
  if(dbCard.length === 1  &&  optCard_Unload_() !== -1) return 2;

  dbCard.splice(k, 1);
  setPropertiesService_('document', 'json', 'DB_CARD', dbCard);

  return -1;
}


function optCard_Update_(input) {
  var sheetBackstage = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Backstage'),
      sheetSettings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Settings');
  var dbCard, values;
  var a, c, i, k, n;

  if(!sheetBackstage) return 2;
  if(!sheetSettings) return 2;
  if( !/[A-Z][0-9A-Z]{1,13}/.test(input.Code) ) return 10;

  c = sheetBackstage.getMaxColumns();
  dbCard = getPropertiesService_('document', 'json', 'DB_CARD');
  n = dbCard.length;


  for(k = 0;  k < n;  k++) {
    if(dbCard[k].Id === input.Id) break;
    else if(dbCard[k].Code === input.Code) return 20;
  }
  if(k === n) return 2;

  a = dbCard[k].Code;

  dbCard[k].Name = input.Name;
  dbCard[k].Code = input.Code;
  dbCard[k].Limit = 0;

  setPropertiesService_('document', 'json', 'DB_CARD', dbCard);


  try {
    values = sheetBackstage.getRange(1, 1, 1, c).getValues();
    for(i = c-n;  i < c;  i++) {
      if(values[0][i] === a) {
        sheetBackstage.getRange(1, i+1).setValue(input.Code);
        break;
      }
    }

    values = sheetSettings.getRange("B11:B20").getValues();
    for(i = 0;  i < 10;  i++) {
      if(values[i][0] === a) {
        sheetSettings.getRange(11+i, 2).setValue(input.Code);
        break;
      }
    }
  } catch(err) {
    console.error("optCard_Update_(): Spreadsheet update failed.", err);
    Logger.log("optCard_Update_(): Spreadsheet update failed.");
    Logger.log(err.message);
    return 1;
  }

  return -1;
}


function optCard_Add_(input) {
  var dbCard, cell, string;
  var c, k;

  dbCard = getPropertiesService_('document', 'json', 'DB_CARD');

  if(dbCard.length >= 10) return 30;
  if( !/[A-Z][0-9A-Z]{1,13}/.test(input.Code) ) return 10;


  for(k = 0;  k < dbCard.length;  k++) {
    if(dbCard[k].Code === input.Code) return 20;
  }

  string = optTable_GenerateRandomId_();
  if(!string) return 2;

  cell = {
    Id: string,
    Name: input.Name,
    Code: input.Code,
    Limit: 0
  };

  if(optCard_SetCard_(cell) !== -1) return 2;
  if(dbCard.length === 0  &&  optCard_Load_() !== -1) return 2;

  dbCard.push(cell);
  setPropertiesService_('document', 'json', 'DB_CARD', dbCard);

  return -1;
}



function optAccount_UpdateTableRef_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cash Flow');
  var listTables = optTable_GetList_();
  var number_accounts = getPropertiesService_('document', 'number', 'number_accounts'),
      yyyy = optAddonSettings_Get_('FinancialYear');
  var range_, string, mm, dd,
      i, k;

  if(!sheet) return 2;
  range_ = [ 'D', 'G', 'J', 'M', 'P' ];


  sheet.getRange(3, 3).setFormula('=0');
  for(i = 1;  i < 12;  i++) {
    dd = new Date(yyyy, i, 0).getDate();
    sheet.getRange(3, 3+i*4)
      .setFormulaR1C1('=R[' + (dd - 1) + ']C[-4]+RC[-1]');
  }
  SpreadsheetApp.flush();

  k = 0;
  while(k < number_accounts) {
    mm = listTables[k].TimeA;

    string = sheet.getRange(3, 3+mm*4).getFormula();
    string += '+\'_Backstage\'!' + range_[k] + (2 + mm*6);
    sheet.getRange(3, 3+mm*4).setFormula(string);
    Utilities.sleep(137);

    k++;
  }

  return -1;
}



function optAccount_Update_(input) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheet = spreadsheet.getSheetByName('_Backstage');
  var dbAccount;
  var auxCell, newCell;
  var a, k;

  if(!sheet) return 2;
  dbAccount = getPropertiesService_('document', 'json', 'DB_ACCOUNT');


  for(k = 0;  k < dbAccount.length;  k++) {
    if(dbAccount[k].Id == input.Id) break;
  }
  if(k === dbAccount.length) return 2;

  a = dbAccount[k].TimeA;

  dbAccount[k].Name = input.Name;
  dbAccount[k].TimeA = Number(input.TimeA);
  dbAccount[k].Balance = Number(input.Balance);
  dbAccount[k].Header = [ true, true, true, true ];

  setPropertiesService_('document', 'json', 'DB_ACCOUNT', dbAccount);


  try {
    if(a > 0) {
      sheet.getRange(2+a*6, 4+k*3).setFormulaR1C1('=R[-5]C');
      sheet.getRange(5+a*6, 4+k*3).setFormulaR1C1('=R[-6]C');
    } else {
      sheet.getRange(2+a*6, 4+k*3).setFormula('=0');
      sheet.getRange(5+a*6, 4+k*3).setValue(null);
    }

    spreadsheet.getSheetByName('Jan')
      .getRange(1, 6+k*5)
      .setValue(input.Name);
    sheet.getRange(1, 4+k*3).setValue(input.Name);
    sheet.getRange(2+input.TimeA*6, 4+k*3).setFormula('='+Number(input.Balance).formatLocaleSignal());

    optAccount_UpdateTableRef_();
  } catch(err) {
    console.error("optAccount_Update_(): Spreadsheet update failed.", err);
    Logger.log("optAccount_Update_(): Spreadsheet update failed.");
    Logger.log(err.message);
    return 1;
  }

  return -1;
}
