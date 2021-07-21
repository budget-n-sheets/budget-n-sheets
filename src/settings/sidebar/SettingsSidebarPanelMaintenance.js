class SettingsSidebarPanelMaintenance extends SettingsSidebarPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/htmlPanelMaintenance');
    const jsTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/jsPanelMaintenance');

    super(htmlTemplate, jsTemplate);
    this.loadScriptletValues_();
  }

  loadScriptletValues_ () {
    const scriptletValues = new SettingsSidebarUtils().getScriptletValuesByPanel('maintenance');

    this._htmlTemplate.setScriptletValues(scriptletValues);
    this._jsTemplate.setScriptletValues(scriptletValues);
  }
}
