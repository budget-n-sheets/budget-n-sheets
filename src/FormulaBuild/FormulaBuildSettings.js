/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class FormulaBuildSettings {
  static formulas () {
    return FormulaBuildSettingsFormulas;
  }
}

class FormulaBuildSettingsFormulas {
  static actualMonth () {
    return 'IF(YEAR(TODAY()) = $B2; MONTH(TODAY()); IF(YEAR(TODAY()) < $B2; 0; 12))';
  }

  static activeMonths () {
    return 'IF($B4 > $B3; 0; $B3 - $B4 + 1)';
  }

  static mFactor () {
    return 'IF(AND($B3 = 12; YEAR(TODAY()) <> $B2); $B5; MAX($B5 - 1; 0))';
  }

  static countTags () {
    return '=COUNTIF(Tags!$E1:$E; "<>") - 1';
  }
}
