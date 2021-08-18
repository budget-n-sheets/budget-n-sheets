class SettingsSidebarPanelSettings extends HtmlPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/htmlPanelSettings');
    const jsTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/jsPanelSettings');

    super(htmlTemplate, jsTemplate);
    this.loadScriptletValues_();
  }

  loadScriptletValues_ () {
    const scriptletValues = SettingsSidebarUtils.getScriptletValuesByPanel('settings');

    this._htmlTemplate.setScriptletValues(scriptletValues);
    this._jsTemplate.setScriptletValues(scriptletValues);
  }
}
