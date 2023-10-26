/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TagsDataUtils {
  static sliceBlankRow (values) {
    const bol = SheetTags.specs.boolSearch - 1
    return Utils.sliceBlankRow(values, bol)
  }

  static sliceBlankValue (values) {
    const nil = SheetTags.specs.nullSearch - 1
    return Utils.sliceBlankValue(values, nil)
  }
}
