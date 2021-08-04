function setupCashFlow_ () {
  const setup_settings = CachedAccess.get('setup_settings');
  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Cash Flow');
  let ranges, formula;
  let d, s;
  let i, j, k;

  const h_ = TABLE_DIMENSION.height;

  const init_month = setup_settings.init_month;
  const dec_p = setup_settings.decimal_separator;
  const num_acc = setup_settings.number_accounts;
  const financial_year = setup_settings.financial_year;

  const dec_c = (dec_p ? ',' : '\\');
  const options = '{"charttype"' + dec_c + '"column"; "color"' + dec_c + '"#93c47d"; "negcolor"' + dec_c + '"#e06666"; "empty"' + dec_c + '"zero"; "nan"' + dec_c + '"convert"}';

  ranges = [
    sheet.getRange(4, 2, 31), sheet.getRange(4, 4, 31)
  ];
  for (i = 1; i < 12; i++) {
    ranges[2 * i] = ranges[0].offset(0, 4 * i);
    ranges[2 * i + 1] = ranges[1].offset(0, 2 + 4 * i);
  }

  sheet.protect()
    .setUnprotectedRanges(ranges)
    .setWarningOnly(true);

  ranges = [];
  const b_f3f3f3 = [];
  const b_d9ead3 = [];

  i = 0;
  d = new Date(financial_year, 1 + i, 0).getDate();
  ranges.push([RangeUtils.rollA1Notation(5, 3 + 4 * i, d - 1)]);
  if (d < 31) {
    b_f3f3f3.push([RangeUtils.rollA1Notation(4 + d, 2 + 4 * i, 31 - d, 3)]);
  }

  formula = 'SPARKLINE(' + RangeUtils.rollA1Notation(4, 3 + 4 * i, d, 1) + '; ' + options + ')';
  sheet.getRange(2, 2 + 4 * i).setFormula(formula);

  j = 0;
  s = new Date(financial_year, 0, 1).getDay();
  while (j < d) {
    switch (s) {
      case 0:
        b_d9ead3.push([RangeUtils.rollA1Notation(4 + j, 2, 1, 3)]);
        s += 6;
        j += 6;
        break;
      case 6:
        b_d9ead3.push([RangeUtils.rollA1Notation(4 + j, 2, 1, 3)]);
        s = 0;
        j++;
        break;
      default:
        s = (s + 1) % 7;
        j++;
        break;
    }
  }

  const rangeOff1 = sheet.getRange(4, 3);
  const rangeOff2 = sheet.getRange(2, 2);
  for (i = 1; i < 12; i++) {
    rangeOff1.offset(0, 4 * i).setFormulaR1C1('=R[' + (d - 1) + ']C[-4] + RC[-1]');

    d = new Date(financial_year, 1 + i, 0).getDate();
    ranges.push([RangeUtils.rollA1Notation(5, 3 + 4 * i, d - 1)]);
    if (d < 31) {
      b_f3f3f3.push([RangeUtils.rollA1Notation(4 + d, 2 + 4 * i, 31 - d, 3)]);
    }

    formula = 'SPARKLINE(' + RangeUtils.rollA1Notation(4, 3 + 4 * i, d, 1) + '; ' + options + ')';
    rangeOff2.offset(0, 4 * i).setFormula(formula);

    j = 0;
    s = new Date(financial_year, i, 1).getDay();
    while (j < d) {
      switch (s) {
        case 0:
          b_d9ead3.push([RangeUtils.rollA1Notation(4 + j, 2 + 4 * i, 1, 3)]);
          s = 6;
          j += 6;
          break;
        case 6:
          b_d9ead3.push([RangeUtils.rollA1Notation(4 + j, 2 + 4 * i, 1, 3)]);
          s = 0;
          j++;
          break;
        default:
          s = (s + 1) % 7;
          j++;
          break;
      }
    }
  }

  sheet.getRangeList(ranges).setFormulaR1C1('=R[-1]C + RC[-1]');
  sheet.getRangeList(b_f3f3f3).setBackground('#f3f3f3');
  sheet.getRangeList(b_d9ead3).setBackground('#d9ead3');

  ranges = ['G', 'L', 'Q', 'V', 'AA'];

  sheet.getRange(4, 3).setFormula('=0 + B4');

  if (init_month === 0) {
    formula = '=0 + B4';
  } else {
    d = new Date(financial_year, init_month, 0).getDate();
    formula = '=' + RangeUtils.rollA1Notation(3 + d, 4 * init_month - 1) + ' + ' + RangeUtils.rollA1Notation(4, 2 + 4 * init_month);
  }

  for (k = 0; k < num_acc; k++) {
    formula += ' + _Backstage!' + ranges[k] + (2 + h_ * init_month);
  }
  sheet.getRange(4, 3 + 4 * init_month).setFormula(formula);

  if (setup_settings.decimal_places !== 2) {
    const list_format = [];

    for (let i = 0; i < 12; i++) {
      list_format[i] = RangeUtils.rollA1Notation(4, 2 + 4 * i, 31, 2);
    }

    sheet.getRangeList(list_format).setNumberFormat(setup_settings.number_format);
  }

  SpreadsheetApp.flush();
}
