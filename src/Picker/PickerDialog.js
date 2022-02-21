class PickerDialog extends HtmlTemplate2 {
  constructor (uuid) {
    const htmlTemplate = HtmlService.createTemplateFromFile('Picker/htmlPickerRestore');
    super(htmlTemplate);

    this.uuid = uuid;
  }

  build (topic) {
    const isRestore = (topic === 'restore');
    const title = (isRestore ? 'Select backup' : 'Select spreadsheet');

    const devKey = Bs.getDeveloperKey();
    if (devKey === 1) return;

    return this.setScriptletValues(
      {
        picker_key: devKey,
        isRestore: isRestore,
        uuid: this.uuid
      })
      .evaluate()
      .setWidth(617)
      .setHeight(487)
      .setTitle(title);
  }
}
