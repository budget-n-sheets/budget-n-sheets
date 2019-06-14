function cardsGetData_() {
  var sheet;
  var output, data;
  var c, n, v, i, k;
  var h_, w_;

  h_ = AppsScriptGlobal.TableDimensions()["height"];
  w_ = AppsScriptGlobal.TableDimensions()["width"];
  n = getPropertiesService_("document", "number", "number_accounts");

  db_cards = getPropertiesService_("document", "obj", "DB_CARD");
  if(!db_cards) return;
  if(db_cards.length == 0) return;

  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
  if(!sheet) return;
  if(sheet.getMaxRows() < 121) return;
  if(sheet.getMaxColumns() < 1 + (w_ + w_*n) + (w_ + w_*db_cards)) return;

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
  for(i = 0;  i < 12;  i++) {
    output.balance[0][i] = data[5 + h_*i][0];
  }

  data = sheet.getRange(
    1, 1 + w_ + n*w_ + w_ + 1,
    1 + 12*h_, w_*db_cards.length
  ).getValues();
  for(k = 0;  k < db_cards.length;  k++) {
    c = data[0].indexOf(db_cards[k].Code);
    if(c === -1) continue;

    v = [ ];
    for(i = 0;  i < 12;  i++) {
      v[i] = data[5 + h_*i][c];
    }
    output.balance.push()
  }

  return output;
}



function optCard_SetCard_(input) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBackstage = spreadsheet.getSheetByName('_Backstage'),
      sheetSettings = spreadsheet.getSheetByName('_Settings');
  var number_accounts = getPropertiesService_('document', 'number', 'number_accounts');
  var header, col, maxRows;
  var formula,
      ref, i;
  var h_, w_;

  if(!sheetBackstage) return 2;
  if(!sheetSettings) return 2;

  h_ = AppsScriptGlobal.TableDimensions()["height"];
  w_ = AppsScriptGlobal.TableDimensions()["width"];

  col = sheetBackstage.getMaxColumns() + 1;
  maxRows = sheetBackstage.getMaxRows();

  try {
    sheetBackstage.insertColumnsAfter(col - 1, w_);
    sheetBackstage.getRange(1, col - w_, maxRows, w_)
      .copyTo(sheetBackstage.getRange(1, col, maxRows, w_), {formatOnly:true});
    sheetBackstage.getRange(1, col).setValue(input.Code);

    header = rollA1Notation(1, col);

    for(i = 0;  i < 12;  i++) {
      formula = "IFERROR(SUM(FILTER(";
      formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
      formula += "\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + " = " + header + "; ";
      formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
      formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " >= 0";
      formula += ")); 0)"
      sheetBackstage.getRange(3 + h_*i, col)
        .setFormula(formula);

      formula = "IFERROR(SUM(FILTER(";
      formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
      formula += "\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + " = " + header + "; ";
      formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
      formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " < 0; ";
      formula += "NOT(REGEXMATCH(\'Cards\'!" + rollA1Notation(6, 5 + 6*i, -1) + "; ";
      formula += "\"#ign\"))";
      formula += ")); 0)"
      sheetBackstage.getRange(4 + h_*i, col)
        .setFormula(formula);

      formula = rollA1Notation(3 + h_*i, col) + " + ";
      formula = "IFERROR(SUM(FILTER(";
      formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + "; ";
      formula += "\'Cards\'!" + rollA1Notation(6, 3 + 6*i, -1) + " = " + header + "; ";
      formula += "NOT(ISBLANK(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + ")); ";
      formula += "\'Cards\'!" + rollA1Notation(6, 4 + 6*i, -1) + " < 0";
      formula += ")); 0)"
      sheetBackstage.getRange(5 + h_*i, col)
        .setFormula(formula);

      sheetBackstage.getRange(6 + h_*i, col)
        .setFormulaR1C1("R[-1]C+R[-3]C");
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
  var maxColumns, str;
  var range,
      ref, i;
  var h_, w_;

  if(!sheetBackstage) return 2;
  if(!sheetCards) return 2;

  h_ = AppsScriptGlobal.TableDimensions()["height"];
  w_ = AppsScriptGlobal.TableDimensions()["width"];

  maxColumns = sheetBackstage.getMaxColumns() - 4;
  ref = rollA1Notation(1, maxColumns - w_, 1, w_*2);

  try {
    for(i = 0;  i < 12;  i++) {
      range = sheetCards.getRange(2, 1 + i*6);
      range.setValue("All");

      str = "BSINFCARD(OFFSET(INDIRECT(ADDRESS(2; ";
      str += (1 + w_ + w_*number_accounts) + " + MATCH(" + rollA1Notation(2, 1 + 6*i) + "; ";
      str += "\'_Backstage\'!" + ref + "; 0); 4; true; \"_Backstage\"));";
      str += (h_*i) + "; 0; " + h_ + "; 1))";
      sheetCards.getRange(2, 4+i*6).setFormula(str);
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
  var ref, i, w_;

  if(!sheetBackstage) return 2;
  if(!sheetSettings) return 2;

  w_ = AppsScriptGlobal.TableDimensions()["width"];
  maxColumns = sheetBackstage.getMaxColumns();

  try {
    ref = sheetBackstage.getRange(1, 1, 1, maxColumns).getValues();
    for(i = maxColumns-4-w_*n-1;  i < maxColumns;  i += w_) {
      if(ref[0][i] === input) {
        sheetBackstage.deleteColumns(1+i, w_);
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
  var ref, n, i, h_, w_;

  if(!sheetBackstage) return 2;
  if(!sheetCards) return 2;

  h_ = AppsScriptGlobal.TableDimensions()["height"];
  w_ = AppsScriptGlobal.TableDimensions()["width"];
  maxColumns = sheetBackstage.getMaxColumns();
  n = sheetCards.getMaxRows() - 5;

  try {
    for(i = 0;  i < 12;  i++) {
      sheetCards.getRange(2, 1+i*6).setValue(null);
      sheetCards.getRange(2, 4+i*6).setValue(null);
    }

    sheetBackstage.getRange(2, maxColumns-4, h_*12, w_)
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

  optCard_Refresh_(dbCard.length);
  return -1;
}



function optCard_Update_(input) {
  var sheetBackstage = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Backstage'),
      sheetSettings = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Settings');
  var dbCard, values;
  var a, c, i, k, n, w_;

  if(!sheetBackstage) return 2;
  if(!sheetSettings) return 2;
  if( !/[A-Z][0-9A-Z]{1,13}/.test(input.Code) ) return 10;

  w_ = AppsScriptGlobal.TableDimensions()["width"];
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
    c = sheetBackstage.getMaxColumns();
    values = sheetBackstage.getRange(1, 1, 1, c).getValues();
    for(i = c-4-w_*n-1;  i < c;  i += w_) {
      if(values[0][i] === a) {
        sheetBackstage.getRange(1, 1+i).setValue(input.Code);
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

  optCard_Refresh_(dbCard.length);
  return -1;
}



function optCard_Refresh_(numCards) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Backstage");
  var str;
  var c, i, k;
  var h_, w_;

  h_ = AppsScriptGlobal.TableDimensions()["height"];
  w_ = AppsScriptGlobal.TableDimensions()["width"];

  c = sheet.getMaxColumns() - 4 - w_*numCards;

  if(numCards == 0) {
    for(i = 0;  i < 12;  i++) {
      sheet.getRange(3 + h_*i, c, 4, 1).setValue(0);
    }
    return;
  }

  for(i = 0;  i < 12;  i++) {
    str = "RC[" + w_ + "]";
    for(k = 2;  k <= numCards;  k++) {
      str += "+RC[" + w_*k + "]";
    }
    sheet.getRange(3 + h_*i, c, 4, 1).setFormulaR1C1(str);
  }
}
