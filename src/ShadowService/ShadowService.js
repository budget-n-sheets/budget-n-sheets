/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class ShadowService extends Pushback {
  constructor (uuid) {
    if (!SessionService.hasSession(uuid)) throw new Error('Session expired.');
    super();
    this._session.createContext(['callback', 'uuid'], uuid);
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
