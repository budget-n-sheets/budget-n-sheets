class TagsService {
  static getCategories () {
    const sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) throw new Error('TagsService: getCategories(): Missing sheet Tags.');

    if (sheet.getMaxRows() < 2) return Consts.tags_categories;

    const categories = sheet.getRange('B2').getDataValidation()?.getCriteriaValues()[0] || Consts.tags_categories;
    return Array.isArray(categories) ? categories : Consts.tags_categories;
  }

  static setCategories (categories) {
    const sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) return;

    categories = categories.filter(c => c && c != null)
      .map(c => c.trim())
      .filter((v, i, s) => v && s.indexOf(v) === i);
    if (categories.length < 1) categories = ['Other'];

    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(categories, true)
      .setAllowInvalid(true)
      .build();

    sheet.getRange('B2:B')
      .clearDataValidations()
      .setDataValidation(rule);

    SpreadsheetApp.flush();
  }
}
