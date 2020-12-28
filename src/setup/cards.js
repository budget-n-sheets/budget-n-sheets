function setupCards_ () {
  const sheet = SPREADSHEET.getSheetByName('Cards');
  let formula, head, cell;
  let expr1, expr2, expr3;
  let i, k;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const dec_p = SETUP_SETTINGS.decimal_separator;
  const num_acc = SETUP_SETTINGS.number_accounts;

  const col = 2 + w_ + w_ * num_acc;
  const dec_c = (dec_p ? ',' : '\\');
  const header = rollA1Notation(1, col, 1, w_ * 11);

  SPREADSHEET.setActiveSheet(sheet);
  SPREADSHEET.moveActiveSheet(14);

  const ranges = [];
  for (i = 0; i < 12; i++) {
    ranges[2 * i] = sheet.getRange(6, 1 + 6 * i, 400, 5);
    ranges[2 * i + 1] = sheet.getRange(2, 2 + 6 * i, 1, 2);
  }

  sheet.protect()
    .setUnprotectedRanges(ranges)
    .setWarningOnly(true);

  for (i = 0; i < 12; i++) {
    head = rollA1Notation(2, 1 + 6 * i);
    cell = '_Backstage!' + rollA1Notation(2 + h_ * i, col);

    sheet.getRange(2, 2 + 6 * i).setValue('All');

    formula = 'OFFSET(' + cell + '; 4; 1 + 5*' + head + '; 1; 1)';
    formula = 'TEXT(' + formula + '; "' + SETUP_SETTINGS.number_format + '")';
    formula = 'IF(' + rollA1Notation(2, 2 + 6 * i) + ' = "All"; ""; ' + formula + ')';
    formula = 'CONCATENATE("AVAIL credit: "; ' + formula + ')';
    sheet.getRange(3, 1 + 6 * i).setFormula(formula);

    expr1 = 'MAX(0; OFFSET(' + cell + '; 4; 1 + 5*' + head + '; 1; 1))';
    expr2 = 'OFFSET(' + cell + '; 1; 1 + 5*' + head + '; 1; 1)';
    expr3 = '{"charttype"' + dec_c + '"bar"; "max"' + dec_c + 'OFFSET(' + cell + '; 0; 1 + 5*' + head + '; 1; 1); "color1"' + dec_c + '"#45818e"; "color2"' + dec_c + '"#e69138"}';

    formula = '{' + expr1 + dec_c + expr2 + '}; ' + expr3;
    formula = 'IF(' + rollA1Notation(2, 2 + 6 * i) + ' = "All"; ""; SPARKLINE(' + formula + '))';
    sheet.getRange(4, 1 + 6 * i).setFormula(formula);

    formula = 'REGEXMATCH(_Backstage!' + header + '; "\\^"&' + rollA1Notation(2, 2 + 6 * i) + '&"\\$")';
    formula = 'FILTER(_Backstage!' + header + '; ' + formula + ')';
    formula = 'INDEX(' + formula + '; 0; 1)';
    formula = 'IF(' + rollA1Notation(2, 2 + 6 * i) + ' = "All"; 1; MATCH(' + formula + '; _Backstage!' + header + '; 0))';
    formula = 'IFERROR((' + formula + ' - 1)/5; "")';
    sheet.getRange(2, 1 + 6 * i).setFormula(formula);

    expr1 = 'OFFSET(' + cell + '; 1; 5*' + head + '; 1; 1)';
    expr1 = '"Credit: "; TEXT(' + expr1 + '; "' + SETUP_SETTINGS.number_format + '"); "\n"; ';

    expr2 = 'OFFSET(' + cell + '; 3; 5*' + head + '; 1; 1)';
    expr2 = '"Expenses: "; TEXT(' + expr2 + '; "' + SETUP_SETTINGS.number_format + '"); "\n"; ';

    expr3 = 'OFFSET(' + cell + '; 4; 5*' + head + '; 1; 1)';
    expr3 = '"Balance: "; TEXT(' + expr3 + '; "' + SETUP_SETTINGS.number_format + '")';

    formula = 'CONCATENATE(' + expr1 + expr2 + '"\n"; ' + expr3 + ')';
    sheet.getRange(2, 4 + 6 * i).setFormula(formula);
  }

  if (SETUP_SETTINGS.decimal_places !== 2) {
    const list_format = [];

    for (let i = 0; i < 12; i++) {
      list_format[i] = rollA1Notation(6, 4 + 6 * i, 400, 1);
    }

    sheet.getRangeList(list_format).setNumberFormat(SETUP_SETTINGS.number_format);
  }

  SpreadsheetApp.flush();
}
