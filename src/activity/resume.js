function resumeActivity_ (mm0, mm1) {
  if (mm0 > mm1) throw new Error('resumeActivity_(): Invalid range.');

  const formulasBuild = FormulaBuild.backstage();
  const formulasWallet = formulasBuild.wallet();
  const formulasAcc = formulasBuild.accounts();
  const formulasCards = formulasBuild.cards();

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const list1 = [];
  const list2 = [];
  const list3 = [];

  const values = ['C5:C', 'H5:H', 'M5:M', 'R5:R', 'W5:W', 'AB5:AB'];
  const tags = ['D5:D', 'I5:I', 'N5:N', 'S5:S', 'X5:X', 'AC5:AC'];
  const combo = ['C5:D', 'H5:I', 'M5:N', 'R5:S', 'W5:X', 'AB5:AC'];
  const balance1 = ['G2', 'L2', 'Q2', 'V2', 'AA2', 'G12', 'L12', 'Q12', 'V12', 'AA12', 'G22', 'L22', 'Q22', 'V22', 'AA22', 'G32', 'L32', 'Q32', 'V32', 'AA32', 'G42', 'L42', 'Q42', 'V42', 'AA42', 'G52', 'L52', 'Q52', 'V52', 'AA52', 'G62', 'L62', 'Q62', 'V62', 'AA62', 'G72', 'L72', 'Q72', 'V72', 'AA72', 'G82', 'L82', 'Q82', 'V82', 'AA82', 'G92', 'L92', 'Q92', 'V92', 'AA92', 'G102', 'L102', 'Q102', 'V102', 'AA102', 'G112', 'L112', 'Q112', 'V112', 'AA112'];
  const balance2 = ['0', '0', '0', '0', '0', 'G3', 'L3', 'Q3', 'V3', 'AA3', 'G13', 'L13', 'Q13', 'V13', 'AA13', 'G23', 'L23', 'Q23', 'V23', 'AA23', 'G33', 'L33', 'Q33', 'V33', 'AA33', 'G43', 'L43', 'Q43', 'V43', 'AA43', 'G53', 'L53', 'Q53', 'V53', 'AA53', 'G63', 'L63', 'Q63', 'V63', 'AA63', 'G73', 'L73', 'Q73', 'V73', 'AA73', 'G83', 'L83', 'Q83', 'V83', 'AA83', 'G93', 'L93', 'Q93', 'V93', 'AA93', 'G103', 'L103', 'Q103', 'V103', 'AA103'];
  const card_total = ['B6', 'B7', 'B16', 'B17', 'B26', 'B27', 'B36', 'B37', 'B46', 'B47', 'B56', 'B57', 'B66', 'B67', 'B76', 'B77', 'B86', 'B87', 'B96', 'B97', 'B106', 'B107', 'B116', 'B117'];

  let formula, width;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  const sheetBackstage = spreadsheet.getSheetByName('_Backstage');
  if (!sheetBackstage) return;

  const sheetCards = spreadsheet.getSheetByName('Cards');
  if (!sheetCards) return;
  const cardsRows = sheetCards.getMaxRows() - 5;
  if (cardsRows < 1) return;

  const num_acc = SettingsConst.getValueOf('number_accounts');
  const actual_month = MonthFactored.getActual();

  const db_accounts = new AccountsService().getAll();
  const db_cards = new CardsService().getAll();

  const height = h_ * (mm1 - mm0 + 1);
  const offset = h_ * mm0;
  const col = 2 + w_ + w_ * num_acc + w_;

  const wallet = new Array(height);
  const accounts = new Array(height);
  const cards = new Array(height);

  width = w_ * num_acc;
  for (let i = 0; i < height; i++) {
    wallet[i] = new Array(w_).fill(null);
    accounts[i] = new Array(width).fill(null);
  }

  width = 10 * w_;
  for (let i = 0; i < height; i++) {
    cards[i] = new Array(width).fill(null);
  }

  const list_bsblank = [];
  for (let i = mm0; i <= mm1; i++) {
    list_bsblank.push(rollA1Notation(2 + h_ * i, col - 1));
  }

  const regex = [rollA1Notation(1, col)];
  for (let k = 2; k <= 10; k++) {
    regex[k - 1] = rollA1Notation(1, col + w_ * (k - 1));
  }

  const rangeOff1 = sheetBackstage.getRange(2, 4 + col - w_);
  const rangeOff2 = sheetBackstage.getRange(3, col - w_, 4, 1);

  let mm = mm0 - 1;
  while (++mm <= mm1) {
    const month = spreadsheet.getSheetByName(MONTH_NAME.short[mm]);
    if (!month) continue;

    const numRows = month.getMaxRows();
    if (numRows < 5) continue;

    const bsblank = rollA1Notation(2 + h_ * mm, 6);

    formula = formulasWallet.bsblank(mm, values[0] + numRows);
    wallet[h_ * mm - offset][4] = formula;

    formula = formulasWallet.expensesIgn(numRows, mm, bsblank);
    wallet[2 + h_ * mm - offset][0] = formula;

    let income = '0';
    let expenses = '0';
    for (let k = 0; k < num_acc; k++) {
      const bsblank = rollA1Notation(2 + h_ * mm, 11 + w_ * k);
      const header_value = rollA1Notation(4, 8 + 5 * k);

      income += ' + ' + rollA1Notation(6 + h_ * mm, 8 + w_ * k);
      expenses += ' + ' + rollA1Notation(4 + h_ * mm, 7 + w_ * k);

      accounts[h_ * mm - offset][w_ * k] = '=' + balance2[5 * mm + k];
      accounts[h_ * mm - offset][1 + w_ * k] = formulasAcc.bsreport(mm, tags[1 + k] + numRows, combo[1 + k] + numRows, bsblank);
      accounts[h_ * mm - offset][4 + w_ * k] = formulasAcc.bsblank(mm, header_value, values[1 + k] + numRows);
      accounts[1 + h_ * mm - offset][w_ * k] = formulasAcc.balance(mm, values[1 + k] + numRows, balance1[5 * mm + k], bsblank);
      accounts[2 + h_ * mm - offset][w_ * k] = formulasAcc.expensesIgn(mm, values[1 + k] + numRows, tags[1 + k] + numRows, bsblank);
    }

    wallet[1 + h_ * mm - offset][0] = income;
    wallet[3 + h_ * mm - offset][0] = expenses;

    formula = formulasCards.bsblank(cardsRows, mm);
    rangeOff1.offset(h_ * mm, 0).setFormula(formula);

    formula = 'RC[5] + RC[10] + RC[15] + RC[20] + RC[25] + RC[30] + RC[35] + RC[40] + RC[45] + RC[50]';
    rangeOff2.offset(h_ * mm, 0).setFormulaR1C1(formula);

    const list4 = [];
    for (let k = 0; k < 10; k++) {
      const bsblank = rollA1Notation(2 + h_ * mm, 4 + col + w_ * k);

      cards[0 + h_ * mm - offset][4 + w_ * k] = list_bsblank[mm];
      cards[1 + h_ * mm - offset][w_ * k] = formulasCards.credit(cardsRows, mm, regex[k], bsblank);
      cards[2 + h_ * mm - offset][w_ * k] = formulasCards.expensesIgn(cardsRows, mm, regex[k], bsblank);
      cards[3 + h_ * mm - offset][w_ * k] = formulasCards.expenses(cardsRows, mm, regex[k], bsblank);
      cards[3 + h_ * mm - offset][1 + w_ * k] = formulasCards.bscardpart(cardsRows, mm, rollA1Notation(1, col + w_ * k), bsblank);

      list1.push(rollA1Notation(6 + h_ * mm, col + w_ * k));
      list2.push(rollA1Notation(6 + h_ * mm, 1 + col + w_ * k));
      list3.push(rollA1Notation(3 + h_ * mm, 1 + col + w_ * k));
      list4[k] = rollA1Notation(2 + h_ * mm, 4 + col + w_ * k);
    }

    sheetBackstage.getRangeList(list4).setFormula(rollA1Notation(2 + h_ * mm, 4 + col - w_));
  }

  {
    const rangeOff = sheetBackstage.getRange(2 + h_ * mm0, 2, height, 1);

    rangeOff.offset(0, 0, height, w_).setFormulas(wallet);
    rangeOff.offset(0, 5, height, w_ * num_acc).setFormulas(accounts);
    rangeOff.offset(0, col - 2, height, 10 * w_).setFormulas(cards);
  }

  SpreadsheetApp.flush();
  sheetBackstage.getRangeList(list1).setFormulaR1C1('R[-1]C + R[-3]C');
  sheetBackstage.getRangeList(list2).setFormulaR1C1('R[-1]C + R[-4]C + RC[-1]');
  sheetBackstage.getRangeList(list3).setFormulaR1C1('MIN(R[-1]C; R[-1]C - R[3]C)');
  sheetBackstage.getRangeList(card_total.slice(2 * mm0, 2 * (1 + mm1))).setFormulaR1C1('R[-2]C[' + (col - w_ - 2) + ']');

  if (1 + mm1 < actual_month) {
    const rangeList = [];

    let mm = mm0;
    while (++mm < actual_month) {
      const month = spreadsheet.getSheetByName(MONTH_NAME.short[mm]);
      if (!month) continue;

      const numRows = month.getMaxRows();
      if (numRows < 5) continue;

      const rangeOff = sheetBackstage.getRange(3 + h_ * mm, 2 + w_);

      for (let k = 0; k < num_acc; k++) {
        rangeList.push(rollA1Notation(2 + h_ * mm, 2 + w_ + w_ * k));

        const bsblank = rollA1Notation(2 + h_ * mm, 11 + w_ * k);

        formula = formulasAcc.balance(mm, values[1 + k] + numRows, balance1[5 * mm + k], bsblank);
        rangeOff.offset(0, w_ * k).setFormula(formula);
      }
    }

    sheetBackstage.getRangeList(rangeList).setFormulaR1C1('R[-' + (h_ - 1) + ']C');
  }

  for (let k = 0; k < num_acc; k++) {
    const account = db_accounts[k];
    if (account.time_a < mm0) continue;

    formula = '=' + FormatNumber.localeSignal(account.balance);
    sheetBackstage.getRange(3 + h_ * mm, 2 + w_ + w_ * k).setFormula(formula);
  }

  {
    const rangeOff = sheetBackstage.getRange(2 + h_ * mm, 1 + col);

    for (let k = 0; k < db_cards.length; k++) {
      const formula = '=' + FormatNumber.localeSignal(db_cards[k].limit);
      for (let mm = mm0; mm <= mm1; mm++) {
        rangeOff.offset(0, w_ * k).setFormula(formula);
      }
    }
  }

  let optimize_load = SettingsSpreadsheet.getValueOf('optimize_load');
  if (optimize_load == null) optimize_load = new Array(12).fill(true);
  for (let mm = mm0; mm <= mm1; mm++) {
    optimize_load[mm] = false;
  }
  SettingsSpreadsheet.setValueOf('optimize_load', optimize_load);
}
