/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class UpdateService {
  static showMessage_ (r) {
    const ui = SpreadsheetApp2.getUi()

    switch (r) {
      case 0:
        ui.alert(
          'Update successful',
          'The update process is complete!',
          ui.ButtonSet.OK)
        break
      case 1:
      case 2:
        ui.alert(
          'Update failed',
          'Something went wrong. Please, try again later.',
          ui.ButtonSet.OK)
        break

      default:
        onOpen()
        showDialogErrorMessage()
        break
    }
  }

  static updateScript_ () {
    const update = new UpdateScript().run()

    if (update.response === 0) {
      return 0
    }

    if (update.response === 2) {
      console.warn('Update: script: Failed at ', update.position)
    } else if (update.response > 2) {
      Addon.uninstall()
    }

    return update.response
  }

  static updateTemplate_ () {
    const update = new UpdateTemplate().run()

    if (update.response === 0) {
      return 0
    }

    if (update.response === 2) {
      console.warn('Update: template: Failed at ', update.position)
    } else if (update.response > 2) {
      Addon.uninstall()
    }

    return update.response
  }

  static checkAndUpdate (isOnline = false) {
    if (!Addon.isInstalled()) return 1
    if (Addon.isEndOfSupport()) {
      if (isOnline) {
        SpreadsheetApp2.getUi().alert(
          'End of Support',
          'This budget sheet is using a version that is no longer supported.',
          SpreadsheetApp2.getUi().ButtonSet.OK)
      }
      return 1
    }
    if (Addon.isUpToDate()) return 0

    isOnline = !!isOnline
    const ui = isOnline ? SpreadsheetApp2.getUi() : null

    if (!BnsTemplate.isAvailable()) {
      if (isOnline) {
        ui.alert(
          'New version available',
          'Please, re-open the spreadsheet to update the add-on.',
          ui.ButtonSet.OK)
      }
      return 1
    }

    if (!AddonUser.hasBaselinePermission()) {
      if (isOnline) {
        ui.alert(
          'Add-on update',
          'Please, contact the spreadsheet admin to update the add-on.',
          ui.ButtonSet.OK)
      }
      return 1
    }

    const lock = LockService.getDocumentLock()
    if (!lock.tryLock(200)) {
      if (isOnline) {
        ui.alert(
          "Can't update",
          'The add-on is busy. Try again in a moment.',
          ui.ButtonSet.OK)
      }
      return 1
    }

    if (isOnline) showDialogMessage('Add-on update', 'Updating the add-on...', true)

    if (SettingsSpreadsheet.get('spreadsheet_locale') !== SpreadsheetApp2.getActive().spreadsheet.getSpreadsheetLocale()) {
      SpreadsheetSettings.updateDecimalSeparator()
    }

    const rScript = this.updateScript_()
    if (rScript !== 0) {
      if (isOnline) this.showMessage_(rScript)
      lock.releaseLock()
      return 1
    }

    const rTemplate = this.updateTemplate_()
    lock.releaseLock()
    if (isOnline) this.showMessage_(rTemplate)

    return rTemplate !== 0 ? 1 : 0
  }
}
