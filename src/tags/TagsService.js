/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TagsService {
  static getCategories () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Tags')
    if (!sheet) return Consts.tags_categories
    if (sheet.getMaxRows() < 2) return Consts.tags_categories

    let categories = sheet.getRange('B2:B').getValues().map(r => r[0]).filter(v => v)

    const validations = sheet.getRange('B2:B').getDataValidations().map(r => r[0]).filter(v => v)
    for (const validation of validations) {
      if (validation.getCriteriaType() !== SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) continue
      const values = validation.getCriteriaValues()[0]
      if (values.length === 0) continue
      categories = values.concat(categories)
      break
    }

    categories = categories.filter((v, i, s) => s.indexOf(v) === i)

    return categories.length > 0 ? categories : Consts.tags_categories
  }

  static listTags () { // experimental
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Tags')
    if (!sheet) return {}
    if (sheet.getMaxRows() < 2) return {}

    const list = {}
    sheet.getRange('A2:S')
      .getValues()
      .filter(r => /^\w+$/.test(r[4]))
      .forEach(r => {
        if (list[r[4]]) return
        const tag = r[4]
        list[tag] = {
          name: r[0],
          category: r[1],
          description: r[2],
          analytics: !!r[3],
          months: r.slice(6, 17),
          average: +r[17],
          total: +r[18]
        }
      })

    return list
  }

  static setCategories (categories) {
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Tags')
    if (!sheet) throw new Error('TagsService: setCategories(): Missing sheet Tags.')

    categories = categories.map(c => c.trim().replace(/\s+/g, ' ').slice(0, 64)).filter((v, i, s) => v && s.indexOf(v) === i)
    if (categories.length < 1) categories = ['Other']

    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(categories, true)
      .setAllowInvalid(true)
      .build()

    sheet.getRange('B2:B')
      .clearDataValidations()
      .setDataValidation(rule)

    SpreadsheetApp.flush()
  }
}
