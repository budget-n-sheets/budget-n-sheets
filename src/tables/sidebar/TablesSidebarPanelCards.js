class TablesSidebarPanelCards extends TablesSidebarPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('tables/sidebar/htmlPanelCards');
    const jsTemplate = HtmlService2.createTemplateFromFile('tables/sidebar/jsPanelCards');

    super(htmlTemplate, jsTemplate);
  }
}
