/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuilder {
  static backstage () {
    return FormulaBuilderBackstage;
  }

  static cards () {
    return FormulaBuilderCards;
  }

  static settings () {
    return FormulaBuilderSettings;
  }

  static summary () {
    return FormulaBuilderSummary;
  }

  static tags () {
    return FormulaBuilderTags;
  }

  static ttt () {
    return FormulaBuilderTtt;
  }
}
