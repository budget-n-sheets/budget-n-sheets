class CoolGalleryService {
  static getCoolTemplate (id) {
    const ui = SpreadsheetApp2.getUi();
    const cool = CoolGallery.getById(id);

    if (!cool.isAvailable()) {
      ui.alert(
        "Can't import analytics page",
        'Something went wrong. Try again later.',
        ui.ButtonSet.OK);
      return;
    }

    if (cool.isInstalled()) {
      const response = ui.alert(
        cool.getName() + ' already exists',
        'Do you want to replace it?',
        ui.ButtonSet.YES_NO);

      if (response !== ui.Button.YES) return;
    }

    cool.deleteTemplate().copyTemplate();
    cool.makeConfig().build();
    cool.flush();
  }
}
