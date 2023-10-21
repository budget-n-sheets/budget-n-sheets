/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class MakeSheet extends MirrorSheet {
  constructor (name, depends = [], template = {}) {
    Object.assign(template, { id: Info.template.id })
    super(name, depends, template)
  }

  static pickByName (name) {
    const mm = Consts.month_name.short.indexOf(name)
    if (mm > -1) return new MakeSheetTTT(name)

    switch (name) {
      case '_Backstage':
        return new MakeSheetBackstage()
      case 'Cash Flow':
        return new MakeSheetCashFlow()
      case '_Settings':
        return new MakeSheetSettings()
      case 'Summary':
        return new MakeSheetSummary()
      case 'Tags':
        return new MakeSheetTags()
      case '_Unique':
        return new MakeSheetUnique()

      default:
        throw new Error('Make sheet not found.')
    }
  }

  install (stack = []) {
    stack.push(this.name)
    if (!this.sheet) this.copyTemplate().unpack()

    const spreadsheet = SpreadsheetApp2.getActive()
    for (const name of this.depends) {
      if (stack.indexOf(name) > -1) continue
      if (spreadsheet.getSheetByName(name)) continue
      MakeSheet.pickByName(name).install(stack)
    }

    this.make()
  }
}
