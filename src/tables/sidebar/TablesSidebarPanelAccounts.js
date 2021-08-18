class TablesSidebarPanelAccounts extends TablesSidebarPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('tables/sidebar/htmlPanelAccounts');
    const jsTemplate = HtmlService2.createTemplateFromFile('tables/sidebar/jsPanelAccounts');

    super(htmlTemplate, jsTemplate);
  }
}
