class RestoreDialogCommon extends HtmlPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('setup/restore/dialog/htmlRestoreDialogCommon');
    const jsTemplate = HtmlService2.createTemplateFromFile('setup/restore/dialog/jsRestoreDialogCommon');

    super(htmlTemplate, jsTemplate);
  }
}
