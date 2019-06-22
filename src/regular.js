function daily_PostEvents_(date) {
  var calendar, listEventos, listIds, evento;
  var sheet, lastRow;
  var data, data_Cards;
  var number_accounts, mm, dd, value, tags;
  var i, j, k;

	var dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

	if(!dec_p) dec_p = "] [";

  mm = date.getMonth();
  dd = date.getDate();

  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MN_SHORT_[mm]);
  if(!sheet) return;
  if(sheet.getMaxRows() < 4) return;

  calendar = optAddonSettings_Get_("FinancialCalendar");
  if(calendar === "") return;
  calendar = optCalendar_GetCalendarFromSHA1_(calendar);
  if(!calendar) return;

  listEventos = calendar.getEventsForDay(date);
  if(listEventos.length === 0) return;
  listEventos = optCalendar_ProcessRawEvents_(listEventos);

  number_accounts = getPropertiesService_('document', 'number', 'number_accounts');

  data = [ ];
  data_Cards = [ ];
  listIds = [ ];

  for(k = 0;  k < 1 + number_accounts;  k++) {
    data.push([ ]);
  }

  for(i = 0;  i < listEventos.length;  i++) {
    evento = listEventos[i];

    if(evento.Description === "") continue;
    if(evento.hasAtIgn) continue;

    if(evento.Table !== -1) k = evento.Table;
    else if(evento.Card !== -1) k = evento.Card;
    else continue;

    if( !isNaN(evento.Value) ) value = (evento.Value).formatLocaleSignal(dec_p);
    else if(evento.Tags.length > 0) value = 0;
    else continue;

    tags = "";
    for(j = 0;  j < evento.Tags.length;  j++) {
      tags += "#" + event.Tags[j] + " ";
    }

    if(typeof k === "number") {
      data[k].push([ dd, evento.Title, value, tags ]);
    } else if(!evento.hasQcc) {
      data_Cards.push([ dd, evento.Title, k, value, tags ]);
    }

    listIds.push(evento.Id);
  }

  lastRow = sheet.getLastRow() + 1;
  for(k = 0;  k < 1 + number_accounts;  k++) {
    if(data[k].length === 0) continue;

    sheet.getRange(
        lastRow, 1 + 5*k,
        data[k].length, 4)
      .setValues(data[k]);
  }

  if(data_Cards.length > 0) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards");
    if(!sheet) return;

    lastRow = sheet.getLastRow() + 1;
    if(lastRow < 6) return;

    sheet.getRange(
        lastRow, 1 + 6*mm,
        data_Cards.length, 5)
      .setValues(data_Cards);
  }

  calendarMuteEvents_(calendar, listIds);
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

  optAddonSettings_Set_("SpreadsheetLocale", spreadsheet.getSpreadsheetLocale());
  return true;
}



function monthly_TreatLayout_(yyyy, mm) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(),
      sheetTags = spreadsheet.getSheetByName('Tags');
  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var a, i;

  if(FinancialYear > yyyy) return; // Too soon to format the spreadsheet.
  else if(FinancialYear < yyyy) {
    mm = 0; // Last time to format the spreadsheet.
    a = 0;
  }


  if(mm === 0) {
    if(yyyy === FinancialYear) {
      for(i = 0;  i < 3;  i++) {
        spreadsheet.getSheetByName(MN_SHORT_[i]).showSheet();
      }
      for(;  i < 12;  i++) {
        spreadsheet.getSheetByName(MN_SHORT_[i]).hideSheet();
      }

      sheetTags.hideColumns(5, 12);
      sheetTags.showColumns(5, 4);
      return;
    } else {
      for(i = 0;  i < 12;  i++) {
        spreadsheet.getSheetByName(MN_SHORT_[i]).showSheet();
      }

      sheetTags.showColumns(5, 12);

      a = 11;
    }
  } else {
    for(i = 0;  i < 12;  i++) {
      if(i < mm-1  ||  i > mm+2) {
        spreadsheet.getSheetByName(MN_SHORT_[i]).hideSheet();
      } else {
        spreadsheet.getSheetByName(MN_SHORT_[i]).showSheet();
      }
    }

    sheetTags.hideColumns(5, 12);
    a = mm - 1;

    if(mm < 2) {
      sheetTags.showColumns(5, 4);
    } else {

      if(mm === 11) {
        spreadsheet.getSheetByName(MN_SHORT_[9]).showSheet();
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
  var date = getSpreadsheetDate();
  var mm, i;

  mm = date.getMonth();


  if(FinancialYear === date.getFullYear()) {
    for(i = 0;  i < InitialMonth;  i++) {
      spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#b7b7b7');
    }
    for(;  i < 12;  i++) {
      if(i < mm-1  ||  i > mm+2) {
        spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#a4c2f4');
      } else {
        spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#3c78d8');
      }
    }

    spreadsheet.getSheetByName(MN_SHORT_[mm]).setTabColor('#6aa84f');

  } else {
    for(i = 0;  i < InitialMonth;  i++) {
      spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#b7b7b7');
    }
    for(;  i < 12;  i++) {
      spreadsheet.getSheetByName(MN_SHORT_[i]).setTabColor('#a4c2f4');
    }
  }
}



function foo_UpdateCashFlow_(yyyy, mm) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTarget = spreadsheet.getSheetByName(MN_SHORT_[mm]),
      sheetCashFlow = spreadsheet.getSheetByName("Cash Flow");
  var sheetBackstage;

  if(!sheetTarget) return;
  if(!sheetCashFlow) return;

  var calendar, listEventos, evento, day, dd;
  var number_accounts, number_cards;
  var metaTags, OverrideZero;
  var data_cards, data_tags, value, maxRows;
  var table, hasCards, hasTags;
  var cf_flow, cf_transaction;
  var a, b, c, i, j, k, n, ma;
  var h_, w_;

	var dec_p = PropertiesService.getDocumentProperties().getProperty("decimal_separator");

	if(!dec_p) dec_p = "] [";

  h_ = AppsScriptGlobal.TableDimensions()["height"];
  w_ = AppsScriptGlobal.TableDimensions()["width"];

  dd = new Date(yyyy, mm + 1, 0).getDate();
  OverrideZero = optAddonSettings_Get_("OverrideZero");
  number_accounts = getPropertiesService_("document", "number", "number_accounts");

  cf_flow = [ ];
  cf_transaction = [ ];
  for(i = 0;  i < dd;  i++) {
    cf_flow[i] = [ "" ];
    cf_transaction[i] = [ "" ];
  }

  listEventos = [ ];
  t = getSpreadsheetDate();
  b = new Date(yyyy, mm + 1, 1);
  if( optAddonSettings_Get_("CashFlowEvents")
      && t.getTime() < b.getTime() ) {
    calendar = optAddonSettings_Get_("FinancialCalendar");
    calendar = optCalendar_GetCalendarFromSHA1_(calendar);

    if(calendar) {
      a = new Date(yyyy, mm, 1);
      if(t.getTime() > a.getTime()  &&  t.getTime() < b.getTime()) {
        a = new Date(yyyy, mm, t.getDate());
      }

      listEventos = calendar.getEvents(a, b);
      if(listEventos) listEventos = optCalendar_ProcessRawEvents_(listEventos);
      else listEventos = [ ];
    }
  }

  if(OverrideZero  ||  listEventos.length > 0) {
    data_tags = tagGetData_();
    if(data_tags && data_tags.tags.length > 0) hasTags = true;
    else hasTags = false;
  }

  maxRows = sheetTarget.getLastRow() - 4 ;

  if(maxRows > 0) {
    k = 0;
    table = sheetTarget.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
    for(i = 0;  k < number_accounts;  i++) {
      if(i >= maxRows  ||  table[i][2] === "") {
        k++;
        i = -1;
        table = sheetTarget.getRange(5, 1 + 5 + 5*k, maxRows, 4).getValues();
        continue;
      }

      day = table[i][0];
      if(day <= 0  ||  day > dd) continue;

      value = table[i][2];
      if(hasTags  &&  value === 0  &&  OverrideZero) {
        ma = table[i][3].match(/#[\w]+/g);
        for(j = 0;  j < ma.length;  j++) {
          c = data_tags.tags.indexOf(ma[j].substr(1));
          if(c !== -1) {
            value = data_tags.average[c];
            break;
          }
        }
      }

      day--;
      cf_flow[day][0] += value.formatLocaleSignal(dec_p);
      cf_transaction[day][0] += "@" + table[i][1] + " ";
    }
  }


  if(mm > 0) {
    sheetBackstage = spreadsheet.getSheetByName("_Backstage");
  }
  if(sheetBackstage) {
    number_cards = getPropertiesService_("document", "ojb", "DB_CARD");
    number_cards = number_cards.length;
    hasCards = number_cards > 0;
  }
  if(hasCards) {
    data_cards = cardsGetData_();
  }

  for(i = 0;  i < listEventos.length;  i++) {
    evento = listEventos[i];

    if(evento.Description === "") continue;
    if(evento.hasAtIgn) continue;

    if( !isNaN(evento.Value) ) value = evento.Value;
    else if(hasCards  &&  evento.hasQcc) {
      if(evento.Card !== -1) {
        c = data_cards.cards.indexOf(evento.Card);
        if(c === -1) continue;
      } else {
        c = 0;
      }

      if(evento.TranslationType === "M"
          && mm + evento.TranslationNumber >= 0
          && mm + evento.TranslationNumber <= 11) {
        value = +data_cards.balance[c][mm + evento.TranslationNumber].toFixed(2);
      } else {
        value = +data_cards.balance[c][mm - 1].toFixed(2);
      }
    } else if(hasTags  &&  evento.Tags.length > 0) {
      n = evento.Tags.length;
      for(j = 0; j < n; j++) {
        c = data_tags.tags.indexOf(evento.Tags[j]);
        if(c !== -1) break;
      }

      if(c === -1) continue;

      switch(evento.TranslationType) {
        default:
          console.warn("foo_UpdateCashFlow_(): Switch case is default.", evento.TranslationType);
        case "Avg":
        case "":
          value = data_tags.average[c];
          break;
        case "Total":
          value = data_tags.total[c];
          break;
        case "M":
          if(mm + evento.TranslationNumber < 0  ||  mm + evento.TranslationNumber > 11) continue;

          value = data_tags.months[c][mm + evento.TranslationNumber];
          break;
      }
    } else {
      continue;
    }

    day = evento.Day - 1;
    cf_flow[day][0] += value.formatLocaleSignal(dec_p);
    cf_transaction[day][0] += "@" + evento.Title + " ";
  }


  sheetCashFlow.getRange(3, 2 + 4*mm, dd, 1).setFormulas(cf_flow);
  sheetCashFlow.getRange(3, 4 + 4*mm, dd, 1).setValues(cf_transaction);
  SpreadsheetApp.flush();
}



function foo_FormatRegistry_(mm) {
  if(isNaN(mm)) return;

  var thisSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName( MN_SHORT_[Number(mm)] );
  var number_accounts = getPropertiesService_('document', 'number', 'number_accounts');
  var FinancialYear = optAddonSettings_Get_('FinancialYear');
  var dateToday;
  var table;
  var numNegativeDays;
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

  dateToday = getSpreadsheetDate();
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


function update_Layout() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;

  var yyyy = optAddonSettings_Get_("FinancialYear");
  var init = optAddonSettings_Get_("InitialMonth");
  var c, i;
  var h_;

  h_ = AppsScriptGlobal.TableDimensions()["height"];

  foo_ColorTabs_();

  sheet = spreadsheet.getSheetByName("_Backstage");
  if(!sheet) return 1;

  c = sheet.getMaxColumns();
  sheet.getRange(2, 1, h_*12 - 1, c).setFontColor("#000000");


  sheet = spreadsheet.getSheetByName("Summary");
  if(!sheet) return 1;

  sheet.getRange("B11:I22").setFontColor("#000000");
  sheet.getRange(25, 3, 12, 7).setValue(null);

  for(i = 0;  i < init;  i++) {
    sheet.getRange(25 + i, 4).setFormulaR1C1('=R[-14]C');
    sheet.getRange(25 + i, 5).setFormulaR1C1('=-R[-14]C[1]');
  }
  for(;  i < 12;  i++) {
    sheet.getRange(25 + i, 6).setFormulaR1C1('=R[-14]C[-2]');
    sheet.getRange(25 + i, 7).setFormulaR1C1('=-R[-14]C[-1]');
  }

  if(init > 0) {
    sheet.getRange(11, 2, init, 8)
      .setFontColor("#b7b7b7");

    sheet = spreadsheet.getSheetByName("_Backstage");
    if(!sheet) return 1;
    sheet.getRange(2, 1, h_*init, c)
      .setFontColor("#b7b7b7");
  } else {
    sheet.getRange(25, 4, 1, 2).setValue(0);
  }

  SpreadsheetApp.flush();
  return -1;
}
