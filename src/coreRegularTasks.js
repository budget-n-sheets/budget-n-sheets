function daily_UpdateEvents_(date) {
  var calendarId = optAddonSettings_Get_('FinancialCalendar');
  var calendar = optCalendar_GetCalendarFromSHA1_(calendarId);
  if(!calendar) return;
  var list = calendar.getEventsForDay(date);

  var OnlyEventsOwned = optAddonSettings_Get_('OnlyEventsOwned');
  var description, i;


  for(i = 0;  i < list.length;  i++) {
    description = list[i].getDescription();

    if(OnlyEventsOwned  &&  !list[i].isOwnedByMe()) continue;
    if( !/lne@/.test(description) ) continue;
    else if( /lne@ign/.test(description) ) continue;

    description = description.replace("lne@", "lne@ign");
    list[i].setDescription(description);
  }
}


function daily_PostEvents_(date) {
  var sheet;
  var maxRows, maxColumns, limits;
  var data, data_Cards, listEvents, thisEvent;
  var number_accounts, mm, dd, value;
  var c, i, j, k, t;

  mm = date.getMonth();
  t = AppsScriptGlobal.listNameMonth()[0][mm];
  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(t);
  if(!sheet) return;
  maxRows = sheet.getMaxRows() - 4;
  maxColumns = sheet.getMaxColumns();
  if(maxRows <= 0) return;

  t = optAddonSettings_Get_('FinancialCalendar');
  t = optCalendar_GetCalendarFromSHA1_(t);
  listEvents = t.getEventsForDay(date);
  listEvents = optCalendar_ProcessRawEvents_(listEvents);
  if(listEvents.length === 0) return;

  dd = date.getDate();
  number_accounts = getPropertiesService_('document', 'number', 'number_accounts');

  limits = [ ];
  data = [ ];
  data_Cards = [ ];
  t = sheet.getRange(5, 1, maxRows, maxColumns)
    .getValues();
  for(k = 0;  k < 1+number_accounts;  k++) {
    data.push([ ]);

    c = 0;
    while(c < maxRows  &&  t[c][2+5*k] !== '') { c++; }
    limits[k] = c;
  }


  for(i = 0;  i < listEvents.length;  i++) {
    thisEvent = listEvents[i];

    if(thisEvent.Description === '') continue;
    if(!thisEvent.hasLneAt) continue;
    if(thisEvent.hasAtIgn) continue;
    if(thisEvent.Table !== -1) k = thisEvent.Table;
    else if(thisEvent.Card !== -1) k = thisEvent.Card;
    else continue;

    if( !isNaN(thisEvent.Value) ) value = Number(thisEvent.Value).formatLocaleSignal();
    else if(thisEvent.Tags.length > 0) value = 0;
    else continue;

    for(j = 0;  j < thisEvent.Tags.length;  j++) {
      thisEvent.Tags[j] = "#" + thisEvent.Tags[j];
    }
    t = thisEvent.Tags.join(' ');

    if(typeof k === "number") {
      data[k].push([ dd, thisEvent.Title, value, t ]);
    } else if(!thisEvent.hasQcc) {
      data_Cards.push([ dd, thisEvent.Title, k, value, t ]);
    }
  }

  for(k = 0;  k < 1+number_accounts;  k++) {
    if(data[k].length === 0) continue;

    sheet.getRange(5+limits[k], 1+5*k, data[k].length, 4)
      .setValues(data[k]);
  }

  if(data_Cards.length > 0) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
    if(!sheet) return;
    c = sheet.getMaxRows() - 5;
    if(c <= 0) return;
    data = sheet.getRange(6, 1+mm*6, c, 5).getValues();

    i = 0;
    while(i < c  &&  data[i][3] !== "") { i++; }
    sheet.getRange(6+i, 1+mm*6, data_Cards.length, 5).setValues(data_Cards);
  }
}


function update_DecimalSepartor_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("_Settings");
  var cell;

  if(!sheet) return;

  cell = sheet.getRange(8, 2);

  cell.setValue(0.1);
  cell.setNumberFormat("0.0");
  SpreadsheetApp.flush();

  cell = cell.getDisplayValue();
  if( /\./.test(cell) ) {
    setPropertiesService_("document", "", "decimal_separator", "[ ]");
  } else {
    deletePropertiesService_("document", "decimal_separator");
  }

  optAddonSettings_Set_('SpreadsheetLocale', spreadsheet.getSpreadsheetLocale());
}



function monthly_TreatLayout_(date) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheetTags = spreadsheet.getSheetByName('Tags');
  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var listNameMonths = AppsScriptGlobal.listNameMonth()[0];
  var yyyy = date.getFullYear(),
      mm = date.getMonth();
  var a, i;

  if(FinancialYear > yyyy) return; // Too soon to format the spreadsheet.
  else if(FinancialYear < yyyy) {
    mm = 0; // Last time to format the spreadsheet.
    a = 0;
  }


  if(mm === 0) {
    if(yyyy === FinancialYear) {
      for(i = 0;  i < 3;  i++) {
        spreadsheet.getSheetByName(listNameMonths[i]).showSheet();
      }
      for(;  i < 12;  i++) {
        spreadsheet.getSheetByName(listNameMonths[i]).hideSheet();
      }

      sheetTags.hideColumns(5, 12);
      sheetTags.showColumns(5, 4);
      return;
    } else {
      for(i = 0;  i < 12;  i++) {
        spreadsheet.getSheetByName(listNameMonths[i]).showSheet();
      }

      sheetTags.showColumns(5, 12);

      a = 11;
    }
  } else {
    for(i = 0;  i < 12;  i++) {
      if(i < mm-1  ||  i > mm+2) {
        spreadsheet.getSheetByName(listNameMonths[i]).hideSheet();
      } else {
        spreadsheet.getSheetByName(listNameMonths[i]).showSheet();
      }
    }

    sheetTags.hideColumns(5, 12);
    a = mm - 1;

    if(mm < 2) {
      sheetTags.showColumns(5, 4);
    } else {

      if(mm === 11) {
        spreadsheet.getSheetByName(listNameMonths[9]).showSheet();
        mm--;
      }
      sheetTags.showColumns(3 + mm, 4);
    }
  }

  foo_ColorTabs_();
  foo_FormatRegistry_(a);
  foo_FormatCreditCard_(a);
}



function foo_ColorTabs_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var FinancialYear = optAddonSettings_Get_('FinancialYear'),
      InitialMonth = optAddonSettings_Get_('InitialMonth');
  var list = AppsScriptGlobal.listNameMonth()[0];
  var date = getSpreadsheetDate();
  var mm, i;

  mm = date.getMonth();


  if(FinancialYear === date.getFullYear()) {
    for(i = 0;  i < InitialMonth;  i++) {
      spreadsheet.getSheetByName(list[i]).setTabColor('#b7b7b7');
    }
    for(;  i < 12;  i++) {
      if(i < mm-1  ||  i > mm+2) {
        spreadsheet.getSheetByName(list[i]).setTabColor('#a4c2f4');
      } else {
        spreadsheet.getSheetByName(list[i]).setTabColor('#3c78d8');
      }
    }

    spreadsheet.getSheetByName(list[mm]).setTabColor('#6aa84f');

  } else {
    for(i = 0;  i < InitialMonth;  i++) {
      spreadsheet.getSheetByName(list[i]).setTabColor('#b7b7b7');
    }
    for(;  i < 12;  i++) {
      spreadsheet.getSheetByName(list[i]).setTabColor('#a4c2f4');
    }
  }
}



function foo_UpdateCashFlow_(yyyy, mm) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTarget = spreadsheet.getSheetByName( AppsScriptGlobal.listNameMonth()[0][mm] ),
      sheetCashFlow = spreadsheet.getSheetByName('Cash Flow'),
      sheetBackstage = spreadsheet.getSheetByName('_Backstage');
  if(!sheetTarget) return;
  if(!sheetCashFlow) return;
  if(!sheetBackstage) return;

  var number_accounts, number_cards;
  var OverrideZero = optAddonSettings_Get_('OverrideZero');
  var list, metaTags, item;
  var data, data_cards, registry, value, day, maxRows;
  var dd, n, p;
  var a, b, c, i, j, k, v, t, ma;
  var hasCards, hasTags;

  data = [ ];
  maxRows = sheetTarget.getMaxRows() - 4;
  maxColumns = sheetTarget.getMaxColumns();
  dd = new Date(yyyy, mm+1, 0).getDate();
  for(i = 0;  i < dd;  i++) {
    data.push([ '', null, '' ]); // [ '=value1 [+valuen]', null, '@desc_1' [+' @descn'] ]
  }

  number_accounts = getPropertiesService_('document', 'number', 'number_accounts');
  number_cards = getPropertiesService_('document', 'json', 'DB_CARD');
  number_cards = number_cards.length;
  hasCards = number_cards > 0;

  data_cards = sheetBackstage.getRange(1, 5+number_accounts*3, 73, 1+number_cards).getValues();

  if(optAddonSettings_Get_('CashFlowEvents')) {
    a = optAddonSettings_Get_('FinancialCalendar');
    a = optCalendar_GetCalendarFromSHA1_(a);
    list = a.getEvents(new Date(yyyy, mm, 1), new Date(yyyy, mm+1, 1));
    if(!list) list = [ ];
    else list = optCalendar_ProcessRawEvents_(list);
  } else {
    list = [ ];
  }

  if(OverrideZero  ||  list.length > 0) {
    metaTags = optTag_GetMeta_();
    if( !isNaN(metaTags) ) hasTags = false;
    else {
      n = metaTags.Tags.length;
      hasTags = true;
    }
  }



  SpreadsheetApp.flush();

  k = 0;
  i = 0;
  registry = sheetTarget.getRange(5, 1, maxRows, maxColumns)
    .getValues();
  while(k < number_accounts) {
    day = registry[i][5+5*k];
    if(day <= 0  ||  day > dd) {
      i++;
      if(i >= maxRows  ||  registry[i][7+5*k] === '') {
        k++;
        i = 0;
      }
      continue;
    }

    value = registry[i][7+5*k];
    if(hasTags  &&  value === 0  &&  OverrideZero) {
      ma = registry[i][8+5*k].match(/#[\w]{2,}/g);
      for(j = 0;  j < n;  j++) {
        c = ma.indexOf('#'+metaTags.Tags[j]);
        if(c !== -1) break;
      }
      if(j !== n) value = metaTags.Meta[c].AvgValue;
    }

    if(data[day-1][0] === '') {
      data[day-1][0] = '='+value.formatLocaleSignal();
      data[day-1][2] = '@'+registry[i][6+5*k];
    } else {
      data[day-1][0] += value.formatLocaleSignal();
      data[day-1][2] += ' @'+registry[i][6+5*k];
    }

    i++;
    if(i >= maxRows  ||  registry[i][7+5*k] === '') {
      k++;
      i = 0;
    }
  }

  for(i = 0;  i < list.length;  i++) {
    item = list[i];

    if(item.Description === '') continue;
    if(!item.hasLneAt) continue;
    if(item.hasAtIgn) continue;

    if(!isNaN(item.Value)) value = item.Value;
    else if(item.hasQcc  &&  mm > 0) {
      if(item.Card !== -1) {
        j = 0;
        while(j < data_cards[0].length  &&  data_cards[0][j] !== item.Card) { j++; }

        if(data_cards[0][j] === item.Card) value = Number(data_cards[5 + 6 * (mm-1)][j].toFixed(2));
        else continue;
      } else {
        value = Number(data_cards[5 + 6 * (mm-1)][0].toFixed(2));
      }
    } else if(hasTags) {
      a = metaTags.Tags.indexOf(item.Tags[0]);
      if(a === -1) continue;
      value = metaTags.Meta[a].AvgValue;
    } else {
      continue;
    }

    day = list[i].Day;
    if(data[day-1][0] == '') {
      data[day-1][0] = '='+value.formatLocaleSignal();
      data[day-1][2] = '@'+item.Title;
    } else {
      data[day-1][0] += value.formatLocaleSignal();
      data[day-1][2] += ' @'+item.Title;
    }
  }

  v = sheetCashFlow.getRange(3, 3+mm*4, dd, 1).getFormulas();
  sheetCashFlow.getRange(3, 2+mm*4, dd, 3).setValue(null);
  sheetCashFlow.getRange(3, 2+mm*4, dd, 3).setValues(data);
  SpreadsheetApp.flush();
  sheetCashFlow.getRange(3, 3+mm*4, dd, 1).setFormulas(v);
}



function foo_FormatRegistry_(mm) {
  if(isNaN(mm)) return;

  var thisSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName( AppsScriptGlobal.listNameMonth()[0][Number(mm)] );
  var number_accounts = getPropertiesService_('document', 'number', 'number_accounts');
  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var dateToday = getSpreadsheetDate();
  var table;
  var dateToday, numNegativeDays;
  var c, n, i, k;

  c = 0;
  n = thisSheet.getMaxRows() - 4;
  if(n < 1) return;


  thisSheet.showRows(5, n);

  for(k = 0;  k < 1 + number_accounts;  k++) {
    thisSheet.getRange(5,1+k*5, n,4).setBackground('#ffffff');
    thisSheet.getRange(5,1+k*5, n,4).setFontColor('#000000');
    thisSheet.getRange(5,1+k*5, n,4).sort(1+k*5);

    table = thisSheet.getRange(5,1+k*5, n,4).getValues();
    numNegativeDays = 0;  i = 0;
    while(i < n  &&  table[i][2] !== '') {
      if(table[i][0] < 0) {
        numNegativeDays++;
      }

      if( /#(qcc|trf|wd|dp)/.test(table[i][3]) ) {
        thisSheet.getRange(5+i,1+k*5, 1,4)
          .setBackground('#d9d2e9');
      }

      if( /#ign/.test(table[i][3]) ) {
        thisSheet.getRange(5+i,1+k*5, 1,4)
          .setFontColor('#999999');
      }

      i++;
    }

    if(numNegativeDays > 1) {
      thisSheet.getRange(5,1+k*5, numNegativeDays,4)
        .sort({column:1+k*5, ascending:false});
    }
    if(i > c) c = i;
  }

  if(n - c <= 0) return;
  else if(FinancialYear < dateToday.getFullYear()  ||  (FinancialYear == dateToday.getFullYear()  &&  mm < dateToday.getMonth())) {
    if(n - c < n) thisSheet.hideRows(5+c, n-c);
    else thisSheet.hideRows(5+1, n-1);
  }
}


function foo_FormatCreditCard_(mm) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetCreditCard = spreadsheet.getSheetByName('Cards');
  var table, card;
  var a, c, n;
  var i, j;

  n = sheetCreditCard.getMaxRows() - 5;
  if(typeof mm === "number") a = Number(mm);
  else {
    a = spreadsheet.getActiveRange().getColumn();
    a = (a - (a % 6)) / 6;
  }


  sheetCreditCard.getRange(6,1+a*6, n,5).setBackground('#ffffff');
  sheetCreditCard.getRange(6,1+a*6, n,5).setFontColor('#000000');
  sheetCreditCard.getRange(6,1+a*6, n,5)
    .sort([{column:(3+a*6), ascending:true}, {column:(1+a*6), ascending:true}]);

  i = 0;  j = 0;
  table = sheetCreditCard.getRange(6,1+a*6, n,5).getValues();
  while(i < n  &&  table[i][3] !== '') {
    card = table[i][2];  c = 0;
    while(j < n  &&  table[j][3] !== ''  &&  table[j][2] === card) {
      if(table[j][0] < 0) c++;
      if( /#ign/.test(table[j][4]) ) {
        sheetCreditCard.getRange(6+j,1+a*6, 1,5)
          .setFontColor('#999999');
      }
      j++;
    }

    if(c > 1) {
      sheetCreditCard.getRange(6+i,1+a*6, c,5)
        .sort({column:1+a*6, ascending:false});
    }
    i = j;
  }
}
