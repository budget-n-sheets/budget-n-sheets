class SetupRestoreCommon extends HtmlPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('setup/restore/dialog/htmlSetupRestoreCommon');
    const jsTemplate = HtmlService2.createTemplateFromFile('setup/restore/dialog/jsSetupRestoreCommon');

    super(htmlTemplate, jsTemplate);
  }
}
