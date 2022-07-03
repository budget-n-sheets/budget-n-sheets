class TagsService {
  static getCategories () {
    const sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) return Consts.tags_categories;
    if (sheet.getMaxRows() < 2) return Consts.tags_categories;

    let categories = sheet.getRange('B2:B').getValues().map(r => r[0]).filter(v => v);

    const validations = sheet.getRange('B2:B').getDataValidations().map(r => r[0]).filter(v => v);
    for (const validation of validations) {
      if (validation.getCriteriaType() !== SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) continue;
      const values = validation.getCriteriaValues()[0];
      if (values.length === 0) continue;
      categories = values.concat(categories);
      break;
    }

    categories = categories.filter((v, i, s) => s.indexOf(v) === i);

    return categories.length > 0 ? categories : Consts.tags_categories;
  }

  static setCategories (categories) {
    const sheet = Spreadsheet2.getSheetByName('Tags');
    if (!sheet) throw new Error('TagsService: setCategories(): Missing sheet Tags.');

    categories = categories.map(c => c.trim()).filter((v, i, s) => v && s.indexOf(v) === i);
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
