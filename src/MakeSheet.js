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
    super(name, depends, template)
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
