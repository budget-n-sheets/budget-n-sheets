/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuild {
  static backstage () {
    return FormulaBuildBackstage;
  }

  static cards () {
    return FormulaBuildCards;
  }

  static settings () {
    return FormulaBuildSettings;
  }

  static summary () {
    return FormulaBuildSummary;
  }

  static tags () {
    return FormulaBuildTags;
  }

  static ttt () {
    return FormulaBuildTtt;
  }
}
