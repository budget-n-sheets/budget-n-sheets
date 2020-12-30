const FormulaBuild = Object.freeze({
  _settings: {
  },

  backstage: function () {
    const backstage = Object.create(FormulaBuild.Backstage);
    backstage._settings = this._settings;
    return backstage;
  },

  cards: function () {
    const cards = Object.create(FormulaBuild.Cards);
    cards._settings = this._settings;
    return cards;
  },

  settings: function () {
    const settings = Object.create(FormulaBuild.Settings);
    settings._settings = this._settings;
    return settings;
  },

  summary: function () {
    const summary = Object.create(FormulaBuild.Summary);
    summary._settings = this._settings;
    return summary;
  },

  ttt: function () {
    const ttt = Object.create(FormulaBuild.Ttt);
    ttt._settings = this._settings;
    return ttt;
  },

  Backstage: {
    wallet: function () {
      return Object.create(FormulaBuild.Backstage.Wallet);
    },

    accounts: function () {
      return Object.create(FormulaBuild.Backstage.Accounts);
    },

    cards: function () {
      const cards = Object.create(FormulaBuild.Backstage.Cards);
      cards._settings = this._settings;
      return cards;
    },

    Wallet: {
      expenses_ign: function (numRows, mm, bsblank) {
        const value = rollA1Notation(5, 3, numRows, 1);
        const tags = rollA1Notation(5, 4, numRows, 1);

        let formula;

        formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + tags + '; ' + bsblank + '; 1); "#ign"))';
        formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1))); ' + formula;
        formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
        formula = 'SUM(IFERROR(' + formula + '; 0))';

        return formula;
      },

      bsblank: function (mm, value) {
        return 'BSBLANK(TRANSPOSE(' + MONTH_NAME.short[mm] + '!' + value + '))';
      }
    },

    Accounts: {
      balance: function (mm, value, balance, bsblank) {
        let formula;

        formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1)))';
        formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
        formula = balance + ' + IFERROR(SUM(' + formula + '); 0)';

        return formula;
      },

      expenses_ign: function (mm, value, tags, bsblank) {
        let formula;

        formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + tags + '; ' + bsblank + '; 1); "#(dp|wd|qcc|ign|rct|trf)"))';
        formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1))); ' + formula;
        formula = 'FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
        formula = 'IFERROR(SUM(' + formula + '); 0)';

        return formula;
      },

      bsreport: function (mm, tags, value_tags, bsblank) {
        let formula;

        formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + tags + '; ' + bsblank + '; 1)))';
        formula = 'IFERROR(FILTER(ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + value_tags + '; ' + bsblank + '; 2); ' + formula + '); "")';
        formula = 'BSREPORT(TRANSPOSE(' + formula + '))';

        return formula;
      },

      bsblank: function (mm, value) {
        return 'BSBLANK(TRANSPOSE(' + MONTH_NAME.short[mm] + '!' + value + '))';
      }
    },

    Cards: {
      loadSettings: function (name) {
        if (this._settings[name]) return;

        switch (name) {
          case 'decimal_separator':
            this._settings.decimal_separator = getSpreadsheetSettings_('decimal_separator');
            break;
        }
      },

      credit: function (numRows, mm, regex, bsblank) {
        const card = rollA1Notation(6, 3 + 6 * mm, numRows);
        const value = rollA1Notation(6, 4 + 6 * mm, numRows);

        let formula;

        formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
        formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
        formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) >= 0';

        formula = 'SUM(FILTER(' + formula + '))';
        formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

        return formula;
      },

      expenses: function (numRows, mm, regex, bsblank) {
        const card = rollA1Notation(6, 3 + 6 * mm, numRows);
        const value = rollA1Notation(6, 4 + 6 * mm, numRows);

        let formula;

        formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
        formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
        formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) < 0';

        formula = 'SUM(FILTER(' + formula + '))';
        formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

        return formula;
      },

      expenses_ign: function (numRows, mm, regex, bsblank) {
        const card = rollA1Notation(6, 3 + 6 * mm, numRows);
        const value = rollA1Notation(6, 4 + 6 * mm, numRows);
        const tags = rollA1Notation(6, 5 + 6 * mm, numRows);

        let formula;

        formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
        formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
        formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) < 0; ';
        formula += 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + tags + '; ' + bsblank + '; 1); "#ign"))';

        formula = 'SUM(FILTER(' + formula + '))';
        formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

        return formula;
      },

      bscardpart: function (numRows, mm, regex, bsblank) {
        this.loadSettings('decimal_separator');

        const transaction = rollA1Notation(6, 2 + 6 * mm, numRows);
        const card = rollA1Notation(6, 3 + 6 * mm, numRows);
        const value = rollA1Notation(6, 4 + 6 * mm, numRows);
        const tags = rollA1Notation(6, 5 + 6 * mm, numRows);

        const dec_s = this._settings.decimal_separator ? ',' : '\\';

        let formula;

        formula = 'REGEXEXTRACT(ARRAY_CONSTRAIN(Cards!' + transaction + '; ' + bsblank + '; 1); "[0-9]+/[0-9]+")';
        formula = 'ARRAYFORMULA(SPLIT(' + formula + '; "/"))';

        formula = '{' + formula + dec_s + ' ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1)}; ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
        formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
        formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + transaction + '; ' + bsblank + '; 1); "[0-9]+/[0-9]+")';

        formula = 'BSCARDPART(TRANSPOSE(IFNA(FILTER(' + formula + '); 0)))';
        formula = 'IF(' + regex + ' = ""; 0; ' + formula + ')';

        return formula;
      },

      bsblank: function (numRows, mm) {
        return 'BSBLANK(TRANSPOSE(Cards!' + rollA1Notation(6, 4 + 6 * mm, numRows, 1) + '))';
      }
    }
  },

  Cards: {
    header: function () {
      const header = Object.create(FormulaBuild.Cards.Header);
      header._settings = this._settings;
      return header;
    },

    Header: {
      loadSettings: function (name) {
        if (this._settings[name]) return;

        switch (name) {
          case 'decimal_places':
            this._settings.decimal_places = getSpreadsheetSettings_('decimal_places');
            break;
        }
      },

      index: function (card, headers) {
        let formula;

        formula = 'REGEXMATCH(' + headers + '; "\\^"&' + card + '&"\\$")';
        formula = 'FILTER(' + headers + '; ' + formula + ')';
        formula = 'INDEX(' + formula + '; 0; 1)';
        formula = 'IF(' + card + ' = "All"; 1; MATCH(' + formula + '; ' + headers + '; 0))';
        formula = 'IFERROR((' + formula + ' - 1)/5; "")';

        return formula;
      },

      avail_credit: function (mm, reference) {
        this.loadSettings('decimal_places');

        const index = rollA1Notation(2, 1 + 6 * mm);
        const select = rollA1Notation(2, 2 + 6 * mm);

        const dec_p = this._settings.decimal_places;
        const mantissa = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
        const num_f = '#,##0' + mantissa + ';' + '(#,##0' + mantissa + ')';

        let formula;

        formula = 'OFFSET(_Backstage!' + reference + '; 4; 1 + 5*' + index + '; 1; 1)';
        formula = 'TEXT(' + formula + '; "' + num_f + '")';
        formula = 'IF(' + select + ' = "All"; ""; ' + formula + ')';
        formula = 'CONCATENATE("AVAIL credit: "; ' + formula + ')';

        return formula;
      },

      sparkline: function (index, card, refrence) {
        this.loadSettings('decimal_separator');

        const dec_s = this._settings.decimal_separator ? ',' : '\\';

        let formula;

        const part_1 = 'MAX(0; OFFSET(' + reference + '; 4; 1 + 5*' + index + '; 1; 1))';
        const part_2 = 'OFFSET(' + reference + '; 1; 1 + 5*' + index + '; 1; 1)';
        const part_3 = '{"charttype"' + dec_s + '"bar"; "max"' + dec_s + 'OFFSET(' + reference + '; 0; 1 + 5*' + index + '; 1; 1); "color1"' + dec_s + '"#45818e"; "color2"' + dec_s + '"#e69138"}';

        formula = '{' + part_1 + dec_s + part_2 + '}; ' + part_3;
        formula = 'IF(' + card + ' = "All"; ""; SPARKLINE(' + formula + '))';

        return formula;
      },

      report: function (index, reference) {
        this.loadSettings('decimal_places');

        const dec_p = this._settings.decimal_places;
        const mantissa = (dec_p > 0 ? '.' + '0'.repeat(dec_p) : '');
        const num_f = '#,##0' + mantissa + ';' + '(#,##0' + mantissa + ')';

        let formula, part_1, part_2, part_3;

        part_1 = 'OFFSET(' + reference + '; 1; 5*' + index + '; 1; 1)';
        part_1 = '"Credit: "; TEXT(' + part_1 + '; "' + num_f + '"); "\n"; ';

        part_2 = 'OFFSET(' + reference + '; 3; 5*' + index + '; 1; 1)';
        part_2 = '"Expenses: "; TEXT(' + part_2 + '; "' + num_f + '"); "\n"; ';

        part_3 = 'OFFSET(' + reference + '; 4; 5*' + index + '; 1; 1)';
        part_3 = '"Balance: "; TEXT(' + part_3 + '; "' + num_f + '")';

        formula = 'CONCATENATE(' + part_1 + part_2 + '"\n"; ' + part_3 + ')';

        return formula;
      }
    }
  },

  Settings: {
    formulas: function () {
      const header = Object.create(FormulaBuild.Settings.Formulas);
      header._settings = this._settings;
      return header;
    },

    Formulas: {
      actual_month: function () {
        return 'IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))';
      },

      active_months: function () {
        return 'IF($B4 > $B3; 0; $B3 - $B4 + 1)';
      },

      m_factor: function () {
        return 'IF(AND($B3 = 12; YEAR(TODAY()) <> $B2); $B5; MAX($B5 - 1; 0))';
      },

      count_tags: function () {
        return '=COUNTIF(Tags!$E1:$E; "<>") - 1';
      }
    }
  },

  Summary: {
    table1: function () {
      return Object.create(FormulaBuild.Summary.Table1);
    },

    chart1: function () {
      return Object.create(FormulaBuild.Summary.Chart1);
    },

    table3: function () {
      return Object.create(FormulaBuild.Summary.Table3);
    },

    chart3: function () {
      return Object.create(FormulaBuild.Summary.Chart3);
    },

    Table1: {
      income: function () {
        return 'IF(_Settings!$B6 > 0;  {SUM(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})';
      },

      expenses: function () {
        return 'IF(_Settings!$B6 > 0;  {SUM(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})';
      }
    },

    Chart1: {
      data: function (mm) {
        const income = rollA1Notation(11 + mm, 4);
        const expenses = rollA1Notation(11 + mm, 6);

        return 'IF(OR(ROW() - 24 < $M$3; ROW() - 24 > $M$3 - 1 + $M$4); {' + income + ', -' + expenses + ', "", ""}; {"", "", ' + income + ', -' + expenses + '})';
      }
    },

    Table3: {
      share: function () {
        let formula;

        formula = 'NOT(ISBLANK(D73:D84)) * (ROW(D73:D84) - 72 >= $M$3) * (ROW(D73:D84) - 72 <= $M$3 - 1 + $M$4)';
        formula = 'IF(B70 <> ""; ARRAYFORMULA(IF(' + formula + '; D73:D84/$D$85; 0)); )';

        return formula;
      }
    },

    Chart3: {
      data: function (mm) {
        return 'IF(OR(ROW() - 72 < $M$3; ROW() - 72 > $M$3 - 1 + $M$4); {' + rollA1Notation(73 + mm, 4) + ', ""}; {"", ' + rollA1Notation(73 + mm, 4) + '})';
      }
    }
  },

  Ttt: {
    header: function () {
      const header = Object.create(FormulaBuild.Ttt.Header);
      header._settings = this._settings;
      return header;
    },

    Header: {
      balance: function (index, mm) {
        const balance = rollA1Notation(3 + TABLE_DIMENSION.height * mm, 7 + TABLE_DIMENSION.width * index);

        return 'CONCAT("Balance "; TO_TEXT(_Backstage!' + balance + '))';
      },

      expenses: function (index, mm) {
        const expenses = rollA1Notation(4 + TABLE_DIMENSION.height * mm, 7 + TABLE_DIMENSION.width * index);

        return 'CONCAT("Expenses "; TO_TEXT(_Backstage!' + expenses + '))';
      },

      report: function (index, mm) {
        const _h = TABLE_DIMENSION.height;
        const _w = TABLE_DIMENSION.width;

        let formula, part_1, part_2, part_3, part_4;

        part_1 = 'TEXT(_Backstage!' + rollA1Notation(2 + _h * mm, 8 + _w * index) + '; "' + SETUP_SETTINGS.number_format + '")';
        part_1 = '"Withdrawal: ["; _Backstage!' + rollA1Notation(2 + _h * mm, 9 + _w * index) + '; "] "; ' + part_1 + '; "\n"; ';

        part_2 = 'TEXT(_Backstage!' + rollA1Notation(3 + _h * mm, 8 + _w * index) + '; "' + SETUP_SETTINGS.number_format + '")';
        part_2 = '"Deposit: ["; _Backstage!' + rollA1Notation(3 + _h * mm, 9 + _w * index) + '; "] "; ' + part_2 + '; "\n"; ';

        part_3 = 'TEXT(_Backstage!' + rollA1Notation(4 + _h * mm, 8 + _w * index) + '; "' + SETUP_SETTINGS.number_format + '")';
        part_3 = '"Trf. in: ["; _Backstage!' + rollA1Notation(4 + _h * mm, 9 + _w * index) + '; "] "; ' + part_3 + '; "\n"; ';

        part_4 = 'TEXT(_Backstage!' + rollA1Notation(5 + _h * mm, 8 + _w * index) + '; "' + SETUP_SETTINGS.number_format + '")';
        part_4 = '"Trf. out: ["; _Backstage!' + rollA1Notation(5 + _h * mm, 9 + _w * index) + '; "] "; ' + part_4;

        formula = 'CONCATENATE(' + part_1 + part_2 + part_3 + part_4 + ')';

        return formula;
      }
    }
  }
});
