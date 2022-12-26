/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class QuickstartPl {
  static ay (name, num) {
    const demo = QuickstartDemo.pick(name);
    if (!demo) return;

    demo.makeConfig(num);

    if (demo.hasMissing()) {
      demo.alertSheetMissing();
      return;
    }

    if (!demo.isReady) return;

    demo.play(num);
    SpreadsheetApp3.getActive().toast('Done.', 'Quickstart');
  }
}
