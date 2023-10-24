/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TablesSidebar extends HtmlTemplate2 {
  constructor () {
    const htmlTemplate = HtmlService.createTemplateFromFile('tables/sidebar/htmlSidebar')
    super(htmlTemplate)
  }

  loadPanels_ () {
    this.loadPanelAccounts_()
    this.loadPanelCards_()
  }

  loadPanelAccounts_ () {
    const panelAccounts = new TablesSidebarPanelAccounts()

    this.htmlTemplate.htmlPanelAccounts = panelAccounts.getHtmlContent()
    this.htmlTemplate.jsPanelAccounts = panelAccounts.getJsContent()
  }

  loadPanelCards_ () {
    const panelCards = new TablesSidebarPanelCards()

    this.htmlTemplate.htmlPanelCards = panelCards.getHtmlContent()
    this.htmlTemplate.jsPanelCards = panelCards.getJsContent()
  }

  loadScriptletValues_ () {
    const dec_s = SettingsSpreadsheet.get('decimal_separator')

    const scriptlet = {
      decimal_places: SettingsSpreadsheet.get('decimal_places'),
      dec_s: (dec_s ? '.' : ','),
      dec_t: (dec_s ? ',' : '.')
    }

    this.setScriptletValues(scriptlet)
  }

  build () {
    this.loadPanels_()
    this.loadScriptletValues_()

    return this.setScriptletValues(HtmlResources.href.reserved).evaluate().setTitle('Accounts & Cards')
  }
}
