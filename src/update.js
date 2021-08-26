const PATCH_THIS = Object.freeze({
  patch_list: [
    [
      null, [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [], [], [], [], [], [], [], [], [], [],
      [update_v0m40p0_, update_v0m40p1_],
      [null, null, null, update_v0m41p3_, null],
      [null, null, null, null, null, null, null, null, null, null, update_v0m42p10_, patchV0m42p11_, null, null, null, patchV0m42p15_, null, patchV0m42p17_, null, null, null, patchV0m42p21_, null, null, null]
    ]
  ],
  beta_list: []
});

function onlineUpdate_ () {
  const v0 = isScriptUpToDate_();
  if (v0 === 1) {
    return;
  } else if (v0 === 2) {
    showDialogErrorMessage();
    return 1;
  }

  const ui = SpreadsheetApp2.getUi();

  if (!AppsScript.isTemplateAvailable()) {
    ui.alert(
      'New version available',
      'Please, re-open the spreadsheet to update the add-on.',
      ui.ButtonSet.OK);
    return 1;
  }

  if (!User2.isAdmin()) {
    ui.alert(
      'Add-on update',
      'Please, contact the spreadsheet admin to update the add-on.',
      ui.ButtonSet.OK);
    return;
  }

  const spreadsheet_locale = SettingsSpreadsheet.getValueOf('spreadsheet_locale');
  if (spreadsheet_locale !== SpreadsheetApp2.getActiveSpreadsheet().getSpreadsheetLocale()) {
    updateDecimalSeparator_();
  }

  showDialogMessage('Add-on update', 'Updating add-on...', 1);

  const r = update_();

  if (r === 0) {
    ui.alert(
      'Update successful',
      'The update process is complete!',
      ui.ButtonSet.OK);
    return;
  } else if (r === 1) {
    ui.alert(
      "Can't update",
      'The add-on is busy. Try again in a moment.',
      ui.ButtonSet.OK);
  } else if (r === 2) {
    ui.alert(
      'Update failed',
      'Something went wrong. Please, try again later.',
      ui.ButtonSet.OK);
  } else if (r > 2) {
    AppsScript.uninstall();
    onOpen();
    showDialogErrorMessage();
  }

  return 1;
}

function seamlessUpdate_ () {
  if (!AppsScript.isTemplateAvailable()) return 1;
  if (!User2.isAdmin()) return 1;

  const spreadsheet_locale = SettingsSpreadsheet.getValueOf('spreadsheet_locale');
  if (spreadsheet_locale !== SpreadsheetApp2.getActiveSpreadsheet().getSpreadsheetLocale()) {
    updateDecimalSeparator_();
  }

  const v0 = isScriptUpToDate_();
  if (v0 === 1) return;
  if (v0 === 2) return 1;

  const r = update_();

  if (r === 0) return;
  if (r > 2) AppsScript.uninstall();

  return 1;
}

function isScriptUpToDate_ () {
  const v0 = ClassVersion.getValueOf('script');
  const v1 = Info.apps_script.version;

  if (v0 === 1) return 2;

  if (v0.major > v1.major) return 1;
  if (v0.major === v1.major) {
    if (v0.minor > v1.minor) return 1;
    if (v0.minor === v1.minor) {
      if (v0.patch > v1.patch) return 1;
      if (v0.patch === v1.patch) {
        if (PATCH_THIS.beta_list.length === 0 || v0.beta >= PATCH_THIS.beta_list.length) return 1;
      }
    }
  }

  return 0;
}
