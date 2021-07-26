class SettingsSidebar extends HtmlTemplate2 {
  constructor () {
    const htmlTemplate = HtmlService.createTemplateFromFile('settings/sidebar/htmlSidebar');
    super(htmlTemplate);
  }

  assignFeatureFlag_ () {
    this.htmlTemplate.settings_backup = FeatureFlag.getStatusOf('settings/backup');
  }

  loadPanels_ () {
    this.loadPanelSettings_();
    this.loadPanelMaintenance_();
    this.loadPanelBackup_();
  }

  loadPanelSettings_ () {
    const panelSettings = new SettingsSidebarPanelSettings();

    this.htmlTemplate.htmlPanelSettings = panelSettings.getHtmlContent();
    this.htmlTemplate.jsPanelSettings = panelSettings.getJsContent();
  }

  loadPanelMaintenance_ () {
    const panelMaintenance = new SettingsSidebarPanelMaintenance();

    this.htmlTemplate.htmlPanelMaintenance = panelMaintenance.getHtmlContent();
    this.htmlTemplate.jsPanelMaintenance = panelMaintenance.getJsContent();
  }

  loadPanelBackup_ () {
    const panelBackup = new SettingsSidebarPanelBackup();

    this.htmlTemplate.htmlPanelBackup = panelBackup.getHtmlContent();
    this.htmlTemplate.jsPanelBackup = panelBackup.getJsContent();
  }

  build () {
    this.loadPanels_();
    this.assignFeatureFlag_();
    return this.assignReservedHref().evaluate().setTitle('Settings');
  }
}
