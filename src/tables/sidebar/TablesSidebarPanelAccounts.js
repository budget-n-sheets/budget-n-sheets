/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class TablesSidebarPanelAccounts extends HtmlPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('tables/sidebar/htmlPanelAccounts')
    const jsTemplate = HtmlService2.createTemplateFromFile('tables/sidebar/jsPanelAccounts')

    super(htmlTemplate, jsTemplate)
  }
}
