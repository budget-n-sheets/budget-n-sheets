/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class PickerService extends Pushback {
  constructor (uuid) {
    const protocol = SessionService.withUser()
      .getSession(uuid)
      .getContext('addon-setup-service')
      .getProperty('protocol')

    super()
    this._protocol = protocol
    this._session.setProperty('callbackUuid', uuid)
  }

  setFallbackFunction (fallbackFunctionName) {
    this._fallbackFunction = fallbackFunctionName
    return this
  }

  showDialog (title) {
    this.config_()

    if (!this._fallbackFunction) throw new Error('Undefined fallback.')
    this._session.setProperty('fallbackFunction', this._fallbackFunction)

    const htmlOutput = HtmlService2.createTemplateFromFile('Picker/htmlPickerDialog')
      .setScriptletValues({
        locale: Session.getActiveUserLocale(),
        devKey: Bs.getDeveloperKey(),
        uuid: this._uuid,
        protocol: this._protocol
      })
      .evaluate()
      .setWidth(617)
      .setHeight(487)

    SpreadsheetApp2.getUi().showModalDialog(htmlOutput, title)
  }
}
