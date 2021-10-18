class RestoreDialogCommon extends HtmlPanel {
  constructor (protocol) {
    const htmlTemplate = HtmlService2.createTemplateFromFile('setup/restore/dialog/htmlRestoreDialogCommon');
    const jsTemplate = HtmlService2.createTemplateFromFile('setup/restore/dialog/jsRestoreDialogCommon');

    super(htmlTemplate, jsTemplate);
    this.loadScriptletValues_(protocol);
  }

  loadScriptletValues_ (protocol) {
    this._htmlTemplate.setScriptletValues({
      location: (protocol === 'copy' ? 'spreadsheet' : 'backup')
    });
  }
}
