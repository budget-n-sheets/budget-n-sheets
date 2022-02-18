class SheetUniqueFormulas {
  static getCardsTags_ () {
    let sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) return '';
    let num = sheet.getMaxRows() - 1;
    if (num < 1) return '';

    const ref = 'Tags!' + RangeUtils.rollA1Notation(2, 5, num, 1);

    sheet = Spreadsheet2.getSheetByName('Cards');
    if (!sheet) return '';
    num = sheet.getMaxRows() - 5;
    if (num < 1) return '';

    let ranges = '';
    for (let i = 0; i < 12; i++) {
      ranges += 'Cards!' + RangeUtils.rollA1Notation(6, 5 + 6 * i, num, 1) + '; ';
    }
    ranges = '{' + ranges.slice(0, -2) + '}';

    let formula = 'IFNA(FILTER(' + ref + '; REGEXMATCH(' + ref + '; "^\\S+$")); )';
    formula = 'SORT({TRIM(CONCAT("#"; ' + formula + ')); "#wd"; "#ign"})';
    formula = 'SORT(TRIM(' + ranges + ')); ' + formula;

    return 'UNIQUE({' + formula + '})';
  }

  static getTttTags_ () {
    const sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) return '';
    const num = sheet.getMaxRows() - 1;
    if (num < 1) return '';

    const ref = 'Tags!' + RangeUtils.rollA1Notation(2, 5, num, 1);
    const num_acc = SettingsConst.getValueOf('number_accounts');

    let ranges = '';
    let n = 0;

    for (let i = 0; i < 12; i++) {
      const sheet = Spreadsheet2.getSheetByName(Consts.month_name.short[i]);
      if (!sheet) continue;

      const num = sheet.getMaxRows() - 4;
      if (num < 1) continue;

      n++;

      for (let k = 0; k <= num_acc; k++) {
        ranges += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 4 + 5 * k, num, 1) + '; ';
      }
    }

    if (n === 0) return '';
    ranges = '{' + ranges.slice(0, -2) + '}';

    let formula = 'IFNA(FILTER(' + ref + '; REGEXMATCH(' + ref + '; "^\\S+$")); )';
    formula = 'SORT({TRIM(CONCAT("#"; ' + formula + ')); "#dp"; "#wd"; "#qcc"; "#ign"; "#rct"; "#trf"})';
    formula = 'SORT(TRIM(' + ranges + ')); ' + formula;

    return 'UNIQUE({' + formula + '})';
  }

  static getCardsTransaction_ () {
    const sheet = Spreadsheet2.getSheetByName('Cards');
    if (!sheet) return '';

    const num = sheet.getMaxRows() - 5;
    if (num < 1) return '';

    let ranges = '';

    for (let i = 0; i < 12; i++) {
      ranges += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, num, 1) + '; ';
    }
    ranges = '{' + ranges.slice(0, -2) + '}';

    let formula = 'IFNA(FILTER(' + ranges + '; NOT(REGEXMATCH(' + ranges + '; "[0-9]+/[0-9]+"))); ); ';
    formula += 'REGEXREPLACE(IFNA(FILTER(' + ranges + '; REGEXMATCH(' + ranges + '; "[0-9]+/[0-9]+")); ); "[0-9]+/[0-9]+"; "")';
    formula = 'SORT(TRIM({' + formula + '})); ';

    formula += 'SORT(TRIM(IFNA(FILTER(' + ranges + '; REGEXMATCH(' + ranges + '; "[0-9]+/[0-9]+")); )))';
    formula = 'UNIQUE({' + formula + '})';

    return formula;
  }

  static getTttTransaction_ () {
    const num_acc = SettingsConst.getValueOf('number_accounts');

    let ranges = '';
    let n = 0;

    for (let i = 0; i < 12; i++) {
      const sheet = Spreadsheet2.getSheetByName(Consts.month_name.short[i]);
      if (!sheet) continue;

      const num = sheet.getMaxRows() - 4;
      if (num < 1) continue;

      n++;

      for (let k = 0; k <= num_acc; k++) {
        ranges += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 2 + 5 * k, num, 1) + '; ';
      }
    }

    if (n === 0) return '';
    return 'SORT(UNIQUE(TRIM({' + ranges.slice(0, -2) + '})))';
  }
}
