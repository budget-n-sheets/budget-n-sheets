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
