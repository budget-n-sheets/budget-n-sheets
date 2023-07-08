/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class HtmlPanel {
  constructor (htmlTemplate, jsTemplate) {
    this._htmlTemplate = htmlTemplate;
    this._jsTemplate = jsTemplate;
  }

  getHtmlContent () {
    return this._htmlTemplate.setScriptletValues(HtmlResources.href.reserved)
      .evaluate()
      .getContent();
  }

  getJsContent () {
    return this._jsTemplate.setScriptletValues(HtmlResources.href.reserved)
      .evaluate()
      .getContent();
  }
}
