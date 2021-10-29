class RestoreDialogCommon extends HtmlPanel {
  constructor (protocol) {
    const htmlTemplate = HtmlService2.createTemplateFromFile('setup/common/htmlCommonDialog');
    const jsTemplate = HtmlService2.createTemplateFromFile('setup/common/jsCommonDialog');

    super(htmlTemplate, jsTemplate);
    this.loadScriptletValues_(protocol);
  }

  loadScriptletValues_ (protocol) {
    this._htmlTemplate.setScriptletValues({
      location: (protocol === 'copy' ? 'spreadsheet' : 'backup')
    });
  }
}
