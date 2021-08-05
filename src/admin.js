function askTransferAdmin () {
  if (!AppsScript.isInstalled()) return;

  const ui = SpreadsheetApp2.getUi();
  let owner, owner_id;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  owner = spreadsheet.getOwner();
  if (owner) {
    owner = owner.getEmail();
    owner_id = Utilities2.computeDigest('SHA_256', owner, 'UTF_8');
  }

  if (!owner || User2.getId() === owner_id) {
    ui.alert(
      "Can't transfer admin role",
      'The admin role can only be transferred to the owner of the spreadsheet.\nMake an editor the owner and try again.',
      ui.ButtonSet.OK);
    return 1;
  }

  const response = ui.alert(
    'Transfer the admin role?',
    "You might lose the ability to change settings. You can't undo this action!\n\nNew admin: " + owner,
    ui.ButtonSet.YES_NO);

  if (response === ui.Button.YES) {
    Triggers.deleteAllUserTriggers();

    SettingsAdmin.setValueOf('admin_id', owner_id);
    new BsAuth(spreadsheet).update();

    SettingsUser.setValueOf('financial_calendar', '');
    SettingsUser.setValueOf('post_day_events', false);
    SettingsUser.setValueOf('cash_flow_events', false);

    return;
  }

  return 1;
}

function askTransferAdminSd () {
  if (!AppsScript.isInstalled()) return;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let email, digest;
  const user = Session.getEffectiveUser().getEmail();

  if (spreadsheet.getowner() || !User2.isAdmin()) return 1;

  const editors = spreadsheet.getEditors();
  if (editors.length === 1) {
    SpreadsheetApp2.getUi().alert(
      "Can't transfer admin role",
      'You are the only editor of the spreadsheet.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return 1;
  }

  for (let i = 0; i < editors.length; i++) {
    email = editors[i].getEmail();
    if (user === email) continue;

    digest = Utilities2.computeDigest('MD5', email, 'UTF_8');
    digest = digest.substring(0, 12);

    editors[i] = {
      digest: digest,
      email: email
    };
  }

  const htmlOutput = HtmlService2.createTemplateFromFile('html/htmlSelectEditor')
    .setScriptletValues({ editors: editors })
    .evaluate()
    .setWidth(281)
    .setHeight(233);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Transfer the admin role');
}

function continuedTransferAdminSd (editor) {
  if (!AppsScript.isInstalled()) return;

  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let email, digest;
  const user = Session.getEffectiveUser().getEmail();

  if (spreadsheet.getowner() || !User2.isAdmin()) return 1;

  const editors = spreadsheet.getEditors();
  if (editors.length === 1) {
    SpreadsheetApp2.getUi().alert(
      "Can't transfer admin role",
      'You are the only editor of the spreadsheet.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return 1;
  }

  for (let i = 0; i < editors.length; i++) {
    email = editors[i].getEmail();
    if (user === email) continue;

    digest = Utilities2.computeDigest('MD5', email, 'UTF_8');
    digest = digest.substring(0, 12);

    if (digest === editor) {
      Triggers.deleteAllUserTriggers();

      digest = Utilities2.computeDigest('SHA_256', email, 'UTF_8');
      SettingsAdmin.setValueOf('admin_id', digest);
      new BsAuth(spreadsheet).update();

      SettingsUser.setValueOf('financial_calendar', '');
      SettingsUser.setValueOf('post_day_events', false);
      SettingsUser.setValueOf('cash_flow_events', false);

      return;
    }
  }
}
