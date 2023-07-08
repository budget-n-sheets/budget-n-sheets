/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ShadowService extends Pushback {
  constructor (uuid) {
    SessionService.withUser().getSession(uuid)

    super();
    this._session.setProperty('callbackUuid', uuid);
  }

  showDialog () {
    this.config_();

    const htmlOutput = HtmlService2.createTemplateFromFile('ShadowService/htmlShadowDialog')
      .setScriptletValues({ uuid: this._uuid })
      .evaluate()
      .setWidth(307)
      .setHeight(89);

    SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Enter password');
  }
}
