function optMainTags(opt, input) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(2000);
  } catch(err) {
    return 0;
  }

  switch(opt) {
    case 'GetMeta':
      return optTag_GetMeta_();
    case 'GetList':
      return optTag_GetList_();
    case 'GetInfo':
      return optTag_GetInfo_(input);
    case 'GetStat':
      return optTag_GetStat_(input);

    case 'Add':
      return optTag_Add_(input);
    case 'Update':
      return optTag_Update_(input);
    case 'Remove':
      return optTag_Remove_(input);

    case 'Export':
      return optTag_Export_();
    case 'Import':
      return optTag_Import_(input);
    case 'Backup':
      return optTag_Backup_();
    case 'Restore':
      return optTag_Restore_();

    case 'isBusy':
      return -1;
    default:
      console.warn("optMainTags(): Switch case is default.", opt);
      Logger.log("optMainTags(): Switch case is default.");
      Logger.log(opt);
      return 3;
  }
}



function optTag_Backup_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var template, sheet;
  var backup,
      i;

  sheet = spreadsheet.getSheetByName('_TagsBackup');
  if(!sheet) {
    try {
      template = SpreadsheetApp.openById(AppsScriptGlobal.SpreadsheetTemplateId());
    } catch(err) {
      Logger.log('optTag_Backup_(): ' + err.message);
      console.warn("optTag_Backup_()", err);
      return 0;
    }

    template.getSheetByName('_TagsBackup')
      .copyTo(spreadsheet)
      .setName('_TagsBackup');

    sheet = spreadsheet.getSheetByName('_TagsBackup');
  }

  sheet.getRange(1, 1, 3, 1).setValue("");

  backup = optTag_Export_();
  for(i = 0;  backup[i] !== "";  i++) {
    sheet.getRange(1+i, 1).setValue(backup[i]);
  }
  spreadsheet.setActiveSheet(sheet);

  return -1;
}


function optTag_Restore_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var template, sheet;
  var backup;

  sheet = spreadsheet.getSheetByName('_TagsBackup');
  if(!sheet) {
    try {
      template = SpreadsheetApp.openById(AppsScriptGlobal.SpreadsheetTemplateId());
    } catch(err) {
      Logger.log('optTag_Backup_(): ' + err.message);
      console.warn("optTag_Backup_()", err);
      return 0;
    }

    template.getSheetByName('_TagsBackup')
      .copyTo(spreadsheet)
      .setName('_TagsBackup');
    return -1;
  }

  backup = sheet.getRange(1, 1, 3, 1).getValues();
  if(typeof backup[0][0] !== 'string'  ||  backup[0][0] == "") return -1;

  return optTag_Import_(backup);
}


function optTag_Import_(backup) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheetTags = spreadsheet.getSheetByName('Tags');
  var categories = AppsScriptGlobal.listTagCategories()[0];
  var split, list, stringify,
      sha1, bin, enc;
  var a, s, i;

  if(!sheetTags) return 2;
  stringify = "";


  i = 0;
  while(backup[i][0] != "") {
    split = backup[i][0].split(":");

    bin = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_1,
      split[0],
      Utilities.Charset.UTF_8);
    sha1 = bin2String(bin);

    if(sha1 !== split[1]) return 10;
    else {
      enc = Utilities.base64Decode(split[0], Utilities.Charset.UTF_8);
      stringify += Utilities.newBlob(enc).getDataAsString();
    }
    i++;
  }

  list = JSON.parse(stringify);

  for(i = 0;  i < list.length;  i++) {
    a = categories.indexOf(list[i].C);
    if(a === -1) a = 5;
    list[i].C = a;

    optTag_Add_(list[i]);
  }

  return -1;
}


function optTag_Export_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTags = spreadsheet.getSheetByName('Tags');
  var range;
  var bak, list, cell,
      stringify, part,
      enc, bin, sha1;
  var p, n, i;

  bak = { 0:"", 1:"", 2:"" };
  list = [ ];
  n = sheetTags.getMaxRows() - 2;
  if(n <= 0) return bak;
  range = sheetTags.getRange(2, 1, n, 21).getValues();


  for(i = 0;  i < n;  i++) {
    cell = {
      Name: range[i][0],
      Description: range[i][2],
      Tag: range[i][3],
      C: range[i][20]
    };
    list.push(cell);
  }

  stringify = JSON.stringify(list);
  if(stringify.length > 9000) return bak;
  else {
    n = (stringify.length - (stringify.length % 3000)) / 3000 + 1;
  }

  p = 0;
  i = 0;
  do {
    part = stringify.slice(p, p+3000);
    enc = Utilities.base64Encode(part, Utilities.Charset.UTF_8);
    bin = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_1,
      enc,
      Utilities.Charset.UTF_8);
    sha1 = bin2String(bin);

    bak[i] = enc + ":" + sha1;
    p += 3000;
    i++;
  } while(i < n);

  return bak;
}



function optTag_GetMeta_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  var data, output, cell;
  var a, n;

  if(!sheet) return 2;

  output = {
    Tags: [ ],
    Meta: [ ]
  };

  n = sheet.getMaxRows() - 2;
  if(n <= 0) return output;


  data = sheet.getRange(2, 1, n, 21).getValues();

  for(i = 0;  i < n;  i++) {
    if( isNaN(data[i][17]) ) a = 0;
    else a = +Number(data[i][17]).toFixed(2);

    cell = {
      Name: data[i][0],
      Tag: data[i][3],
      AvgValue: a
    };

    output.Tags.push(data[i][3]);
    output.Meta.push(cell);
  }

  return output;
}


function optTag_GetList_() {
  var sheet;
  var data, cell, output,
      categories;
  var a, n, i;

  categories = AppsScriptGlobal.listTagCategories()[0];
  output = [
    [ 0 ], [ 0 ], [ 0 ], [ 0 ], [ 0 ],
    [ 0 ], [ 0 ], [ 0 ], [ 0 ], [ 0 ]
  ];

  sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Tags');
  if(!sheet) return 2;
  else if(sheet.getMaxColumns() < 21) return 2;

  n = sheet.getMaxRows();
  if(n <= 2) return output;

  data = sheet.getRange(2, 1, n-2, 21)
    .getValues();


  for(i = 0;  i < data.length;  i++) {
    a = categories.indexOf(data[i][20]);
    if(a === -1) a = 5;

    cell = {
      Name: data[i][0],
      C: categories[a],
      Description: data[i][2],
      Tag: data[i][3]
    }
    output[a].push(cell);
    output[a][0]++;
  }

  return output;
}


function optTag_GetInfo_(input) {
  if(!input) return 3;

  var sheetTags = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  var maxRows = sheetTags.getMaxRows();
  var vIndex, output;
  var listTags, listTagsExtras;
  var auxCell;
  var a, n, i, j;

  if(!sheetTags) return 2;
  SpreadsheetApp.flush();

  output = {
    Name: '',
    C: 5,
    Description: '',
    Tag: '',
    Analytics: false
  }


  listTags = sheetTags.getRange(2, 1, maxRows-2, 4).getValues();
  for(i = 0;  i < listTags.length;  i++) {
    if(listTags[i][3] == input) {
      output.Name = listTags[i][0];
      output.Description = listTags[i][2];
      output.Tag = listTags[i][3];

      a = sheetTags.getRange(2+i, 21).getValue();
      a = AppsScriptGlobal.listTagCategories()[0].indexOf(a);
      if(a == -1) {
        output.C = 5;
      }
      else {
        output.C = a;
      }

      return output;
    }
  }

  return 2;
}


function optTag_GetStat_(input) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTags = spreadsheet.getSheetByName('Tags');

  var InitialMonth = optAddonSettings_Get_('InitialMonth');
  var ActualMonth = optAddonSettings_Get_('ActualMonth');
  var ActiveMonths = optAddonSettings_Get_('ActiveMonths');
  var MFactor = optAddonSettings_Get_('MFactor');
  var AverageValue;

  var data, output;
  var ref, auxValue;
  var maxRows = sheetTags.getMaxRows();
  var a, i, n, t_, v;
  var listNameMonth = AppsScriptGlobal.listNameMonth();

  if(!sheetTags) return 2;
  SpreadsheetApp.flush();

  ref = {
    minValue:0,
    maxValue:0
  };

  output = {
    Data: [ ],

    Analytics: false,
    Interval: '',
    BadStatistics: false,

    hasStatistics: false,
    Total: '',
    Average: '',
    Min: '',
    Max: ''
  };

  data = sheetTags.getRange(2,4, maxRows-2).getValues();


  for(i = 0;  i < data.length;  i++) {
    if(data[i][0] === input) break;
  }
  if(i == n) return 1;

  a = sheetTags.getRange(2+i, 21).getValue();
  a = AppsScriptGlobal.listTagCategories()[0].indexOf(a);
  if(a == -1) a = 5;


  data = sheetTags.getRange(2+i,5, 1,12).getValues();
  if(MFactor > 0) {
    output.Interval = listNameMonth[1][InitialMonth] + ' - ' + listNameMonth[1][ActualMonth-1];
    output.Total = Number( sheetTags.getRange(2+i, 19).getValue() ).formatFinancial();
    AverageValue = Number( sheetTags.getRange(2+i, 18).getValue().toFixed(2) );
    output.Average = AverageValue.formatFinancial();

    ref.minValue = Number(data[0][InitialMonth]); // min value
    ref.maxValue = ref.minValue; // max value

  } else {
    output.Interval = '';
    output.Total = '';
    AverageValue = 0;
    output.Average = '';

    ref.minValue = 0; // min value
    ref.maxValue = 0; // max value
  }


  v = ['Month', 'Month', 'Month', 'Average'];
  output.Data.push(v);

  for(i = 0;  i < InitialMonth  &&  i < 12;  i++) {
    v = [ listNameMonth[0][i], Number(data[0][i].toFixed(2)), null, null ];
    output.Data.push(v);
  }

  for(;  i < InitialMonth+MFactor  &&  i < 12;  i++) {
    v = [ listNameMonth[0][i], null, Number(data[0][i].toFixed(2)), AverageValue ];
    output.Data.push(v);

    auxValue = Number(data[0][i].toFixed(2));
    if(auxValue < ref.minValue) ref.minValue = auxValue;
    if(auxValue > ref.maxValue) ref.maxValue = auxValue;
  }

  for(;  i < ActualMonth  &&  i < 12;  i++) {
    v = [ listNameMonth[0][i], null, Number(data[0][i].toFixed(2)), null ];
    output.Data.push(v);
  }

  for(;  i < 12;  i++) {
    v = [ listNameMonth[0][i], Number(data[0][i].toFixed(2)), null, null ];
    output.Data.push(v);
  }


  if(MFactor > 0) {
    output.Min = Number(ref.minValue).formatFinancial(); // append min value
    output.Max = Number(ref.maxValue).formatFinancial(); // append max value

  } else {
    output.Min = '';
    output.Max = '';
  }

  return output;
}



function optTag_Add_(input) {
  if(input == null) return 3;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTags = spreadsheet.getSheetByName('Tags');
  var number_accounts = getPropertiesService_('document', 'number', 'number_accounts');
  var maxRows, a;
  var data;
  var i;

  maxRows = sheetTags.getMaxRows();


  if( !/[a-zA-Z][\w]+/.test(input.Tag) ) return 2;
  if(maxRows > 2) {
    data = sheetTags.getRange(2, 4, maxRows-2, 1).getValues();

    for(i = 0;  i < data.length;  i++) {
      if(data[i][0] === input.Tag) {
        return 10;
      }
    }
  }

  a = Number(input.C);
  sheetTags.insertRowBefore(maxRows);
  sheetTags.getRange(maxRows, 1, 1, 4).setValues([
    [ input.Name, AppsScriptGlobal.listTagCategories()[1][a], input.Description, input.Tag ]
  ]);
  sheetTags.getRange(maxRows, 21).setValue( AppsScriptGlobal.listTagCategories()[0][a] );

  sheetTags.getRange(1, 18).setFormula('={\"Average\"; IF(\'_Settings\'!$B$7 > 0, ARRAYFORMULA($S$2:$S/\'_Settings\'!B6),)}');
  sheetTags.getRange(maxRows, 19).setFormula('=SUM(OFFSET($D'+maxRows+';0;\'_Settings\'!$B$4;1;\'_Settings\'!$B6))');

  SpreadsheetApp.flush();
  return -1;
}


function optTag_Update_(input) {
  var sheetTags = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  var maxRows = sheetTags.getMaxRows();
  var vIndex;
  var auxValue;
  var n, i;

  if(!sheetTags) return 2;
  vIndex = sheetTags.getRange(2,4, maxRows-2).getValues();


  if(!/[a-zA-Z][\w]+/.test(input.Tag)) return;
  if(input.Tag != input.refTag) {
    for(i in vIndex) {
      if(vIndex[i][0] == input.Tag) {
        return 10;
      }
    }
  }

  n = vIndex.length;  i = 0;
  while(i < n) {
    if(vIndex[i][0] == input.refTag) {
      auxValue = Number(input.C);

      sheetTags.getRange(2+i,1, 1,4).setValues([ [input.Name, AppsScriptGlobal.listTagCategories()[1][auxValue], input.Description, input.Tag] ]);
      sheetTags.getRange(2+i, 21).setValue( AppsScriptGlobal.listTagCategories()[0][auxValue] );

      SpreadsheetApp.flush();
      return -1;
    }
    i++;
  }

  return 1;
}


function optTag_Remove_(input) {
  if(!input) return 3;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTags = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  var codes;
  var m, i;

  if(!sheetTags) return 2;
  m = sheetTags.getMaxRows() - 2;
  codes = sheetTags.getRange(2, 4, m, 1).getValues();

  i = 0;
  while(i < m) {
    if(codes[i][0] === input) {
      sheetTags.deleteRow(2+i);
      SpreadsheetApp.flush();
      return -1;
    }

    i++;
  }

  return -1;
}
