/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupNewDialog extends HtmlTemplate2 {
  constructor (uuid) {
    const htmlTemplate = HtmlService.createTemplateFromFile('setup/new/htmlSetupNew')
    super(htmlTemplate)

    const session = SessionService.withUser()
      .getSession(uuid)
      .getContext('addon-setup-service')

    if (session.getProperty('protocol') === 'none') session.setProperty('protocol', 'new')
    else throw new Error('Protocol is already defined.')

    this._uuid = uuid
  }

  build () {
    const scriptlets = {
      uuid: this._uuid
    }

    return this.setScriptletValues(HtmlResources.href.reserved)
      .setScriptletValues(scriptlets)
      .evaluate()
      .setWidth(353)
      .setHeight(359)
  }
}
