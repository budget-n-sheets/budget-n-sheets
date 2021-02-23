function coolFilterByTag_ (info) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(info.sheet_name);

  const num_acc = getConstProperties_('number_accounts');
  const dec_p = getSpreadsheetSettings_('decimal_separator');

  const header = 'D8';
  const dec_c = (dec_p ? ', ' : ' \\ ');

  let i = 0;
  let formula = '';
  while (i < 12) {
    let aux1 = 'ARRAYFORMULA(SPLIT(CONCAT("' + MONTH_NAME.short[i] + '-"; ' + MONTH_NAME.short[i] + '!' + rollA1Notation(5, 1, -1, 1) + '); "-"))' + dec_c;
    aux1 += MONTH_NAME.short[i] + '!' + rollA1Notation(5, 2, -1, 1) + dec_c;
    aux1 += MONTH_NAME.short[i] + '!' + rollA1Notation(5, 5, -1, 1) + dec_c;
    aux1 += MONTH_NAME.short[i] + '!' + rollA1Notation(5, 3, -1, 2);

    aux1 = '{' + aux1 + '}; REGEXMATCH(' + MONTH_NAME.short[i] + '!' + rollA1Notation(5, 4, -1, 1) + '; ' + header + ')';
    aux1 = 'FILTER(' + aux1 + ')';
    aux1 = 'IFNA(' + aux1 + '; {""' + dec_c + '""' + dec_c + '""' + dec_c + '""' + dec_c + '""' + dec_c + '""})';
    aux1 = 'SORT(' + aux1 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
    formula += aux1;

    for (let k = 0; k < num_acc; k++) {
      let aux2 = 'ARRAYFORMULA(SPLIT(CONCAT("' + MONTH_NAME.short[i] + '-"; ' + MONTH_NAME.short[i] + '!' + rollA1Notation(5, 6 + 5 * k, -1, 1) + '); "-"))' + dec_c;
      aux2 += MONTH_NAME.short[i] + '!' + rollA1Notation(5, 7 + 5 * k, -1, 1) + dec_c;
      aux2 += MONTH_NAME.short[i] + '!' + rollA1Notation(5, 10 + 5 * k, -1, 1) + dec_c;
      aux2 += MONTH_NAME.short[i] + '!' + rollA1Notation(5, 8 + 5 * k, -1, 2);

      aux2 = '{' + aux2 + '}; REGEXMATCH(' + MONTH_NAME.short[i] + '!' + rollA1Notation(5, 9 + 5 * k, -1, 1) + '; ' + header + ')';
      aux2 = 'FILTER(' + aux2 + ')';
      aux2 = 'IFNA(' + aux2 + '; {""' + dec_c + '""' + dec_c + '""' + dec_c + '""' + dec_c + '""' + dec_c + '""})';
      aux2 = 'SORT(' + aux2 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
      formula += aux2;
    }

    let aux3 = 'ARRAYFORMULA(SPLIT(CONCAT("' + MONTH_NAME.short[i] + '-"; Cards!' + rollA1Notation(6, 1 + 6 * i, -1, 1) + '); "-"))' + dec_c;
    aux3 += 'Cards!' + rollA1Notation(6, 2 + 6 * i, -1, 4);

    aux3 = '{' + aux3 + '}; REGEXMATCH(Cards!' + rollA1Notation(6, 5 + 6 * i, -1, 1) + '; ' + header + ')';
    aux3 = 'FILTER(' + aux3 + ')';
    aux3 = 'IFNA(' + aux3 + '; {""' + dec_c + '""' + dec_c + '""' + dec_c + '""' + dec_c + '""' + dec_c + '""})';
    aux3 = 'SORT(' + aux3 + '; 2; TRUE; 4; TRUE; 5; TRUE); \n';
    formula += aux3;

    i++;
  }

  formula = formula.slice(0, -3);
  formula = 'IF(D8 = ""; ""; QUERY({\n' + formula + '\n}; "select * where Col6 is not null"))';

  sheet.getRange('B12').setFormula(formula);

  const sheetTags = spreadsheet.getSheetByName('Tags');
  let n;

  if (sheetTags) n = sheetTags.getMaxRows();
  else n = 0;

  if (n > 1) {
    const range = sheetTags.getRange(2, 5, n - 1, 1);

    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(range, true)
      .setAllowInvalid(true)
      .build();

    sheet.getRange('D8').setDataValidation(rule);
  }

  sheet.setTabColor('#e69138');
  SpreadsheetApp.flush();
  spreadsheet.setActiveSheet(sheet);
}
