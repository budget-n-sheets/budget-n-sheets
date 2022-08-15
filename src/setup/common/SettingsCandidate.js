class SettingsCandidate {
  static processBackup (uuid, file, data) {
    if (!FeatureFlag.getStatusOf('setup/restore')) throw new Error('Feature flagged.');

    const settings_candidate = {
      uuid: uuid,
      protocol: 'restore',
      source: {
        file_id: file.getId(),
        file_url: '',
        file_name: file.getName(),
        type: 'JSON',
        date_created: new Date(data.metadata.date_request).toString()
      },
      settings: {
        spreadsheet_name: data.metadata.spreadsheet_name,
        financial_year: data.const_properties.financial_year,
        initial_month: data.user_settings.initial_month,
        decimal_places: data.spreadsheet_settings.decimal_places,
        financial_calendar: data.user_settings.financial_calendar,
        accounts: []
      },
      misc: {
        cards: [],
        tags: 0
      }
    };

    for (const k in data.db_tables.accounts) {
      settings_candidate.settings.accounts.push({
        id: 'acc_' + k,
        prevIndex: +k,

        require: 'restore',
        index: +k,
        name: data.db_tables.accounts[k].name
      });
    }

    for (const k in data.db_tables.cards) {
      settings_candidate.misc.cards.push(data.db_tables.cards[k].name);
    }

    PropertiesService2.getDocumentProperties().setProperty('settings_candidate', settings_candidate);
    cacheSettingsSummary_(settings_candidate);
    return 0;
  }

  static processSpreadsheet (uuid, fileId) {
    if (!FeatureFlag.getStatusOf('setup/copy')) throw new Error('Feature flagged.');

    const spreadsheet = SpreadsheetApp.openById(fileId);
    const metadata = new Metadata(spreadsheet);
    let property;

    const settings_candidate = {
      uuid: uuid,
      protocol: 'copy',
      source: {
        file_id: fileId,
        file_url: spreadsheet.getUrl(),
        type: 'GOOGLE_SHEETS'
      },
      settings: {
        spreadsheet_name: spreadsheet.getName(),
        financial_year: Consts.date.getFullYear(),
        initial_month: Consts.date.getMonth(),
        decimal_places: 2,
        financial_calendar: '',
        accounts: []
      },
      misc: {
        cards: [],
        tags: 0
      }
    };

    property = metadata.get('const_properties');
    if (!property) throw new Error('Property not found.');
    settings_candidate.settings.financial_year = property.financial_year;

    property = metadata.get('user_settings');
    if (!property) throw new Error('Property not found.');
    settings_candidate.settings.initial_month = property.initial_month;
    settings_candidate.settings.financial_calendar = property.financial_calendar;

    property = metadata.get('spreadsheet_settings');
    settings_candidate.settings.decimal_places = property?.decimal_places || 2;

    property = metadata.get('db_accounts');
    if (!property) throw new Error('Property not found.');
    for (const k in property) {
      settings_candidate.settings.accounts.push({
        id: 'acc_' + k,
        prevIndex: +k,

        require: 'copy',
        index: +k,
        name: property[k].name
      });
    }

    property = metadata.get('db_cards');
    if (!property) throw new Error('Property not found.');
    for (const k in property) {
      settings_candidate.misc.cards.push(property[k].name);
    }

    const sheet = spreadsheet.getSheetByName('Tags');
    if (sheet) settings_candidate.misc.tags = sheet.getLastRow() - 1;

    PropertiesService2.getDocumentProperties().setProperty('settings_candidate', settings_candidate);
    cacheSettingsSummary_(settings_candidate);
  }
}
