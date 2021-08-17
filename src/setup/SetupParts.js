class SetupParts {
  constructor (config) {
    this._h = TABLE_DIMENSION.height;
    this._w = TABLE_DIMENSION.width;

    this._date = Object.freeze({
      time: DATE_NOW.getTime(),
      yyyy: DATE_NOW.getFullYear(),
      mm: DATE_NOW.getMonth()
    });

    this._config = config;
    this._spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  }

  setupBackstage_ () {
    const formulasBackstage = FormulaBuild.backstage();
    const numRows = SPREADSHEET_SPECS.initial_height;

    const sheet = this._spreadsheet.getSheetByName('_Backstage');

    let formula;
    let income, expenses;
    let n, i, k;

    const name_acc = this._config.name_accounts;
    const num_acc = this._config.number_accounts;
    const dec_p = this._config.decimal_separator;

    const values = ['C5:C404', 'H5:H404', 'M5:M404', 'R5:R404', 'W5:W404', 'AB5:AB404'];
    const tags = ['D5:D404', 'I5:I404', 'N5:N404', 'S5:S404', 'X5:X404', 'AC5:AC404'];
    const combo = ['C5:D404', 'H5:I404', 'M5:N404', 'R5:S404', 'W5:X404', 'AB5:AC404'];
    const balance1 = ['G2', 'L2', 'Q2', 'V2', 'AA2', 'G12', 'L12', 'Q12', 'V12', 'AA12', 'G22', 'L22', 'Q22', 'V22', 'AA22', 'G32', 'L32', 'Q32', 'V32', 'AA32', 'G42', 'L42', 'Q42', 'V42', 'AA42', 'G52', 'L52', 'Q52', 'V52', 'AA52', 'G62', 'L62', 'Q62', 'V62', 'AA62', 'G72', 'L72', 'Q72', 'V72', 'AA72', 'G82', 'L82', 'Q82', 'V82', 'AA82', 'G92', 'L92', 'Q92', 'V92', 'AA92', 'G102', 'L102', 'Q102', 'V102', 'AA102', 'G112', 'L112', 'Q112', 'V112', 'AA112'];
    const balance2 = ['0', '0', '0', '0', '0', 'G3', 'L3', 'Q3', 'V3', 'AA3', 'G13', 'L13', 'Q13', 'V13', 'AA13', 'G23', 'L23', 'Q23', 'V23', 'AA23', 'G33', 'L33', 'Q33', 'V33', 'AA33', 'G43', 'L43', 'Q43', 'V43', 'AA43', 'G53', 'L53', 'Q53', 'V53', 'AA53', 'G63', 'L63', 'Q63', 'V63', 'AA63', 'G73', 'L73', 'Q73', 'V73', 'AA73', 'G83', 'L83', 'Q83', 'V83', 'AA83', 'G93', 'L93', 'Q93', 'V93', 'AA93', 'G103', 'L103', 'Q103', 'V103', 'AA103'];
    const card_total = ['B6', 'B7', 'B16', 'B17', 'B26', 'B27', 'B36', 'B37', 'B46', 'B47', 'B56', 'B57', 'B66', 'B67', 'B76', 'B77', 'B86', 'B87', 'B96', 'B97', 'B106', 'B107', 'B116', 'B117'];

    const width = this._w * num_acc;
    const height = 120;
    const col = 2 + this._w + this._w * num_acc + this._w;

    const wallet = new Array(height);
    const accounts = new Array(height);

    n = height;
    while (n--) {
      wallet[n] = new Array(5).fill(null);
      accounts[n] = new Array(width).fill(null);
    }

    sheet.protect().setWarningOnly(true);

    if (num_acc < 5) {
      sheet.deleteColumns(7 + this._w * num_acc, this._w * (5 - num_acc));
    }
    SpreadsheetApp.flush();

    for (k = 0; k < num_acc; k++) {
      sheet.getRange(1, 7 + this._w * k).setValue(name_acc[k]);
    }

    const buildWallet = formulasBackstage.wallet();
    const buildAccounts = formulasBackstage.accounts();

    i = -1;
    while (++i < 12) {
      k = 0;
      income = '0';
      expenses = '0';

      wallet[this._h * i][4] = buildWallet.bsblank(i, values[k]);

      const bsblank = RangeUtils.rollA1Notation(2 + this._h * i, 6);
      wallet[2 + this._h * i][0] = buildWallet.expensesIgn(numRows, i, bsblank);

      for (; k < num_acc; k++) {
        const bsblank = RangeUtils.rollA1Notation(2 + this._h * i, 11 + this._w * k);
        const header_value = RangeUtils.rollA1Notation(4, 8 + 5 * k);
        income += ' + ' + RangeUtils.rollA1Notation(6 + this._h * i, 8 + this._w * k);
        expenses += ' + ' + RangeUtils.rollA1Notation(4 + this._h * i, 7 + this._w * k);

        accounts[this._h * i][this._w * k] = '=' + balance2[5 * i + k];
        accounts[this._h * i][4 + this._w * k] = buildAccounts.bsblank(i, header_value, values[1 + k]);
        accounts[1 + this._h * i][this._w * k] = buildAccounts.balance(i, values[1 + k], balance1[5 * i + k], bsblank);
        accounts[2 + this._h * i][this._w * k] = buildAccounts.expensesIgn(i, values[1 + k], tags[1 + k], bsblank);
        accounts[this._h * i][1 + this._w * k] = buildAccounts.bsreport(i, tags[1 + k], combo[1 + k], bsblank);
      }

      wallet[1 + this._h * i][0] = income;
      wallet[3 + this._h * i][0] = expenses;
    }

    sheet.getRange(2, 2, height, 5).setFormulas(wallet);
    sheet.getRange(2, 7, height, width).setFormulas(accounts);

    SpreadsheetApp.flush();
    sheet.getRangeList(card_total).setFormulaR1C1('R[-2]C[' + (col - this._w - 2) + ']');

    if (this._config.decimal_places !== 2) {
      sheet.getRange(2, 2, sheet.getMaxRows() - 1, sheet.getMaxColumns() - 1).setNumberFormat(this._config.number_format);
    }
  }

  setupCards_ () {
    const formulasCards = FormulaBuild.cards().header();

    const sheet = this._spreadsheet.getSheetByName('Cards');
    let formula;
    let expr1, expr2, expr3;
    let i, k;

    const dec_p = this._config.decimal_separator;
    const num_acc = this._config.number_accounts;

    const col = 2 + this._w + this._w * num_acc;
    const dec_c = (dec_p ? ',' : '\\');
    const header = RangeUtils.rollA1Notation(1, col, 1, this._w * 11);

    this._spreadsheet.setActiveSheet(sheet);
    this._spreadsheet.moveActiveSheet(14);

    const ranges = [
      sheet.getRange(6, 1, 400, 5),
      sheet.getRange(2, 2, 1, 2)
    ];
    for (i = 1; i < 12; i++) {
      ranges[2 * i] = ranges[0].offset(0, 6 * i);
      ranges[2 * i + 1] = ranges[1].offset(0, 6 * i);
    }

    sheet.protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true);

    const rangeOff = sheet.getRange(2, 1);
    for (i = 0; i < 12; i++) {
      const index = RangeUtils.rollA1Notation(2, 1 + 6 * i);
      const card = RangeUtils.rollA1Notation(2, 2 + 6 * i);
      const reference = '_Backstage!' + RangeUtils.rollA1Notation(2 + this._h * i, col);

      rangeOff.offset(0, 1 + 6 * i).setValue('All');

      formula = formulasCards.availCredit(i, reference);
      rangeOff.offset(1, 6 * i).setFormula(formula);

      formula = formulasCards.sparkline(index, card, reference);
      rangeOff.offset(2, 6 * i).setFormula(formula);

      formula = formulasCards.index(card, header);
      rangeOff.offset(0, 6 * i).setFormula(formula);

      formula = formulasCards.report(index, reference);
      rangeOff.offset(0, 3 + 6 * i).setFormula(formula);
    }

    if (this._config.decimal_places !== 2) {
      const list_format = [];

      for (let i = 0; i < 12; i++) {
        list_format[i] = RangeUtils.rollA1Notation(6, 4 + 6 * i, 400, 1);
      }

      sheet.getRangeList(list_format).setNumberFormat(this._config.number_format);
    }

    SpreadsheetApp.flush();
  }

  setupCashFlow_ () {
    const sheet = this._spreadsheet.getSheetByName('Cash Flow');
    let ranges, formula;
    let d, s;
    let i, j, k;

    const initial_month = this._config.initial_month;
    const dec_p = this._config.decimal_separator;
    const num_acc = this._config.number_accounts;
    const financial_year = this._config.financial_year;

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

    if (initial_month === 0) {
      formula = '=0 + B4';
    } else {
      d = new Date(financial_year, initial_month, 0).getDate();
      formula = '=' + RangeUtils.rollA1Notation(3 + d, 4 * initial_month - 1) + ' + ' + RangeUtils.rollA1Notation(4, 2 + 4 * initial_month);
    }

    for (k = 0; k < num_acc; k++) {
      formula += ' + _Backstage!' + ranges[k] + (2 + this._h * initial_month);
    }
    sheet.getRange(4, 3 + 4 * initial_month).setFormula(formula);

    if (this._config.decimal_places !== 2) {
      const list_format = [];

      for (let i = 0; i < 12; i++) {
        list_format[i] = RangeUtils.rollA1Notation(4, 2 + 4 * i, 31, 2);
      }

      sheet.getRangeList(list_format).setNumberFormat(this._config.number_format);
    }

    SpreadsheetApp.flush();
  }

  setupEast_ () {
    let sheet;
    let md, t, i;

    const initial_month = this._config.initial_month;

    if (this._date.yyyy === this._config.financial_year) {
      t = true;
      md = Utils.getMonthDelta(this._date.mm);
    } else {
      t = false;
    }

    const sheets = [];
    for (i = 0; i < 12; i++) {
      sheets[i] = this._spreadsheet.getSheetByName(MONTH_NAME.short[i]);
    }

    sheet = this._spreadsheet.getSheetByName('Summary');
    this._spreadsheet.setActiveSheet(sheet);
    sheet.setTabColor('#e69138');

    for (i = 0; i < 12; i++) {
      sheet = sheets[i];

      if (i < initial_month) {
        if (t && (i < this._date.mm + md[0] || i > this._date.mm + md[1])) {
          sheet.setTabColor('#b7b7b7');
        } else {
          sheet.setTabColor('#b7b7b7');
        }
      } else if (t) {
        if (i < this._date.mm + md[0] || i > this._date.mm + md[1]) {
          sheet.setTabColor('#a4c2f4');
        } else {
          sheet.setTabColor('#3c78d8');
        }
      } else {
        sheet.setTabColor('#a4c2f4');
      }
    }

    if (t) {
      sheets[this._date.mm].setTabColor('#6aa84f');
    }

    this._spreadsheet.getSheetByName('Cards').setTabColor('#e69138');
    this._spreadsheet.getSheetByName('Cash Flow').setTabColor('#e69138');
    this._spreadsheet.getSheetByName('Tags').setTabColor('#e69138');
    this._spreadsheet.getSheetByName('_Backstage').setTabColor('#cc0000');
    this._spreadsheet.getSheetByName('_Unique').setTabColor('#cc0000');
    this._spreadsheet.getSheetByName('_Settings').setTabColor('#cc0000');
    this._spreadsheet.getSheetByName('Quick Actions').setTabColor('#6aa84f');
    this._spreadsheet.getSheetByName('_About BnS').setTabColor('#6aa84f');

    if (t) {
      for (i = 0; i < 12; i++) {
        sheet = sheets[i];

        if (i < initial_month && (i < this._date.mm + md[0] || i > this._date.mm + md[1])) {
          sheet.hideSheet();
        } else if (i < this._date.mm + md[0] || i > this._date.mm + md[1]) {
          sheet.hideSheet();
        }
      }

      if (this._date.mm === 11) {
        sheets[8].showSheet();
      }
    }

    this._spreadsheet.getSheetByName('_Backstage').hideSheet();
    this._spreadsheet.getSheetByName('_Unique').hideSheet();
    this._spreadsheet.getSheetByName('_Settings').hideSheet();
    this._spreadsheet.getSheetByName('_About BnS').hideSheet();

    SpreadsheetApp.flush();
  }

  setupMonthSheet_ () {
    const formulaBuild = FormulaBuild.ttt().header();

    const sheetTTT = this._spreadsheet.getSheetByName('TTT');
    let sheet, formula;
    let expr1, expr2, expr3, expr4;
    let i, k;

    const name_acc = this._config.name_accounts;
    const num_acc = this._config.number_accounts;

    const sheets = new Array(12);

    const headers = [];
    for (k = 0; k < 1 + num_acc; k++) {
      headers[k] = RangeUtils.rollA1Notation(1, 1 + 5 * k);
    }

    if (num_acc < 5) {
      sheetTTT.deleteColumns(6 + 5 * num_acc, 5 * (5 - num_acc));
    }

    if (this._config.decimal_places !== 2) {
      const list_format = [];

      list_format[0] = RangeUtils.rollA1Notation(5, 3, 400, 1);

      for (let k = 1; k <= num_acc; k++) {
        list_format[k] = RangeUtils.rollA1Notation(5, 3 + 5 * k, 400, 1);
      }

      sheetTTT.getRangeList(list_format)
        .setNumberFormat(this._config.number_format);
    }

    SpreadsheetApp.flush();

    for (i = 0; i < 12; i++) {
      sheet = this._spreadsheet.insertSheet(MONTH_NAME.short[i], 3 + i, { template: sheetTTT });
      sheets[i] = sheet;

      sheet.getRange('A3').setFormula('CONCAT("Expenses "; TO_TEXT(_Backstage!$B' + (4 + this._h * i) + '))');

      const ranges = [];
      const rangeOff1 = sheet.getRange(2, 6);
      const rangeOff2 = sheet.getRange(5, 1, 400, 4);
      for (k = 0; k < num_acc; k++) {
        ranges[k] = rangeOff2.offset(0, 5 * k);

        formula = formulaBuild.balance(k, i);
        rangeOff1.offset(0, 5 * k).setFormula(formula);

        formula = formulaBuild.expenses(k, i);
        rangeOff1.offset(1, 5 * k).setFormula(formula);

        formula = formulaBuild.report(k, i);
        rangeOff1.offset(-1, 2 + 5 * k).setFormula(formula);
      }

      ranges[k] = rangeOff2.offset(0, 5 * k);
      sheet.protect()
        .setUnprotectedRanges(ranges)
        .setWarningOnly(true);
    }

    sheets[0].getRange(1, 1).setValue('Wallet');
    for (k = 0; k < num_acc; k++) {
      sheets[0].getRange(1, 6 + k * 5).setValue(name_acc[k]);
    }

    for (i = 1; i < 12; i++) {
      const rangeOff = sheets[i].getRange(1, 1);

      for (k = 0; k < 1 + num_acc; k++) {
        rangeOff.offset(0, 5 * k).setFormula('=' + MONTH_NAME.short[i - 1] + '!' + headers[k]);
      }
    }

    this._spreadsheet.deleteSheet(sheetTTT);
  }

  setupProperties_ () {
    const adminId = User2.getId();

    let properties;

    properties = {
      initial_month: this._config.initial_month,
      financial_calendar: '',
      post_day_events: false,
      cash_flow_events: false,
      override_zero: false,
      optimize_load: true
    };
    CachedAccess.update('user_settings', properties);

    properties = {
      admin_id: adminId,
      automatic_backup: false
    };
    CachedAccess.update('admin_settings', properties);

    properties = {
      date_created: this._date.time,
      number_accounts: this._config.number_accounts,
      financial_year: this._config.financial_year
    };
    CachedAccess.update('const_properties', properties);

    const metadata = {
      number_accounts: this._config.number_accounts,
      financial_year: this._config.financial_year
    };

    this._spreadsheet.addDeveloperMetadata(
      'const_properties',
      JSON.stringify(metadata),
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );

    properties = {
      view_mode: 'complete',
      decimal_places: this._config.decimal_places,
      decimal_separator: this._config.decimal_separator,
      spreadsheet_locale: this._spreadsheet.getSpreadsheetLocale(),
      optimize_load: [false, false, false, false, false, false, false, false, false, false, false, false]
    };
    CachedAccess.update('spreadsheet_settings', properties);
  }

  setupSettings_ () {
    const buildFormulas = FormulaBuild.settings().formulas();
    const sheet = this._spreadsheet.getSheetByName('_Settings');
    let cell, dec_p;

    this._spreadsheet.setActiveSheet(sheet);
    this._spreadsheet.moveActiveSheet(8);

    sheet.protect().setWarningOnly(true);

    dec_p = this._config.decimal_places;
    const dec_c = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '.0');

    cell = sheet.getRange(8, 2);
    cell.setNumberFormat('0' + dec_c);
    cell.setValue(0.1);
    SpreadsheetApp.flush();

    cell = cell.getDisplayValue();
    dec_p = /\./.test(cell);
    if (dec_p === 0) sheet.getRange(8, 2).setNumberFormat('0');

    this._config.decimal_separator = dec_p;
    SettingsSpreadsheet.setValueOf('decimal_separator', dec_p);

    cell = [
      [FormatNumber.localeSignal(this._config.financial_year)],
      [buildFormulas.actualMonth()],
      [FormatNumber.localeSignal(this._config.initial_month + 1)],
      [buildFormulas.activeMonths()],
      [buildFormulas.mFactor()],
      [buildFormulas.countTags()],
      ['RAND()'],
      [FormatNumber.localeSignal(this._config.decimal_places)],
      [this._config.decimal_separator],
      ['CONCATENATE("#,##0."; REPT("0"; B9); ";(#,##0."; REPT("0"; B9); ")")']
    ];
    sheet.getRange(2, 2, 10, 1).setFormulas(cell);

    const metadata = {
      initial_month: this._config.initial_month,
      financial_calendar_sha256: '',
      post_day_events: false,
      cash_flow_events: false
    };

    sheet.addDeveloperMetadata(
      'user_settings',
      JSON.stringify(metadata),
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );

    SpreadsheetApp.flush();
  }

  setupSummary_ () {
    const formulaBuild = FormulaBuild.summary();

    const sheet = this._spreadsheet.getSheetByName('Summary');
    let formula, chart, options;

    options = {
      0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Income' },
      1: { color: '#cccccc', type: 'bars', labelInLegend: 'Expenses' },
      2: { color: '#45818e', type: 'bars', labelInLegend: 'Income' },
      3: { color: '#e69138', type: 'bars', labelInLegend: 'Expenses' },
      4: { color: '#45818e', type: 'line', labelInLegend: 'Avg Income' },
      5: { color: '#e69138', type: 'line', labelInLegend: 'Avg Expenses' }
    };

    sheet.protect()
      .setUnprotectedRanges([
        sheet.getRange(52, 2, 1, 3), sheet.getRange(72, 2, 1, 3)
      ])
      .setWarningOnly(true);
    sheet.getRange('B2').setValue(this._config.financial_year + ' | Year Summary');

    const formulas = [];
    const buildTable1 = formulaBuild.table1();
    for (let i = 0; i < 12; i++) {
      formulas[i] = ['', null, '', null];

      formulas[i][0] = '=_Backstage!$B' + (3 + this._h * i);
      formulas[i][2] = buildTable1.expensesMonth(i);
    }
    sheet.getRange(11, 4, 12, 4).setFormulas(formulas);

    chart = sheet.newChart()
      .addRange(sheet.getRange('C25:I36'))
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(24, 2, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('series', options)
      .setOption('height', 482)
      .setOption('width', 886);

    sheet.insertChart(chart.build());

    if (this._config.decimal_places !== 2) {
      sheet.getRangeList(['D9:I22', 'D25:G36']).setNumberFormat(this._config.number_format);
    }

    formula = formulaBuild.table2().data();
    sheet.getRange(55, 2).setFormula(formula);

    chart = sheet.newChart()
      .addRange(sheet.getRange('B54:B64'))
      .addRange(sheet.getRange('D54:D64'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.PIE)
      .setPosition(52, 8, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('height', 447)
      .setOption('width', 444);

    sheet.insertChart(chart.build());

    formula = formulaBuild.table3().total();
    sheet.getRange(75, 4).setFormula(formula);

    options = {
      0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Total' },
      1: { color: '#45818e', type: 'bars', labelInLegend: 'Total' },
      2: { color: '#45818e', type: 'line', labelInLegend: 'Average' }
    };

    chart = sheet.newChart()
      .addRange(sheet.getRange('B75:B86'))
      .addRange(sheet.getRange('I75:K86'))
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(72, 8, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('series', options)
      .setOption('height', 459)
      .setOption('width', 444);

    sheet.insertChart(chart.build());

    SpreadsheetApp.flush();
  }

  setupTables_ () {
    const initial_month = this._config.initial_month;
    const name_acc = this._config.name_accounts;
    const num_acc = this._config.number_accounts;

    const db_accounts = {};
    const meta_accounts = {};

    const list_ids = [];
    for (let k = 0; k < num_acc; k++) {
      let i = 0;
      let id = '';

      do {
        id = Noise.randomString(7, 'lonum');
      } while (list_ids.indexOf(id) !== -1 && ++i < 99);
      if (i >= 99) throw new Error('Could not generate account IDs.');
      list_ids.push(id);

      const account = {
        index: k,
        name: name_acc[k],
        balance: 0,
        time_start: initial_month
      };

      db_accounts[id] = {};
      Object.assign(db_accounts[id], account);

      delete account.index;
      meta_accounts[k] = {};
      Object.assign(meta_accounts[k], account);
    }

    const sheet = this._spreadsheet.getSheetByName('_Backstage');

    sheet.addDeveloperMetadata(
      'db_accounts',
      JSON.stringify(meta_accounts),
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );
    CachedAccess.update('db_accounts', db_accounts);

    sheet.addDeveloperMetadata(
      'db_cards',
      JSON.stringify({}),
      SpreadsheetApp.DeveloperMetadataVisibility.PROJECT
    );
    CachedAccess.update('db_cards', {});
  }

  setupTags_ () {
    const formulaBuild = FormulaBuild.tags();

    const sheet = this._spreadsheet.getSheetByName('Tags');
    let formula, rg, cd;
    let i, k;

    const tags = ['D5:D404', 'I5:I404', 'N5:N404', 'S5:S404', 'X5:X404', 'AC5:AC404'];
    const combo = ['C5:D404', 'H5:I404', 'M5:N404', 'R5:S404', 'W5:X404', 'AB5:AC404'];

    const num_acc = this._config.number_accounts;

    const formulas = [[]];
    const col = 11 + this._w * num_acc;

    const ranges = sheet.getRange(2, 1, 40, 5);
    sheet.protect()
      .setUnprotectedRanges([ranges])
      .setWarningOnly(true);

    const buildMonths = formulaBuild.table();

    for (i = 0; i < 12; i++) {
      formula = buildMonths.month(400, 400, i);
      formulas[0][i] = formula;
    }
    sheet.getRange(1, 6, 1, 12).setFormulas(formulas);

    const buildStats = formulaBuild.stats();

    formula = buildStats.average();
    sheet.getRange(1, 19).setFormula(formula);

    formula = buildStats.total();
    sheet.getRange(1, 20).setFormula(formula);

    if (this._config.decimal_places !== 2) {
      sheet.getRange(2, 6, 40, 12).setNumberFormat(this._config.number_format);
      sheet.getRange(2, 19, 40, 2).setNumberFormat(this._config.number_format);
    }

    SpreadsheetApp.flush();
  }

  setupUnique_ () {
    const sheet = this._spreadsheet.getSheetByName('_Unique');

    const num_acc = this._config.number_accounts;

    this._spreadsheet.setActiveSheet(sheet);
    this._spreadsheet.moveActiveSheet(20);

    sheet.protect().setWarningOnly(true);

    let range_accounts = '';
    let range_cards = '';

    const ranges = [];
    for (let k = 0; k <= num_acc; k++) {
      ranges[k] = RangeUtils.rollA1Notation(5, 2 + 5 * k, 400, 1);
    }

    for (let i = 0; i < 12; i++) {
      range_cards += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, 400, 1) + '; ';

      for (let k = 0; k <= num_acc; k++) {
        range_accounts += MONTH_NAME.short[i] + '!' + ranges[k] + '; ';
      }
    }

    range_accounts = '{' + range_accounts.slice(0, -2) + '}';
    sheet.getRange(1, 1).setFormula('SORT(UNIQUE(' + range_accounts + '))');

    range_cards = '{' + range_cards.slice(0, -2) + '}';

    let formula = 'FILTER(' + range_cards + '; NOT(REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+"))); ';
    formula += 'ARRAYFORMULA(REGEXREPLACE(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")); "[0-9]+/[0-9]+"; ""))';
    formula = 'SORT(UNIQUE({' + formula + '})); ';
    formula += 'SORT(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")))';
    formula = '{' + formula + '}';

    sheet.getRange(1, 2).setFormula(formula);

    SpreadsheetApp.flush();
  }

  setupWest_ () {
    this._spreadsheet.getSheetByName('_About BnS')
      .protect()
      .setWarningOnly(true);

    const sheet = this._spreadsheet.getSheetByName('Quick Actions');

    const ranges = [];
    ranges[0] = sheet.getRange(3, 3, 3, 1);
    ranges[1] = sheet.getRange(8, 3, 2, 1);
    ranges[2] = sheet.getRange(12, 2, 1, 2);

    sheet.protect()
      .setUnprotectedRanges(ranges)
      .setWarningOnly(true);

    SpreadsheetApp.flush();
  }

  run () {
    this.setupProperties_();
    this.setupTables_();

    this.setupSettings_();
    this.setupMonthSheet_();
    this.setupUnique_();
    this.setupBackstage_();
    this.setupSummary_();
    this.setupTags_();
    this.setupCards_();
    this.setupCashFlow_();
    this.setupWest_();
    this.setupEast_();

    return this;
  }
}