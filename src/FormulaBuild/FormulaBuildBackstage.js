/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuildBackstage {
  static accounts () {
    return FormulaBuildBackstageAccounts;
  }

  static cards () {
    return FormulaBuildBackstageCards;
  }

  static wallet () {
    return FormulaBuildBackstageWallet;
  }
}

class FormulaBuildBackstageAccounts {
  static balance (regex, mm, numRows, balance, bsblank) {
    const month = Consts.month_name.short[mm]
    const accs = RangeUtils.rollA1Notation(6, 2, numRows)
    const value = RangeUtils.rollA1Notation(6, 5, numRows)

    let formula;

    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1))); ';
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + accs + '; ' + bsblank + '; 1); ' + regex + ')';
    formula = 'FILTER(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = balance + ' + IFERROR(SUM(' + formula + '); 0)';

    return formula;
  }

  static income (regex, mm, numRows, bsblank) {
    const month = Consts.month_name.short[mm]
    const accs = RangeUtils.rollA1Notation(6, 2, numRows)
    const value = RangeUtils.rollA1Notation(6, 5, numRows)
    const tags = RangeUtils.rollA1Notation(6, 6, numRows)

    let formula;

    formula = `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${tags}; ${bsblank}; 1)`;
    formula = `REGEXMATCH(${formula}; "#(rct|inc)"); `;
    formula += `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1) >= 0; `;
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + accs + '; ' + bsblank + '; 1); ' + regex + ')';

    formula = `FILTER(ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1); ${formula})`;
    formula = `IFERROR(SUM(${formula}); 0)`;

    return formula;
  }

  static expensesIgn (regex, mm, numRows, bsblank) {
    const month = Consts.month_name.short[mm]
    const accs = RangeUtils.rollA1Notation(6, 2, numRows)
    const value = RangeUtils.rollA1Notation(6, 5, numRows)
    const tags = RangeUtils.rollA1Notation(6, 6, numRows)
    const ign = RangeUtils.rollA1Notation(6, 7, numRows)

    let formula;

    formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + tags + '; ' + bsblank + '; 1); "#(dp|wd|qcc|rct|inc|trf)")); ';
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + accs + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + ign + '; ' + bsblank + '; 1)); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1)))';
    formula = 'FILTER(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = 'IFERROR(SUM(' + formula + '); 0)';

    return formula;
  }

  static bsblank (mm, header, value) {
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(' + Consts.month_name.short[mm] + '!' + value + '); ROW(' + Consts.month_name.short[mm] + '!' + value + ') - ROW(' + Consts.month_name.short[mm] + '!' + header + '); FALSE)); ROWS(' + Consts.month_name.short[mm] + '!' + value + '))';
  }

  static reportTag (regex, tag, mm, numRows, bsblank) {
    const accs = RangeUtils.rollA1Notation(6, 2, numRows)
    const value = RangeUtils.rollA1Notation(6, 5, numRows)
    const tags = RangeUtils.rollA1Notation(6, 6, numRows)

    const valueAddress = `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1)`;
    const tagsAddress = `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${tags}; ${bsblank}; 1)`;

    let formula = '';

    switch (tag) {
      case 'wd':
        formula += `REGEXMATCH(${tagsAddress}; "#wd"); `;
        formula += `${valueAddress} <= 0; `;
        break;
      case 'dp':
        formula += `REGEXMATCH(${tagsAddress}; "#dp"); `;
        formula += `${valueAddress} >= 0; `;
        break;
      case 'trf+':
        formula += `REGEXMATCH(${tagsAddress}; "#trf"); `;
        formula += `${valueAddress} >= 0; `;
        break;
      case 'trf-':
        formula += `REGEXMATCH(${tagsAddress}; "#trf"); `;
        formula += `${valueAddress} < 0; `;
        break;
      default:
        throw new Error('Invalid tag.');
    }

    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${accs}; ${bsblank}; 1); ${regex})`;

    return [
      `IFERROR(SUM(FILTER(${valueAddress}; ${formula})); 0)`,
      `COUNTA(IFNA(FILTER(${tagsAddress}; ${formula}); ))`
    ];
  }
}

class FormulaBuildBackstageCards {
  static load_ () {
    this._settings = SettingsSpreadsheet.getAll();
  }

  static credit (numRows, mm, regex, bsblank) {
    const month = Consts.month_name.short[mm]
    const card = RangeUtils.rollA1Notation(6, 2, numRows);
    const value = RangeUtils.rollA1Notation(6, 5, numRows);

    let formula;

    formula = `ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1); ';
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += `NOT(ISBLANK(ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1))); ';
    formula += `ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1) >= 0';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static expenses (numRows, mm, regex, bsblank) {
    const month = Consts.month_name.short[mm]
    const card = RangeUtils.rollA1Notation(6, 2, numRows);
    const value = RangeUtils.rollA1Notation(6, 5, numRows);

    let formula;

    formula = `ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1); ';
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += `NOT(ISBLANK(ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1))); ';
    formula += `ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1) < 0';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static expensesIgn (numRows, mm, regex, bsblank) {
    const month = Consts.month_name.short[mm]
    const card = RangeUtils.rollA1Notation(6, 2, numRows);
    const value = RangeUtils.rollA1Notation(6, 5, numRows);
    const ign = RangeUtils.rollA1Notation(6, 7, numRows, 1);

    let formula;

    formula = `ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1); ';
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += `NOT(ISBLANK(ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1))); ';
    formula += `ARRAY_CONSTRAIN(${month}!` + value + '; ' + bsblank + '; 1) < 0; ';
    formula += `NOT(ARRAY_CONSTRAIN(${month}!` + ign + '; ' + bsblank + '; 1))';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static bscardpart (numRows, mm, regex, bsblank) {
    this.load_();

    const transaction = RangeUtils.rollA1Notation(6, 2 + 6 * mm, numRows);
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);
    const tags = RangeUtils.rollA1Notation(6, 5 + 6 * mm, numRows);

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
  }

  static cardDue (numRows, mm, regex, bsblank) {
    this.load_();

    const month = Consts.month_name.short[mm]
    const transaction = RangeUtils.rollA1Notation(6, 4, numRows);
    const card = RangeUtils.rollA1Notation(6, 2, numRows);
    const value = RangeUtils.rollA1Notation(6, 5, numRows);

    const dec_s = this._settings.decimal_separator ? ',' : '\\';

    let formula;

    formula = `REGEXEXTRACT(ARRAY_CONSTRAIN(${month}!${transaction}; ${bsblank}; 1); "[0-9]+/[0-9]+")`;
    formula = `ARRAYFORMULA(SPLIT(${formula}; "/"))`;

    formula = `{${formula}${dec_s} ARRAY_CONSTRAIN(${month}!${value}; ${bsblank}; 1)}; `;
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!${card}; ${bsblank}; 1); ${regex}); `;
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!${transaction}; ${bsblank}; 1); "[0-9]+/[0-9]+"); `;
    formula += `NOT(REGEXMATCH(ARRAY_CONSTRAIN(${month}!${transaction}; ${bsblank}; 1); "[^0-9\\s][0-9]+/[0-9]+"))`;

    formula = `QUERY(FILTER(${formula}); "SELECT (Col2 - Col1) * Col3 WHERE Col1 < Col2 LABEL (Col2 - Col1) * Col3 ''")`
    formula = `IF(${regex} = ""; 0; SUM(IFNA(${formula}; 0)))`;

    return formula;
  }

  static bsblank (numRows, mm) {
    const header = RangeUtils.rollA1Notation(6, 4 + 6 * mm);
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + '); ROW(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + ') - ROW(Cards!' + header + '); FALSE)); ROWS(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + '))';
  }
}

class FormulaBuildBackstageWallet {
  static income (mm, value, tags, numRows, bsblank) {
    const month = Consts.month_name.short[mm]
    const wall = RangeUtils.rollA1Notation(6, 2, numRows);

    let formula

    formula = `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${tags}; ${bsblank}; 1)`
    formula = `REGEXMATCH(${formula}; "#inc"); `
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + wall + '; ' + bsblank + '; 1); B1); ';
    formula += `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1) >= 0`

    formula = `FILTER(ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1); ${formula})`
    formula = `IFERROR(SUM(${formula}); 0)`

    return formula
  }

  static bsblank (mm, numRows) {
    const header = 'E5'; // RangeUtils.rollA1Notation(4, 5);
    const value = RangeUtils.rollA1Notation(6, 5, numRows)

    return 'MIN(ARRAYFORMULA(IF(ISBLANK(' + Consts.month_name.short[mm] + '!' + value + '); ROW(' + Consts.month_name.short[mm] + '!' + value + ') - ROW(' + Consts.month_name.short[mm] + '!' + header + '); FALSE)); ROWS(' + Consts.month_name.short[mm] + '!' + value + '))';
  }

  static expensesIgn (numRows, mm, bsblank) {
    const month = Consts.month_name.short[mm]
    const wall = RangeUtils.rollA1Notation(6, 2, numRows);
    const value = RangeUtils.rollA1Notation(6, 5, numRows, 1);
    const ign = RangeUtils.rollA1Notation(6, 7, numRows, 1);

    let formula;

    formula = 'NOT(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + ign + '; ' + bsblank + '; 1)); ';
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(${month}!` + wall + '; ' + bsblank + '; 1); B1); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1)))';
    formula = 'FILTER(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = 'SUM(IFERROR(' + formula + '; 0))';

    return formula;
  }
}
