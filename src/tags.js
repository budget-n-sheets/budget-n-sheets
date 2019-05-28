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
  var data, cell, output;
  var a, n, i;

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
    a = TC_CODE_.indexOf(data[i][20]);
    if(a === -1) a = 5;

    cell = {
      Name: data[i][0],
      C: TC_CODE_[a],
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
      a = TC_CODE_.indexOf(a);
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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
  if(!sheet) return 2;

  var init = optAddonSettings_Get_("InitialMonth");
  var ActualMonth = optAddonSettings_Get_('ActualMonth');
  var MFactor = optAddonSettings_Get_('MFactor');

  var output;
  var data, avgValue;
  var value, auxValue;
  var lastRow;
  var a, i, v, ta;

  ta = MFactor > 0;
  value = { min: 0, max: 0 };
  output = {
    Interval: "",
    Total: "",
    Average: "",
    Min: "",
    Max: "",
    Data: [ ]
  };

  lastRow = sheet.getLastRow();
  if(lastRow <= 1) return 1;

  data = sheet.getRange(2, 4, lastRow - 1, 1).getValues();

  for(i = 0;  i < data.length;  i++) {
    if(data[i][0] === input) break;
  }
  if(i == data.length) return 1;

  data = sheet.getRange(2 + i, 5, 1, 12).getValues();
  data = data[0];

  if(ta) {
    avgValue = sheet.getRange(2 + i, 18).getValue().toFixed(2);
    avgValue = +avgValue;
    value.min = +data[init];
    value.max = value.min;

    output.Interval = MN_FULL_[init] + " - " + MN_FULL_[ActualMonth-1];
    output.Total = sheet.getRange(2 + i, 19).getValue().formatFinancial();
    output.Average = avgValue.formatFinancial();
  }

  output.Data = [
    ["Month", "Month", "Month", "Month", "Average"]
  ];

  for(i = 0;  i < init  &&  i < 12;  i++) {
    v = [ MN_SHORT_[i], +data[i].toFixed(2), null, null, null ];
    output.Data.push(v);
  }

  for(;  i < init + MFactor  &&  i < 12;  i++) {
    v = [ MN_SHORT_[i], null, null, +data[i].toFixed(2), avgValue ];
    output.Data.push(v);

    a = +data[i].toFixed(2);
    if(a < value.min) value.min = a;
    if(a > value.max) value.max = a;
  }

  for(;  i < 12;  i++) {
    v = [ MN_SHORT_[i], null, +data[i].toFixed(2), null, null ];
    output.Data.push(v);
  }

  if(ta) {
    output.Min = value.min.formatFinancial();
    output.Max = value.max.formatFinancial();
  }

  return output;
}



function optTag_Add_(tag) {
  if(!tag) return 3;
  if( !/[a-zA-Z][\w]+/.test(tag.code) ) return 2;
  if( /^(wd|dp|trf|qcc|ign|rct)$/.test(tag.code) ) return 2;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheet= spreadsheet.getSheetByName("Tags");
  var c, n;

  c = Number(tag.category);
  n = sheet.getMaxRows();
  if(n < 2) return 3;

  sheet.insertRowAfter(n);
  sheet.getRange(n, 1, 1, 4).setValues([
    [ tag.name, TC_NAME_[c], tag.description, tag.code ]
  ]);
  sheet.getRange(n, 21).setValue(TC_CODE_[c]);

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

      sheetTags.getRange(2+i,1, 1,4).setValues([ [input.Name, TC_NAME_[auxValue], input.Description, input.Tag] ]);
      sheetTags.getRange(2+i, 21).setValue( TC_CODE_[auxValue] );

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
