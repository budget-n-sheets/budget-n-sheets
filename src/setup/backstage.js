function setupBackstage_ () {
  const sheet = SPREADSHEET.getSheetByName('_Backstage');
  let formula;
  let income, expenses;
  let n, i, k;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const list_acc = SETUP_SETTINGS.list_acc;
  const num_acc = SETUP_SETTINGS.number_accounts;
  const dec_p = SETUP_SETTINGS.decimal_separator;

  const values = ['C5:C404', 'H5:H404', 'M5:M404', 'R5:R404', 'W5:W404', 'AB5:AB404'];
  const tags = ['D5:D404', 'I5:I404', 'N5:N404', 'S5:S404', 'X5:X404', 'AC5:AC404'];
  const combo = ['C5:D404', 'H5:I404', 'M5:N404', 'R5:S404', 'W5:X404', 'AB5:AC404'];
  const balance1 = ['G2', 'L2', 'Q2', 'V2', 'AA2', 'G12', 'L12', 'Q12', 'V12', 'AA12', 'G22', 'L22', 'Q22', 'V22', 'AA22', 'G32', 'L32', 'Q32', 'V32', 'AA32', 'G42', 'L42', 'Q42', 'V42', 'AA42', 'G52', 'L52', 'Q52', 'V52', 'AA52', 'G62', 'L62', 'Q62', 'V62', 'AA62', 'G72', 'L72', 'Q72', 'V72', 'AA72', 'G82', 'L82', 'Q82', 'V82', 'AA82', 'G92', 'L92', 'Q92', 'V92', 'AA92', 'G102', 'L102', 'Q102', 'V102', 'AA102', 'G112', 'L112', 'Q112', 'V112', 'AA112'];
  const balance2 = ['0', '0', '0', '0', '0', 'G3', 'L3', 'Q3', 'V3', 'AA3', 'G13', 'L13', 'Q13', 'V13', 'AA13', 'G23', 'L23', 'Q23', 'V23', 'AA23', 'G33', 'L33', 'Q33', 'V33', 'AA33', 'G43', 'L43', 'Q43', 'V43', 'AA43', 'G53', 'L53', 'Q53', 'V53', 'AA53', 'G63', 'L63', 'Q63', 'V63', 'AA63', 'G73', 'L73', 'Q73', 'V73', 'AA73', 'G83', 'L83', 'Q83', 'V83', 'AA83', 'G93', 'L93', 'Q93', 'V93', 'AA93', 'G103', 'L103', 'Q103', 'V103', 'AA103'];
  const card_total = ['B6', 'B7', 'B16', 'B17', 'B26', 'B27', 'B36', 'B37', 'B46', 'B47', 'B56', 'B57', 'B66', 'B67', 'B76', 'B77', 'B86', 'B87', 'B96', 'B97', 'B106', 'B107', 'B116', 'B117'];

  const width = w_ * num_acc;
  const height = 120;
  const col = 2 + w_ + w_ * num_acc + w_;

  const wallet = new Array(height);
  const accounts = new Array(height);

  n = height;
  while (n--) {
    wallet[n] = new Array(5);
    accounts[n] = new Array(width);

    i = -1;
    while (++i < 5) {
      wallet[n][i] = null;
      accounts[n][i] = null;
    }

    i--;
    while (++i < width) {
      accounts[n][i] = null;
    }
  }

  sheet.protect().setWarningOnly(true);

  if (num_acc < 5) {
    sheet.deleteColumns(7 + w_ * num_acc, w_ * (5 - num_acc));
  }
  SpreadsheetApp.flush();

  for (k = 0; k < num_acc; k++) {
    sheet.getRange(1, 7 + w_ * k).setValue(list_acc[k]);
  }

  i = -1;
  while (++i < 12) {
    k = 0;
    income = '0';
    expenses = '0';

    wallet[h_ * i][4] = "BSBLANK(TRANSPOSE('" + MN_SHORT[i] + "'!" + values[k] + '))';

    formula = "NOT(REGEXMATCH(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + tags[k] + '; ' + rollA1Notation(2 + h_ * i, 6) + '; 1); "#ign"))';
    formula = "NOT(ISBLANK(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + values[k] + '; ' + rollA1Notation(2 + h_ * i, 6) + '; 1))); ' + formula;
    formula = "FILTER(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + values[k] + '; ' + rollA1Notation(2 + h_ * i, 6) + '; 1); ' + formula + ')';
    formula = 'SUM(IFERROR(' + formula + '; 0))';
    wallet[2 + h_ * i][0] = formula;

    for (; k < num_acc; k++) {
      income += ' + ' + rollA1Notation(6 + h_ * i, 8 + w_ * k);
      expenses += ' + ' + rollA1Notation(4 + h_ * i, 7 + w_ * k);

      accounts[h_ * i][w_ * k] = '=' + balance2[5 * i + k];
      accounts[h_ * i][4 + w_ * k] = "BSBLANK(TRANSPOSE('" + MN_SHORT[i] + "'!" + values[1 + k] + '))';

      formula = "NOT(ISBLANK(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + values[1 + k] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1)))';
      formula = "FILTER(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + values[1 + k] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1); ' + formula + ')';
      formula = balance1[5 * i + k] + ' + IFERROR(SUM(' + formula + '); 0)';
      accounts[1 + h_ * i][w_ * k] = formula;

      formula = "NOT(REGEXMATCH(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + tags[1 + k] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1); "#(dp|wd|qcc|ign|rct|trf)"))';
      formula = "NOT(ISBLANK(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + values[1 + k] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1))); ' + formula;
      formula = "FILTER(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + values[1 + k] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1); ' + formula + ')';
      formula = 'IFERROR(SUM(' + formula + '); 0)';
      accounts[2 + h_ * i][w_ * k] = formula;

      formula = "NOT(ISBLANK(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + tags[1 + k] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 1)))';
      formula = "IFERROR(FILTER(ARRAY_CONSTRAIN('" + MN_SHORT[i] + "'!" + combo[1 + k] + '; ' + rollA1Notation(2 + h_ * i, 11 + w_ * k) + '; 2); ' + formula + '); "")';
      formula = 'BSREPORT(TRANSPOSE(' + formula + '))';
      accounts[h_ * i][1 + w_ * k] = formula;
    }

    wallet[1 + h_ * i][0] = income;
    wallet[3 + h_ * i][0] = expenses;
  }

  sheet.getRange(2, 2, height, 5).setFormulas(wallet);
  sheet.getRange(2, 7, height, width).setFormulas(accounts);
  sheet.getRangeList(card_total).setFormulaR1C1('R[-1]C[' + (col - w_ - 2) + ']');

  if (!dec_p) {
    const max2 = 400;

    let mm = -1;
    while (++mm < 12) {
      const range1A1 = rollA1Notation(6, 4 + 6 * mm, max2);
      const range2A1 = rollA1Notation(6, 3 + 6 * mm, max2);

      for (let k = 0; k < 10; k++) {
        const header2 = rollA1Notation(2 + h_ * mm, 4 + col + w_ * k);

        formula = "REGEXEXTRACT(ARRAY_CONSTRAIN('Cards'!" + rollA1Notation(6, 2 + 6 * mm, max2) + '; ' + header2 + '; 1); "[0-9]+/[0-9]+")';
        formula = 'ARRAYFORMULA(SPLIT(' + formula + '; "/"))';
        formula = '{' + formula + "\\ ARRAY_CONSTRAIN('Cards'!" + range1A1 + '; ' + header2 + '; 1)}; ';
        formula = formula + "REGEXMATCH(ARRAY_CONSTRAIN('Cards'!" + range2A1 + '; ' + header2 + '; 1); ' + rollA1Notation(1, col + w_ * k) + '); ';

        formula = formula + "NOT(ISBLANK(ARRAY_CONSTRAIN('Cards'!" + range1A1 + '; ' + header2 + '; 1))); ';
        formula = formula + "REGEXMATCH(ARRAY_CONSTRAIN('Cards'!" + rollA1Notation(6, 2 + 6 * mm, max2) + '; ' + header2 + '; 1); "[0-9]+/[0-9]+")';

        formula = 'BSCARDPART(TRANSPOSE(IFNA(FILTER(' + formula + '); 0)))';
        formula = 'IF(' + rollA1Notation(1, col + w_ * k) + ' = ""; 0; ' + formula + ')';
        sheet.getRange(5 + h_ * mm, 1 + col + w_ * k).setFormula(formula);
      }
    }
  }

  if (SETUP_SETTINGS.decimal_places !== 2) {
    sheet.getRange(2, 2, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).setNumberFormat(SETUP_SETTINGS.number_format);
  }
}
