/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class SetupCopyDialog extends RestoreDialog {
  constructor (uuid) {
    super('copy', uuid, 'setup/copy/htmlSetupCopy')
  }

  evalStatus_ (status) {
    switch (status) {
      case 1:
        this._scriptlet.status_msg = 'Sorry, it was not possible to verify the spreadsheet.'
        break
      case 2:
        this._scriptlet.status_msg = 'No spreadsheet with the given ID could be found, or you do not have permission to access it.'
        break

      default:
        this._scriptlet.status_msg = 'Sorry, something went wrong. Try again in a moment.'
        break
    }
  }
}
