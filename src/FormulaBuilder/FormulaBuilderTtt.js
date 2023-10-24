/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuilderTtt {
  static header () {
    return FormulaBuilderTttHeader;
  }
}

class FormulaBuilderTttHeader {
  static balance (mm) {
    let formula, accBalance, availCredit

    accBalance = `OFFSET('_Backstage'!B3; ${TABLE_DIMENSION.height} * ${mm}; ${TABLE_DIMENSION.width} * G1)`
    accBalance = `CONCAT("Balance "; TO_TEXT(${accBalance}))`

    availCredit = `OFFSET('_Backstage'!C6; ${TABLE_DIMENSION.height} * ${mm}; ${TABLE_DIMENSION.width} * G1)`
    availCredit = `CONCAT("AVAIL credit "; TO_TEXT(${availCredit}))`

    formula = `IF(G2; ${availCredit}; ${accBalance})`
    formula = `IF(G1 > 0; ${formula}; " ")`

    return formula
  }

  static expenses (mm) {
    return `CONCAT("Expenses "; TO_TEXT(OFFSET('_Backstage'!B4; ${TABLE_DIMENSION.height} * ${mm}; ${TABLE_DIMENSION.width} * G1)))`;
  }

  static index (numAccs) {
    const _w = TABLE_DIMENSION.width
    const header = `'_Backstage'!${RangeUtils.rollA1Notation(1, 2, 1, _w + _w * numAccs + _w * 11)}`

    let formula

    formula = `FILTER(${header}; REGEXMATCH(${header}; "\\^"&B1&"\\$"))`
    formula = `MATCH(${formula}; ${header}; 0)`
    formula = `IFNA((${formula} - 1) / 5; 0)`

    return formula
  }

  static report (index, mm) {
    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    let part_1, part_2, part_3, part_4;

    part_1 = 'TO_TEXT(_Backstage!' + RangeUtils.rollA1Notation(2 + _h * mm, 8 + _w * index) + ')';
    part_1 = '"Withdrawal: ["; _Backstage!' + RangeUtils.rollA1Notation(2 + _h * mm, 9 + _w * index) + '; "] "; ' + part_1 + '; "\n"; ';

    part_2 = 'TO_TEXT(_Backstage!' + RangeUtils.rollA1Notation(3 + _h * mm, 8 + _w * index) + ')';
    part_2 = '"Deposit: ["; _Backstage!' + RangeUtils.rollA1Notation(3 + _h * mm, 9 + _w * index) + '; "] "; ' + part_2 + '; "\n"; ';

    part_3 = 'TO_TEXT(_Backstage!' + RangeUtils.rollA1Notation(4 + _h * mm, 8 + _w * index) + ')';
    part_3 = '"Trf. in: ["; _Backstage!' + RangeUtils.rollA1Notation(4 + _h * mm, 9 + _w * index) + '; "] "; ' + part_3 + '; "\n"; ';

    part_4 = 'TO_TEXT(_Backstage!' + RangeUtils.rollA1Notation(5 + _h * mm, 8 + _w * index) + ')';
    part_4 = '"Trf. out: ["; _Backstage!' + RangeUtils.rollA1Notation(5 + _h * mm, 9 + _w * index) + '; "] "; ' + part_4;

    return 'CONCATENATE(' + part_1 + part_2 + part_3 + part_4 + ')';
  }
}
