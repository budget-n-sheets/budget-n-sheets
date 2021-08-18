class SettingsSidebarPanelBackup extends HtmlPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/htmlPanelBackup');
    const jsTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/jsPanelBackup');

    super(htmlTemplate, jsTemplate);
  }
}
