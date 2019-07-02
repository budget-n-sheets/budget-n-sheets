function optMainTags(opt, input) {
  var lock = LockService.getDocumentLock();
  try {
    lock.waitLock(2000);
  } catch(err) {
    return 0;
  }

  switch(opt) {
    case "GetData":
      return tagGetData_();
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


function tagGetData_() {
  var sheet, lastRow;
  var output, data;
  var n, i, j, k, v;

  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tags");
  if(!sheet) return;

  lastRow = sheet.getLastRow();
  if(lastRow < 2) return;
  if(sheet.getMaxColumns() < 20) return;

  output = {
    tags: [ ],
    months: [ ],
    average: [ ],
    total: [ ]
  };

  n = lastRow - 1;
  data = sheet.getRange(2, 5, n, 16).getValues();

  i = 0;
  j = 0;
  while(i < data.length  &&  j < n) {
    if( /^[\w]+$/.test(data[i][0]) ) {
      output.tags.push(data[i][0]);

      v = [ ];
      for(k = 0; k < 12; k++) {
        v[k] = data[i][1 + k];
      }
      output.months.push(v);

      output.average.push(data[i][14]);
      output.total.push(data[i][15]);
      i++;
    } else {
      data.splice(i, 1);
    }

    j++;
  }

  output.data = data;
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

  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  if(!sheet) return 2;
  if(sheet.getMaxColumns() < 22) return 2;

  n = sheet.getMaxRows();
  if(n <= 2) return output;

  data = sheet.getRange(2, 1, n - 2, 22).getValues();


  for(i = 0;  i < data.length;  i++) {
    a = TC_CODE_.indexOf(data[i][21]);
    if(a === -1) a = 5;

    cell = {
      Name: data[i][0],
      C: TC_CODE_[a],
      Description: data[i][2],
      Tag: data[i][4],
			analytics: data[i][3]
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
    analytics: false
  }


  listTags = sheetTags.getRange(2, 1, maxRows - 2, 5).getValues();
  for(i = 0;  i < listTags.length;  i++) {
    if(listTags[i][4] == input) {
      output.Name = listTags[i][0];
      output.Description = listTags[i][2];
      output.Tag = listTags[i][4];
			output.analytics = listTags[i][3];

      a = sheetTags.getRange(2 + i, 22).getValue();
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

	var dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

	if(!dec_p) dec_p = "] [";

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

  data = sheet.getRange(2, 5, lastRow - 1, 1).getValues();

  for(i = 0;  i < data.length;  i++) {
    if(data[i][0] === input) break;
  }
  if(i == data.length) return 1;

  data = sheet.getRange(2 + i, 6, 1, 12).getValues();
  data = data[0];

  if(ta) {
    avgValue = sheet.getRange(2 + i, 19).getValue().toFixed(2);
    avgValue = +avgValue;
    value.min = +data[init];
    value.max = value.min;

    output.Interval = MN_FULL_[init] + " - " + MN_FULL_[ActualMonth-1];
    output.Total = sheet.getRange(2 + i, 20).getValue().formatFinancial(dec_p);
    output.Average = avgValue.formatFinancial(dec_p);
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
    output.Min = value.min.formatFinancial(dec_p);
    output.Max = value.max.formatFinancial(dec_p);
  }

  return output;
}



function optTag_Add_(tag) {
  if(!tag) return 3;
  if( !/[\w]+/.test(tag.code) ) return 2;
  if( /^(wd|dp|trf|qcc|ign|rct)$/.test(tag.code) ) return 2;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheet = spreadsheet.getSheetByName("Tags");
  var range;
  var i, c, n;

  c = Number(tag.category);
  n = sheet.getMaxRows();
  if(n < 2) return 3;

  if(n > 2) {
    range = sheet.getRange(2, 5, n - 2, 1).getValues();
    for(i = 0;  i < range.length;  i++) {
      if(range[i][0] === tag.code) return 2;
    }
  }

  sheet.insertRowAfter(n);
  sheet.getRange(n, 1, 1, 5).setValues([
    [ tag.name, TC_NAME_[c], tag.description, tag.analytics, tag.code ]
  ]);
  sheet.getRange(n, 22).setValue(TC_CODE_[c]);

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
  vIndex = sheetTags.getRange(2, 5, maxRows - 2).getValues();


  if(!/[\w]+/.test(input.Tag)) return;
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

      sheetTags.getRange(2 + i, 1, 1, 5).setValues([ [input.Name, TC_NAME_[auxValue], input.Description, input.analytics, input.Tag] ]);
      sheetTags.getRange(2 + i, 22).setValue( TC_CODE_[auxValue] );

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
  codes = sheetTags.getRange(2, 5, m, 1).getValues();

  i = 0;
  while(i < m) {
    if(codes[i][0] === input) {
      sheetTags.deleteRow(2 + i);
      SpreadsheetApp.flush();
      return -1;
    }

    i++;
  }

  return -1;
}
