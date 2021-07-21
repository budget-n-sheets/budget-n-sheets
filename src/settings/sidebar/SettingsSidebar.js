class SettingsSidebar extends HtmlTemplate2 {
  constructor () {
    const htmlTemplate = HtmlService.createTemplateFromFile('settings/sidebar/htmlSidebar');
    super(htmlTemplate);
  }

  assignFeatureFlag_ () {
    this._htmlTemplate.settings_backup = getFeatureFlagStatus_('settings/backup');
  }

  loadPanels_ () {
    this.loadPanelSettings_();
    this.loadPanelMaintenance_();
    this.loadPanelBackup_();
  }

  loadPanelSettings_ () {
    const panelSettings = new SettingsSidebarPanelSettings();

    this._htmlTemplate.htmlPanelSettings = panelSettings.getHtmlContent();
    this._htmlTemplate.jsPanelSettings = panelSettings.getJsContent();
  }

  loadPanelMaintenance_ () {
    const panelMaintenance = new SettingsSidebarPanelMaintenance();

    this._htmlTemplate.htmlPanelMaintenance = panelMaintenance.getHtmlContent();
    this._htmlTemplate.jsPanelMaintenance = panelMaintenance.getJsContent();
  }

  loadPanelBackup_ () {
    const panelBackup = new SettingsSidebarPanelBackup();

    this._htmlTemplate.htmlPanelBackup = panelBackup.getHtmlContent();
    this._htmlTemplate.jsPanelBackup = panelBackup.getJsContent();
  }

  build () {
    this.loadPanels_();
    this.assignFeatureFlag_();
    return this.evaluate().setTitle('Settings');
  }
}
