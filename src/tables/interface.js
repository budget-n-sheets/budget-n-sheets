function showPanelTables () {
  if (onlineUpdate_()) return;

  const htmlSidebar = new TablesSidebar().build();
  SpreadsheetApp2.getUi().showSidebar(htmlSidebar);
}

function showDialogEditAccount (id) {
  const decimal_places = SettingsSpreadsheet.getValueOf('decimal_places');

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
  const decimal_places = SettingsSpreadsheet.getValueOf('decimal_places');

  const scriptlet = {
    is_edit: false,
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0'),

    card_id: '',
    card_name: '',
    card_code: '',
    card_aliases: '',
    card_limit: 0
  };

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlAddEditCard')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Add Card');
}

function showDialogEditCard (card_id) {
  const decimal_places = SettingsSpreadsheet.getValueOf('decimal_places');
  const card = cardsClientService({ job: 'get', id: card_id });
  if (!card) return 1;

  const scriptlet = {
    is_edit: true,
    step: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places - 1) + '1' : '1'),
    placeholder: (decimal_places > 0 ? '0.' + '0'.repeat(decimal_places) : '0')
  };

  card.aliases = card.aliases.join(', ');
  for (const key in card) {
    scriptlet['card_' + key] = card[key];
  }

  const htmlOutput = HtmlService2.createTemplateFromFile('tables/htmlAddEditCard')
    .setScriptletValues(scriptlet)
    .evaluate()
    .setWidth(300)
    .setHeight(359);

  SpreadsheetApp2.getUi().showModalDialog(htmlOutput, 'Edit Card');
}

function showDialogDeleteCard (card_id) {
  const card = cardsClientService({ job: 'get', id: card_id });
  if (!card) return 1;

  const ui = SpreadsheetApp2.getUi();
  const response = ui.alert(
    'Delete card',
    'Are you sure you want to delete ' + card.name + '?',
    ui.ButtonSet.YES_NO);

  if (response === ui.Button.YES) {
    new CardsService().delete(card_id);
    return 1;
  }
}
