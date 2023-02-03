/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class PickerService extends Pushback {
  constructor (uuid) {
    SessionService.getSession(uuid)

    super();
    this._session.setProperty('callbackUuid', uuid);
  }

  setFallbackFunction (fallbackFunctionName) {
    this._fallbackFunction = fallbackFunctionName;
    return this;
  }

  showDialog (protocol, title) {
    this.config_();

    if (!this._fallbackFunction) throw new Error('Undefined fallback.');
    this._session.setProperty('fallbackFunction', this._fallbackFunction);

    const htmlOutput = HtmlService2.createTemplateFromFile('Picker/htmlPickerDialog')
      .setScriptletValues({
        locale: Session.getActiveUserLocale(),
        devKey: Bs.getDeveloperKey(),
        uuid: this._uuid,
        protocol: protocol
      })
      .evaluate()
      .setWidth(617)
      .setHeight(487);

    SpreadsheetApp2.getUi().showModalDialog(htmlOutput, title);
  }
}
