/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SheetUniqueFormulas {
  static getTttTags_ () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Tags');
    if (!sheet) return '';
    const num = sheet.getMaxRows() - 1;
    if (num < 1) return '';

    const ref = 'Tags!' + RangeUtils.rollA1Notation(2, 5, num, 1);

    let ranges = '';
    let n = 0;

    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i]);
      if (!sheet) continue;

      const num = sheet.getMaxRows() - 5;
      if (num < 1) continue;

      n++;

      ranges += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(6, 6, num, 1) + '; ';
    }

    if (n === 0) return '';
    ranges = '{' + ranges.slice(0, -2) + '}';

    let formula = 'IFNA(FILTER(' + ref + '; REGEXMATCH(' + ref + '; "^\\w+$")); )';
    formula = 'SORT({TRIM(CONCAT("#"; ' + formula + ')); "#dp"; "#wd"; "#qcc"; "#inc"; "#trf"})';
    formula = 'SORT(TRIM(' + ranges + ')); ' + formula;

    return 'UNIQUE({' + formula + '})';
  }

  static getTttTransaction_ () {
    let ranges = '';
    let n = 0

    for (let i = 0; i < 12; i++) {
      const sheet = SpreadsheetApp2.getActive().getSheetByName(Consts.month_name.short[i]);
      if (!sheet) continue;
      const num = sheet.getMaxRows() - 5;
      if (num < 1) continue;

      n++;

      ranges += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(6, 4, num, 1) + '; ';
    }

    if (n === 0) return '';

    ranges = '{' + ranges.slice(0, -2) + '}';

    let formula = 'IFNA(FILTER(' + ranges + '; NOT(REGEXMATCH(' + ranges + '; "[0-9]+/[0-9]+"))); ); ';
    formula += 'REGEXREPLACE(IFNA(FILTER(' + ranges + '; REGEXMATCH(' + ranges + '; "[0-9]+/[0-9]+")); ); "[0-9]+/[0-9]+"; "")';
    formula = 'SORT(TRIM({' + formula + '})); ';

    formula += 'SORT(TRIM(IFNA(FILTER(' + ranges + '; REGEXMATCH(' + ranges + '; "[0-9]+/[0-9]+")); )))';
    formula = 'UNIQUE({' + formula + '})';

    return formula;
  }
}
