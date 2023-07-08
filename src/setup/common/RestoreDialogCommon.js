/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RestoreDialogCommon extends HtmlPanel {
  constructor (protocol) {
    const htmlTemplate = HtmlService2.createTemplateFromFile('setup/common/htmlCommonDialog');
    const jsTemplate = HtmlService2.createTemplateFromFile('setup/common/jsCommonDialog');

    super(htmlTemplate, jsTemplate);
    this.loadScriptletValues_(protocol);
  }

  loadScriptletValues_ (protocol) {
    this._htmlTemplate.setScriptletValues({
      location: (protocol === 'copy' ? 'spreadsheet' : 'backup')
    });
  }
}
