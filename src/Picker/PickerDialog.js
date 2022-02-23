class PickerDialog extends HtmlTemplate2 {
  constructor (uuid) {
    const htmlTemplate = HtmlService.createTemplateFromFile('Picker/htmlPickerDialog');
    super(htmlTemplate);

    this.uuid = uuid;
    this.title = '';
  }

  build (topic) {
    const devKey = Bs.getDeveloperKey();

    switch (topic) {
      case 'copy':
        this.title = 'Select spreadsheet';
        break;
      case 'restore':
        this.title = 'Select backup';
        break;
    }

    return this.setScriptletValues(
      {
        picker_key: devKey,
        topic: topic,
        uuid: this.uuid
      })
      .evaluate()
      .setWidth(617)
      .setHeight(487)
      .setTitle(this.title);
  }
}
