/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SettingsSidebarPanelSettings extends HtmlPanel {
  constructor () {
    const htmlTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/htmlPanelSettings')
    const jsTemplate = HtmlService2.createTemplateFromFile('settings/sidebar/jsPanelSettings')

    super(htmlTemplate, jsTemplate)
    this.loadScriptletValues_()
  }

  loadScriptletValues_ () {
    const scriptletValues = SettingsSidebarUtils.getScriptletValuesByPanel('settings')

    this._htmlTemplate.setScriptletValues(scriptletValues)
    this._jsTemplate.setScriptletValues(scriptletValues)
  }
}
