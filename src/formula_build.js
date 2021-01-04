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

  tags: function () {
    const tags = Object.create(FormulaBuild.Tags);
    tags._settings = this._settings;
    return tags;
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
          case 'decimal_separator':
            this._settings.decimal_separator = getSpreadsheetSettings_('decimal_separator');
            break;
        }
      },

      index: function (card, headers) {
        let formula;

        formula = 'REGEXMATCH(_Backstage!' + headers + '; "\\^"&' + card + '&"\\$")';
        formula = 'FILTER(_Backstage!' + headers + '; ' + formula + ')';
        formula = 'INDEX(' + formula + '; 0; 1)';
        formula = 'IF(' + card + ' = "All"; 1; MATCH(' + formula + '; _Backstage!' + headers + '; 0))';
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

        formula = 'OFFSET(' + reference + '; 4; 1 + 5*' + index + '; 1; 1)';
        formula = 'TEXT(' + formula + '; "' + num_f + '")';
        formula = 'IF(' + select + ' = "All"; ""; ' + formula + ')';
        formula = 'CONCATENATE("AVAIL credit: "; ' + formula + ')';

        return formula;
      },

      sparkline: function (index, card, reference) {
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

    table2: function () {
      return Object.create(FormulaBuild.Summary.Table2);
    },

    table3: function () {
      return Object.create(FormulaBuild.Summary.Table3);
    },

    chart3: function () {
      const chart3 = Object.create(FormulaBuild.Summary.Chart3);
      chart3._settings = this._settings;
      return chart3;
    },

    Table1: {
      income: function () {
        return 'IF(_Settings!$B6 > 0;  {SUM(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($D10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})';
      },

      expenses: function () {
        return 'IF(_Settings!$B6 > 0;  {SUM(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1)); AVERAGE(OFFSET($F10; _Settings!$B4; 0; _Settings!$B6; 1))}; {0; 0})';
      },

      expenses_month: function (mm) {
        const _h = TABLE_DIMENSION.height;

        let formula = 'SUM(_Backstage!$B' + (4 + _h * mm) + ':$B' + (6 + _h * mm) + ')';

        return formula;
      }
    },

    Chart1: {
      loadSettings: function (name) {
        if (this._settings[name]) return;

        switch (name) {
          case 'decimal_separator':
            this._settings.decimal_separator = getSpreadsheetSettings_('decimal_separator');
            break;
        }
      },

      data: function (mm) {
        this.loadSettings('decimal_separator');

        const dec_s = this._settings.decimal_separator ? ',' : '\\';

        const income = rollA1Notation(11 + mm, 4);
        const expenses = rollA1Notation(11 + mm, 6);

        return 'IF(OR(ROW() - 24 < $M$3; ROW() - 24 > $M$3 - 1 + $M$4); {' + income + dec_s + ' -' + expenses + dec_s + ' ""' + dec_s + ' ""}; {""' + dec_s + ' ""' + dec_s + ' ' + income + dec_s + ' -' + expenses + '})';
      }
    },

    Table2: {
      data: function () {
        return 'IF(AND(E50 > 0; _Settings!B7 > 0); QUERY({Tags!$B$1:$T}; "select Col1, sum(Col18), -1 * sum(Col"&(4 + E50)&") where Col3=true or Col3=\'TRUE\' group by Col1 label Col1 \'\', -1 * sum(Col"&(4 + E50)&") \'\', sum(Col18) \'\'"); )';
      }
    },

    Table3: {
      share: function () {
        let formula;

        formula = 'NOT(ISBLANK(D73:D84)) * (ROW(D73:D84) - 72 >= $M$3) * (ROW(D73:D84) - 72 <= $M$3 - 1 + $M$4)';
        formula = 'IF(B70 <> ""; ARRAYFORMULA(IF(' + formula + '; D73:D84/$D$85; 0)); )';

        return formula;
      },

      total: function () {
        return 'IF(AND(E50 > 0; _Settings!B7 > 0); INDEX(TRANSPOSE(QUERY({Tags!$B$1:$T}; "select -1 * sum(Col5), -1 * sum(Col6), -1 * sum(Col7), -1 * sum(Col8), -1 * sum(Col9), -1 * sum(Col10), -1 * sum(Col11), -1 * sum(Col12), -1 * sum(Col13), -1 * sum(Col14), -1 * sum(Col15), -1 * sum(Col16) where Col1=\'"&B70&"\' and (Col3=true or Col3=\'TRUE\') group by Col1")); 0; 2); )';
      }
    },

    Chart3: {
      loadSettings: function (name) {
        if (this._settings[name]) return;

        switch (name) {
          case 'decimal_separator':
            this._settings.decimal_separator = getSpreadsheetSettings_('decimal_separator');
            break;
        }
      },

      data: function (mm) {
        this.loadSettings('decimal_separator');

        const dec_s = this._settings.decimal_separator ? ',' : '\\';

        return 'IF(OR(ROW() - 72 < $M$3; ROW() - 72 > $M$3 - 1 + $M$4); {' + rollA1Notation(73 + mm, 4) + dec_s + ' ""}; {""' + dec_s + ' ' + rollA1Notation(73 + mm, 4) + '})';
      }
    }
  },

  Tags: {
    stats: function () {
      const stats = Object.create(FormulaBuild.Tags.Stats);
      stats._settings = this._settings;
      return stats;
    },

    table: function () {
      const table = Object.create(FormulaBuild.Tags.Table);
      table._settings = this._settings;
      return table;
    },

    Stats: {
      average: function () {
        let formula;

        formula = 'ARRAYFORMULA(IF(E2:E <> ""; $T$2:$T/_Settings!B6; ))';
        formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))';
        formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")';
        formula = '{"average"; ' + formula + '}';

        return formula;
      },

      total: function () {
        const jan = rollA1Notation(2, 6, -1, 1);
        const months = rollA1Notation(2, 6, -1, 12);

        let formula;

        formula = 'IF(COLUMN(' + months + ') - 5 < _Settings!$B$4 + _Settings!$B$6; ROW(' + jan + '); 0)';
        formula = 'IF(COLUMN(' + months + ') - 5 >= _Settings!$B$4; ' + formula + '; 0)';
        formula = 'ARRAYFORMULA(IF(E2:E <> ""; SUMIF(' + formula + '; ROW(' + jan + '); ' + jan + '); ))';
        formula = 'IF(_Settings!$B$6 > 0; ' + formula + '; ARRAYFORMULA($F$2:$F * 0))';
        formula = 'IF(_Settings!$B$7 > 0; ' + formula + '; "")';
        formula = '{"total"; ' + formula + '}';

        return formula;
      }
    },

    Table: {
      loadSettings: function (name) {
        if (this._settings[name]) return;

        switch (name) {
          case 'number_accounts':
            this._settings.number_accounts = getConstProperties_('number_accounts');
            break;
        }
      },

      month: function (numRowsMonth, numRowsCards, mm) {
        this.loadSettings('number_accounts');

        const _h = TABLE_DIMENSION.height;
        const _w = TABLE_DIMENSION.width;

        const number_accounts = this._settings.number_accounts;

        let formula, bsblank;
        let concat_tags, concat_value_tags;

        bsblank = rollA1Notation(2 + _h * mm, 6);

        concat_tags = '{ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + rollA1Notation(5, 4, numRowsMonth, 1) + '; _Backstage!' + bsblank + '; 1)';
        concat_value_tags = '{ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + rollA1Notation(5, 3, numRowsMonth, 2) + '; _Backstage!' + bsblank + '; 2)';

        for (let k = 0; k < number_accounts; k++) {
          const bsblank = rollA1Notation(2 + _h * mm, 11 + _w * k);

          concat_tags += '; ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + rollA1Notation(5, 9 + 5 * k, numRowsMonth, 1) + '; _Backstage!' + bsblank + '; 1)';
          concat_value_tags += '; ARRAY_CONSTRAIN(' + MONTH_NAME.short[mm] + '!' + rollA1Notation(5, 8 + 5 * k, numRowsMonth, 2) + '; _Backstage!' + bsblank + '; 2)';
        }

        bsblank = rollA1Notation(2 + _h * mm, 6 + _w + _w * number_accounts);

        concat_tags += '; ARRAY_CONSTRAIN(Cards!' + rollA1Notation(6, 5 + 6 * mm, numRowsCards, 1) + '; _Backstage!' + bsblank + ' ; 1)}';
        concat_value_tags += '; ARRAY_CONSTRAIN(Cards!' + rollA1Notation(6, 4 + 6 * mm, numRowsCards, 2) + '; _Backstage!' + bsblank + '; 2)}';

        formula = 'IFERROR(FILTER(' + concat_value_tags + '; NOT(ISBLANK(' + concat_tags + '))); "")';
        formula = 'BSSUMBYTAG(TRANSPOSE($E$1:$E); ' + formula + ')';
        formula = '{"' + MONTH_NAME.long[mm] + '"; IF(_Settings!$B$7 > 0; ' + formula + '; )}';

        return formula;
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
      loadSettings: function (name) {
        if (this._settings[name]) return;

        switch (name) {
          case 'decimal_places':
            this._settings.decimal_places = getSpreadsheetSettings_('decimal_places');
            break;
        }
      },

      balance: function (index, mm) {
        const balance = rollA1Notation(3 + TABLE_DIMENSION.height * mm, 7 + TABLE_DIMENSION.width * index);

        return 'CONCAT("Balance "; TO_TEXT(_Backstage!' + balance + '))';
      },

      expenses: function (index, mm) {
        const expenses = rollA1Notation(4 + TABLE_DIMENSION.height * mm, 7 + TABLE_DIMENSION.width * index);

        return 'CONCAT("Expenses "; TO_TEXT(_Backstage!' + expenses + '))';
      },

      report: function (index, mm) {
        this.loadSettings('decimal_places');

        const _h = TABLE_DIMENSION.height;
        const _w = TABLE_DIMENSION.width;

        const dec_m = (this._settings.decimal_places > 0 ? '.' + '0'.repeat(this._settings.decimal_places) : '');
        const number_format = '#,##0' + dec_m + ';' + '(#,##0' + dec_m + ')';

        let formula, part_1, part_2, part_3, part_4;

        part_1 = 'TEXT(_Backstage!' + rollA1Notation(2 + _h * mm, 8 + _w * index) + '; "' + number_format + '")';
        part_1 = '"Withdrawal: ["; _Backstage!' + rollA1Notation(2 + _h * mm, 9 + _w * index) + '; "] "; ' + part_1 + '; "\n"; ';

        part_2 = 'TEXT(_Backstage!' + rollA1Notation(3 + _h * mm, 8 + _w * index) + '; "' + number_format + '")';
        part_2 = '"Deposit: ["; _Backstage!' + rollA1Notation(3 + _h * mm, 9 + _w * index) + '; "] "; ' + part_2 + '; "\n"; ';

        part_3 = 'TEXT(_Backstage!' + rollA1Notation(4 + _h * mm, 8 + _w * index) + '; "' + number_format + '")';
        part_3 = '"Trf. in: ["; _Backstage!' + rollA1Notation(4 + _h * mm, 9 + _w * index) + '; "] "; ' + part_3 + '; "\n"; ';

        part_4 = 'TEXT(_Backstage!' + rollA1Notation(5 + _h * mm, 8 + _w * index) + '; "' + number_format + '")';
        part_4 = '"Trf. out: ["; _Backstage!' + rollA1Notation(5 + _h * mm, 9 + _w * index) + '; "] "; ' + part_4;

        formula = 'CONCATENATE(' + part_1 + part_2 + part_3 + part_4 + ')';

        return formula;
      }
    }
  }
});
