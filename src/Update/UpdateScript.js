class UpdateScript extends Update {
  constructor () {
    const v0 = ClassVersion.getValueOf('script');
    const vA = Info.apps_script.version;
    const list = [
      [
        null, [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        [], [], [], [], [], [], [], [], [], [],
        ['update_v0m40p0_', 'update_v0m40p1_'],
        ['', '', '', 'update_v0m41p3_', ''],
        ['', '', '', '', '', '', '', '', '', '', 'update_v0m42p10_', 'patchV0m42p11_', '', '', '', 'patchV0m42p15_', '', 'patchV0m42p17_', '', '', '', 'patchV0m42p21_', '', '', '', '', '', '', 'patchV0m42p28_', '', 'patchV0m42p30_', 'patchV0m42p31_', '', 'patchV0m42p33_', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', ''],
        ['', '', '', ''],
        ['', 'patchV0m45p1_', '', '', 'patchV0m45p4_', '', '', 'patchV0m45p7_', '', '', '', '', '', '', '', ''],
        ['', '', 'patchV0m46p2_', 'patchV0m46p3_']
      ]
    ];

    super(v0, vA, list);

    this._key = 'script';
  }

  /**
   * Rebuild all charts in Summary.
   *
   * 0.46.3
   */
  patchV0m46p3_ () {
    const sheet = Spreadsheet2.getSheetByName('Summary');
    if (!sheet) return 0;

    const charts = sheet.getCharts();
    if (charts.length > 2) sheet.removeChart(charts[2]);

    sheet.getRange(74, 9, 1, 3).setValues([
      ['Total', 'Total', 'Average']
    ]);

    new SheetSummaryCharts().insertChart3();

    return 0;
  }

  /**
   * Replace column with combo chart.
   *
   * 0.46.2
   */
  patchV0m46p2_ () {
    const sheet = Spreadsheet2.getSheetByName('Summary');
    if (!sheet) return 0;

    const sheetId = sheet.getSheetId();
    const charts = sheet.getCharts();

    if (charts.length) sheet.removeChart(charts[0]);

    sheet.getRange(24, 3, 1, 7).setValues([
      ['Month', 'Income', 'Expenses', 'Income', 'Expenses', 'Avg Income', 'Avg Expenses']
    ]);

    new SheetSummaryCharts().insertChart1();

    return 0;
  }

  /**
   * Update User settings metadata.
   *
   * 0.45.7
   */
  patchV0m45p7_ () {
    SettingsUser.updateMetadata();
    return 0;
  }

  /**
   * Reinstall triggers.
   * Update User and Spreadsheet settings metadata.
   *
   * 0.45.4
   */
  patchV0m45p4_ () {
    TriggersService.restart();

    SettingsUser.updateMetadata();
    SettingsSpreadsheet.updateMetadata();
    return 0;
  }

  /**
   * Change combo to column chart in Summary.
   *
   * 0.45.1
   */
  patchV0m45p1_ () {
    const sheet = Spreadsheet2.getSheetByName('Summary');
    if (!sheet) return 0;

    const charts = sheet.getCharts();

    for (const chart of charts) {
      const range = chart.getRanges()[0];
      if (range.getRow() === 25) {
        sheet.removeChart(chart);
        break;
      }
    }

    const options = {
      0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Income' },
      1: { color: '#cccccc', type: 'bars', labelInLegend: 'Expenses' },
      2: { color: '#45818e', type: 'bars', labelInLegend: 'Income' },
      3: { color: '#e69138', type: 'bars', labelInLegend: 'Expenses' }
    };

    const chart = sheet.newChart()
      .addRange(sheet.getRange('C25:G36'))
      .setChartType(Charts.ChartType.COLUMN)
      .setPosition(24, 2, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('series', options)
      .setOption('vAxis.minorGridlines.count', 3)
      .setOption('height', 482)
      .setOption('width', 886);

    sheet.insertChart(chart.build());

    return 0;
  }

  /**
   * Disable sheet 'Quick Actions'.
   *
   * 0.42.33
   */
  patchV0m42p33_ () {
    const sheet = Spreadsheet2.getSheetByName('Quick Actions');
    if (sheet) sheet.setTabColor('#b7b7b7');
    return 0;
  }

  /**
   * Resume activity to fix bad functions.
   *
   * 0.42.31
   */
  patchV0m42p31_ () {
    if (!Spreadsheet2.getSheetByName('_Backstage')) return 3;

    try {
      RecalculationService.resume(0, 12);
    } catch (err) {
      LogLog.error(err);
      return 1;
    }

    return 0;
  }

  /**
   * Move metadata location to spreadsheet.
   * Flush accounts and cards changes.
   *
   * 0.42.30
   */
  patchV0m42p30_ () {
    SpreadsheetApp2.getActiveSpreadsheet()
      .createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .find()
      .forEach(item => item.moveToSpreadsheet());

    new AccountsService().flush();
    new CardsService().flush();

    return 0;
  }

  /**
   * Resume activity to fix bad functions.
   *
   * 0.42.28
   */
  patchV0m42p28_ () {
    try {
      RecalculationService.resume(0, 12);
    } catch (err) {
      LogLog.error(err);
      return 1;
    }

    return 0;
  }

  /**
   * Flush changes.
   *
   * 0.42.19 > 0.42.21
   */
  patchV0m42p21_ () {
    new AccountsService().flush();
    new CardsService().flush();

    return 0;
  }

  /**
   * Migrate tables db structure.
   *
   * 0.42.17
   */
  patchV0m42p17_ () {
    const db_tables = PropertiesService3.document().getProperty('DB_TABLES');
    let db;

    const db_accounts = {};
    db = db_tables.accounts.data;
    for (let i = 0; i < db.length; i++) {
      const id = db[i].id;

      db_accounts[id] = Utils.deepCopy(db[i]);

      db_accounts[id].index = i;
      db_accounts[id].time_start = db_accounts[id].time_a;

      delete db_accounts[id].id;
      delete db_accounts[id].time_a;
      delete db_accounts[id].time_z;
    }
    CachedAccess.update('db_accounts', db_accounts);

    const db_cards = {};
    db = db_tables.cards.data;
    for (let i = 0; i < db.length; i++) {
      const id = db[i].id;

      db_cards[id] = Utils.deepCopy(db[i]);

      db_cards[id].index = i;
      delete db_cards[id].id;
    }
    CachedAccess.update('db_cards', db_cards);

    PropertiesService3.document().deleteProperty('DB_TABLES');
    return 0;
  }

  /**
   * Test existence of property 'DB_TABLES'.
   * Refresh 'db_accounts' metadata.
   *
   * 0.42.15
   */
  patchV0m42p15_ () {
    if (PropertiesService.getDocumentProperties().getProperty('DB_TABLES') == null) return 3;
    if (PropertiesService.getDocumentProperties().getProperty('db_accounts') == null) return 3;

    SpreadsheetApp2.getActiveSpreadsheet()
      .createDeveloperMetadataFinder()
      .withVisibility(SpreadsheetApp.DeveloperMetadataVisibility.PROJECT)
      .withKey('db_accounts')
      .find()
      .forEach(m => m.remove());

    new AccountsService().flush();

    return 0;
  }

  /**
   * Refresh Bs signature.
   *
   * 0.42.11
   */
  patchV0m42p11_ () {
    new BsAuth(SpreadsheetApp2.getActiveSpreadsheet()).update();

    return 0;
  }

  /**
   * Delete property 'spreadsheet_triggers'.
   *
   * 0.42.10
   */
  update_v0m42p10_ () {
    PropertiesService3.document().deleteProperty('spreadsheet_triggers');

    return 0;
  }

  /**
   * Fix initial month value in _Settings.
   *
   * 0.41.3
   */
  update_v0m41p3_ () {
    const initial_month = SettingsUser.getValueOf('initial_month');
    SettingsUser.setValueOf('initial_month', initial_month);

    return 0;
  }

  /**
   * Update formula of suggested description.
   *
   * 0.40.1
   */
  update_v0m40p1_ () {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const unique = spreadsheet.getSheetByName('_Unique');
    if (!unique) return 0;

    const cards = spreadsheet.getSheetByName('Cards');
    if (!cards) return 0;

    const max = cards.getMaxRows() - 5;
    if (max < 1) return 0;

    let range_cards = '';

    for (let i = 0; i < 12; i++) {
      range_cards += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, max, 1) + '; ';
    }

    range_cards = '{' + range_cards.slice(0, -2) + '}';

    let formula = 'FILTER(' + range_cards + '; NOT(REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+"))); ';
    formula += 'ARRAYFORMULA(REGEXREPLACE(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")); "[0-9]+/[0-9]+"; ""))';
    formula = 'SORT(UNIQUE({' + formula + '})); ';
    formula += 'SORT(FILTER(' + range_cards + '; REGEXMATCH(' + range_cards + '; "[0-9]+/[0-9]+")))';
    formula = '{' + formula + '}';

    unique.getRange(1, 2).setFormula(formula);

    return 0;
  }

  /**
   * Setup suggested description.
   *
   * 0.40.0
   */
  update_v0m40p0_ () {
    let r = 0;

    r = this.update_v0m40p0s0_();
    if (r !== 0) return r;

    r = this.update_v0m40p0s1_();
    if (r !== 0) return r;

    r = this.update_v0m40p0s2_();
    if (r !== 0) return r;

    return 0;
  }

  update_v0m40p0s2_ () {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const unique = spreadsheet.getSheetByName('_Unique');
    if (!unique) return 1;

    const cards = spreadsheet.getSheetByName('Cards');
    if (!cards) return 0;

    const max = cards.getMaxRows() - 5;
    if (max < 1) return 0;

    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(unique.getRange('B:B'), false)
      .setAllowInvalid(true)
      .build();

    let range_cards = '';

    for (let i = 0; i < 12; i++) {
      cards.getRange(6, 2 + 6 * i, max, 1)
        .clearDataValidations()
        .setDataValidation(rule);

      range_cards += 'Cards!' + RangeUtils.rollA1Notation(6, 2 + 6 * i, max, 1) + '; ';
    }

    unique.getRange(1, 2).setFormula('SORT(UNIQUE({' + range_cards.slice(0, -2) + '}))');

    return 0;
  }

  update_v0m40p0s1_ () {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
    const unique = spreadsheet.getSheetByName('_Unique');
    if (!unique) return 1;

    const num_acc = SettingsConst.getValueOf('number_accounts');
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(unique.getRange('A:A'), false)
      .setAllowInvalid(true)
      .build();

    let range_accounts = '';

    for (let i = 0; i < 12; i++) {
      const month = spreadsheet.getSheetByName(Consts.month_name.short[i]);
      if (!month) continue;

      const max = month.getMaxRows() - 4;
      if (max < 1) continue;

      for (let k = 0; k <= num_acc; k++) {
        range_accounts += Consts.month_name.short[i] + '!' + RangeUtils.rollA1Notation(5, 2 + 5 * k, max, 1) + '; ';

        month.getRange(5, 2 + 5 * k, max, 1)
          .clearDataValidations()
          .setDataValidation(rule);
      }
    }

    if (range_accounts === '') return 0;

    unique.getRange(1, 1).setFormula('SORT(UNIQUE({' + range_accounts.slice(0, -2) + '}))');

    return 0;
  }

  update_v0m40p0s0_ () {
    const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();

    let sheet = spreadsheet.getSheetByName('_Unique');
    if (sheet) spreadsheet.deleteSheet(sheet);

    const template = SpreadsheetApp.openById(Info.template.id);

    sheet = template.getSheetByName('_Unique')
      .copyTo(spreadsheet)
      .setName('_Unique')
      .setTabColor('#cc0000');

    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(spreadsheet.getNumSheets());

    sheet.protect().setWarningOnly(true);
    sheet.hideSheet();

    return 0;
  }
}
