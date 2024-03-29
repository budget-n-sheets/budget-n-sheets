/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
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
  static balance (mm, value, balance, bsblank) {
    let formula;

    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1)))';
    formula = 'FILTER(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = balance + ' + IFERROR(SUM(' + formula + '); 0)';

    return formula;
  }

  static income (mm, value, tags, bsblank) {
    let formula;

    formula = `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${tags}; ${bsblank}; 1)`;
    formula = `REGEXMATCH(${formula}; "#(rct|inc)"); `;
    formula += `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1) >= 0`;

    formula = `FILTER(ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1); ${formula})`;
    formula = `IFERROR(SUM(${formula}); 0)`;

    return formula;
  }

  static expensesIgn (mm, value, tags, bsblank) {
    let formula;

    formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + tags + '; ' + bsblank + '; 1); "#(dp|wd|qcc|ign|rct|inc|trf)"))';
    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1))); ' + formula;
    formula = 'FILTER(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = 'IFERROR(SUM(' + formula + '); 0)';

    return formula;
  }

  static bsblank (mm, header, value) {
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(' + Consts.month_name.short[mm] + '!' + value + '); ROW(' + Consts.month_name.short[mm] + '!' + value + ') - ROW(' + Consts.month_name.short[mm] + '!' + header + '); FALSE)); ROWS(' + Consts.month_name.short[mm] + '!' + value + '))';
  }

  static reportTag (tag, mm, value, tags, bsblank) {
    const valueAddress = `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${value}; ${bsblank}; 1)`;
    const tagsAddress = `ARRAY_CONSTRAIN(${Consts.month_name.short[mm]}!${tags}; ${bsblank}; 1)`;

    let formula = '';

    switch (tag) {
      case 'wd':
        formula += `REGEXMATCH(${tagsAddress}; "#wd"); `;
        formula += `${valueAddress} <= 0`;
        break;
      case 'dp':
        formula += `REGEXMATCH(${tagsAddress}; "#dp"); `;
        formula += `${valueAddress} >= 0`;
        break;
      case 'trf+':
        formula += `REGEXMATCH(${tagsAddress}; "#trf"); `;
        formula += `${valueAddress} >= 0`;
        break;
      case 'trf-':
        formula += `REGEXMATCH(${tagsAddress}; "#trf"); `;
        formula += `${valueAddress} < 0`;
        break;
      default:
        throw new Error('Invalid tag.');
    }

    return [
      `IFERROR(SUM(FILTER(${valueAddress}; ${formula})); 0)`,
      `COUNTA(IFNA(FILTER(${tagsAddress}; ${formula}); 0))`
    ];
  }
}

class FormulaBuildBackstageCards {
  static load_ () {
    this._settings = SettingsSpreadsheet.getAll();
  }

  static credit (numRows, mm, regex, bsblank) {
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);

    let formula;

    formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
    formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) >= 0';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static expenses (numRows, mm, regex, bsblank) {
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);

    let formula;

    formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
    formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) < 0';

    formula = 'SUM(FILTER(' + formula + '))';
    formula = 'IFERROR(IF(' + regex + ' = ""; ""; ' + formula + '); 0)';

    return formula;
  }

  static expensesIgn (numRows, mm, regex, bsblank) {
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);
    const tags = RangeUtils.rollA1Notation(6, 5 + 6 * mm, numRows);

    let formula;

    formula = 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1); ';
    formula += 'REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + card + '; ' + bsblank + '; 1); ' + regex + '); ';
    formula += 'NOT(ISBLANK(ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1))); ';
    formula += 'ARRAY_CONSTRAIN(Cards!' + value + '; ' + bsblank + '; 1) < 0; ';
    formula += 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(Cards!' + tags + '; ' + bsblank + '; 1); "#ign"))';

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

    const transaction = RangeUtils.rollA1Notation(6, 2 + 6 * mm, numRows);
    const card = RangeUtils.rollA1Notation(6, 3 + 6 * mm, numRows);
    const value = RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows);

    const dec_s = this._settings.decimal_separator ? ',' : '\\';

    let formula;

    formula = `REGEXEXTRACT(ARRAY_CONSTRAIN(Cards!${transaction}; ${bsblank}; 1); "[0-9]+/[0-9]+")`;
    formula = `ARRAYFORMULA(SPLIT(${formula}; "/"))`;

    formula = `{${formula}${dec_s} ARRAY_CONSTRAIN(Cards!${value}; ${bsblank}; 1)}; `;
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(Cards!${card}; ${bsblank}; 1); ${regex}); `;
    formula += `REGEXMATCH(ARRAY_CONSTRAIN(Cards!${transaction}; ${bsblank}; 1); "[0-9]+/[0-9]+"); `;
    formula += `NOT(REGEXMATCH(ARRAY_CONSTRAIN(Cards!${transaction}; ${bsblank}; 1); "[^0-9\\s][0-9]+/[0-9]+"))`;

    formula = `QUERY(FILTER(${formula}); "SELECT (Col2 - Col1) * Col3 WHERE Col1 < Col2 LABEL (Col2 - Col1) * Col3 ''")`
    formula = `IF(${regex} = ""; 0; SUM(IFNA(${formula}; 0)))`;

    return formula;
  }

  static bsblank (numRows, mm) {
    const header = RangeUtils.rollA1Notation(5, 4 + 6 * mm);
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + '); ROW(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + ') - ROW(Cards!' + header + '); FALSE)); ROWS(Cards!' + RangeUtils.rollA1Notation(6, 4 + 6 * mm, numRows, 1) + '))';
  }
}

class FormulaBuildBackstageWallet {
  static bsblank (mm, value) {
    const header = 'C4'; // RangeUtils.rollA1Notation(4, 3);
    return 'MIN(ARRAYFORMULA(IF(ISBLANK(' + Consts.month_name.short[mm] + '!' + value + '); ROW(' + Consts.month_name.short[mm] + '!' + value + ') - ROW(' + Consts.month_name.short[mm] + '!' + header + '); FALSE)); ROWS(' + Consts.month_name.short[mm] + '!' + value + '))';
  }

  static expensesIgn (numRows, mm, bsblank) {
    const value = RangeUtils.rollA1Notation(5, 3, numRows, 1);
    const tags = RangeUtils.rollA1Notation(5, 4, numRows, 1);

    let formula;

    formula = 'NOT(REGEXMATCH(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + tags + '; ' + bsblank + '; 1); "#ign"))';
    formula = 'NOT(ISBLANK(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1))); ' + formula;
    formula = 'FILTER(ARRAY_CONSTRAIN(' + Consts.month_name.short[mm] + '!' + value + '; ' + bsblank + '; 1); ' + formula + ')';
    formula = 'SUM(IFERROR(' + formula + '; 0))';

    return formula;
  }
}
