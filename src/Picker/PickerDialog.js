class PickerDialog extends HtmlTemplate2 {
  constructor (uuid) {
    const htmlTemplate = HtmlService.createTemplateFromFile('Picker/htmlPickerRestore');
    super(htmlTemplate);

    this.uuid = uuid;
  }

  build (topic) {
    const devKey = Bs.getDeveloperKey();

    const isRestore = (topic === 'restore');
    const title = (isRestore ? 'Select backup' : 'Select spreadsheet');

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
