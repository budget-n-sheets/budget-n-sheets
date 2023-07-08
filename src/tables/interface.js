/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function showPanelTables () {
  if (UpdateService.checkAndUpdate(true)) return;

  const htmlSidebar = new TablesSidebar().build();
  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showDialogEditAccount (id) {
  const decimal_places = SettingsSpreadsheet.get('decimal_places');

  const scriptlet = {
    account_id: id,
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlEditAccount')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Edit Account');
}

function showDialogAddCard () {
  const decimal_places = SettingsSpreadsheet.get('decimal_places');

  const scriptlet = {
    is_edit: false,
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlAddEditCard')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Add Card');
}

function showDialogEditCard (id) {
  const decimal_places = SettingsSpreadsheet.get('decimal_places');

  const scriptlet = {
    is_edit: true,
    card_id: id,
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0')
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlAddEditCard')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Edit Card');
}

function showDialogDeleteCard (id) {
  const cardsService = new CardsService();
  const card = cardsService.getById(id);
  if (!card) return 1;

  const ui = SpreadsheetApp2.getUi();
  const response = ui.alert(
    'Delete card',
    'Are you sure you want to delete ' + card.name + '?',
    ui.ButtonSet.YES_NO);

  if (response === ui.Button.YES) {
    cardsService.delete(id);
    cardsService.save();
    cardsService.flush();
    onOpen();
    return 1;
  }
}
