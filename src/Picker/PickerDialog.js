class PickerDialog extends HtmlTemplate2 {
  constructor (uuid, topic) {
    if (!SessionService.hasSession(uuid)) throw new Error('Session expired.');

    const htmlTemplate = HtmlService.createTemplateFromFile('Picker/htmlPickerDialog');
    super(htmlTemplate);

    this._devKey = Bs.getDeveloperKey();
    this._uuid = uuid;
    this.topic = topic;
  }

  build () {
    return this.setScriptletValues(
      {
        devKey: this._devKey,
        uuid: this._uuid,
        topic: this.topic
      })
      .evaluate()
      .setWidth(617)
      .setHeight(487);
  }
}
