/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuilderCards {
  static header () {
    return FormulaBuilderCardsHeader;
  }
}

class FormulaBuilderCardsHeader {
  static load_ () {
    this._settings = SettingsSpreadsheet.getAll();
  }

  static index (card, headers) {
    let formula;

    formula = 'REGEXMATCH(_Backstage!' + headers + '; "\\^"&' + card + '&"\\$")';
    formula = 'FILTER(_Backstage!' + headers + '; ' + formula + ')';
    formula = 'INDEX(' + formula + '; 0; 1)';
    formula = 'IF(' + card + ' = "All"; 1; MATCH(' + formula + '; _Backstage!' + headers + '; 0))';
    formula = 'IFERROR((' + formula + ' - 1)/5; "")';

    return formula;
  }

  static availCredit (mm, reference) {
    const index = RangeUtils.rollA1Notation(2, 1 + 6 * mm);
    const select = RangeUtils.rollA1Notation(2, 2 + 6 * mm);

    let formula;

    formula = 'OFFSET(' + reference + '; 4; 1 + 5*' + index + '; 1; 1)';
    formula = 'TO_TEXT(' + formula + ')';
    formula = 'IF(' + select + ' = "All"; ""; ' + formula + ')';
    formula = 'CONCATENATE("AVAIL credit: "; ' + formula + ')';

    return formula;
  }

  static sparkline (index, card, reference) {
    this.load_();

    const dec_s = this._settings.decimal_separator ? ',' : '\\';

    let formula;

    const part_1 = 'MAX(0; OFFSET(' + reference + '; 4; 1 + 5*' + index + '; 1; 1))';
    const part_2 = 'OFFSET(' + reference + '; 1; 1 + 5*' + index + '; 1; 1)';
    const part_3 = '{"charttype"' + dec_s + '"bar"; "max"' + dec_s + 'OFFSET(' + reference + '; 0; 1 + 5*' + index + '; 1; 1); "color1"' + dec_s + '"#45818e"; "color2"' + dec_s + '"#e69138"}';

    formula = '{' + part_1 + dec_s + part_2 + '}; ' + part_3;
    formula = 'IF(' + card + ' = "All"; ""; SPARKLINE(' + formula + '))';

    return formula;
  }

  static report (index, reference) {
    let part_1, part_2, part_3;

    part_1 = 'OFFSET(' + reference + '; 1; 5*' + index + '; 1; 1)';
    part_1 = '"Credit: "; TO_TEXT(' + part_1 + '); "\n"; ';

    part_2 = 'OFFSET(' + reference + '; 3; 5*' + index + '; 1; 1)';
    part_2 = '"Expenses: "; TO_TEXT(' + part_2 + '); "\n"; ';

    part_3 = 'OFFSET(' + reference + '; 4; 5*' + index + '; 1; 1)';
    part_3 = '"Balance: "; TO_TEXT(' + part_3 + ')';

    return 'CONCATENATE(' + part_1 + part_2 + '"\n"; ' + part_3 + ')';
  }
}
