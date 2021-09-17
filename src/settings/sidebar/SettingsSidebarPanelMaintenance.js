class SettingsSidebarPanelMaintenance extends HtmlPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/htmlPanelMaintenance');
    const jsTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/jsPanelMaintenance');

    super(htmlTemplate, jsTemplate);
  }
}
