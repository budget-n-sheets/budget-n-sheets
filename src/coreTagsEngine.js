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

    case 'isBusy':
      return -1;
    default:
      console.warn("optMainTags(): Switch case is default.", opt);
      Logger.log("optMainTags(): Switch case is default.");
      Logger.log(opt);
      return 3;
  }
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
  sheetTags.insertRowAfter(maxRows);
  sheetTags.getRange(maxRows, 1, 1, 4).setValues([
    [ input.Name, AppsScriptGlobal.listTagCategories()[1][a], input.Description, input.Tag ]
  ]);
  sheetTags.getRange(maxRows, 21).setValue( AppsScriptGlobal.listTagCategories()[0][a] );

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
