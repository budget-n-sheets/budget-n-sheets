/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class CoolStatsForTags extends CoolGallery {
  constructor () {
    super(CoolStatsForTags.metadata);
  }

  static get metadata () {
    return {
      id: '',
      name: 'Stats for Tags',
      version_name: 'v2.0.0',
      description: 'Basic statistics for your tags.',
      requires: ['Tags by Category']
    };
  }

  buildPart1_ () {
    const sheet = this.sheet;

    let chart;

    sheet.getRange('E2').setFormula('_Settings!B4');
    sheet.getRange('E3').setFormula('_Settings!B6');

    sheet.getRange('B6').setFormula('QUERY({Tags!$B$1:$T}; "select Col1, sum(Col5), sum(Col6), sum(Col7), sum(Col8), sum(Col9), sum(Col10), sum(Col11), sum(Col12), sum(Col13), sum(Col14), sum(Col15), sum(Col16), sum(Col18), sum(Col19) where Col3=true or Col3=\'TRUE\' group by Col1"; 1)');

    chart = sheet.newChart()
      .addRange(sheet.getRange('B18:N28'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.BAR)
      .setPosition(31, 2, 0, 0)
      .setTransposeRowsAndColumns(true)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('title', 'Share per month')
      .setOption('focusTarget', 'category')
      .setOption('isStacked', 'percent')
      .setOption('backgroundColor', { fill: '#f3f3f3' })
      .setOption('height', 399)
      .setOption('width', 689);
    sheet.insertChart(chart.build());

    chart = sheet.newChart()
      .addRange(sheet.getRange('B18:B28'))
      .addRange(sheet.getRange('O18:O28'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.PIE)
      .setPosition(31, 9, 0, 0)
      .setOption('mode', 'view')
      .setOption('title', 'Average per category')
      .setOption('focusTarget', 'category')
      .setOption('backgroundColor', { fill: '#f3f3f3' })
      .setOption('height', 399)
      .setOption('width', 696);
    sheet.insertChart(chart.build());
  }

  buildPart2_ () {
    const sheet = this.sheet;

    const options = {
      0: { color: '#cccccc', type: 'bars' },
      1: { color: '#4285f4', type: 'bars' },
      2: { color: '#ea4335', type: 'line' }
    };

    const chart = sheet.newChart()
      .addRange(sheet.getRange('B55:B67'))
      .addRange(sheet.getRange('I55:K67'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(53, 7, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('backgroundColor', { fill: '#f3f3f3' })
      .setOption('series', options)
      .setOption('height', 402)
      .setOption('width', 783);
    sheet.insertChart(chart.build());
  }

  buildPart3_ () {
    const sheet = this.sheet;

    const chart = sheet.newChart()
      .addRange(sheet.getRange('B74:B84'))
      .addRange(sheet.getRange('D74:D84'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.PIE)
      .setPosition(72, 7, 0, 0)
      .setOption('mode', 'view')
      .setOption('focusTarget', 'category')
      .setOption('backgroundColor', { fill: '#f3f3f3' })
      .setOption('height', 402)
      .setOption('width', 783);
    sheet.insertChart(chart.build());
  }

  buildPart4_ () {
    const sheet = this.sheet;

    sheet.getRange(92, 4).setFormula('IFERROR(MATCH(B92; Tags!E1:E; 0); 0)');
    sheet.getRange(95, 4).setFormula('IF(D92 > 0; ARRAYFORMULA(ABS(TRANSPOSE(OFFSET(Tags!E1; D92 - 1; 1; 1; 12)))); )');
    sheet.getRange(107, 4).setFormula('IF(D92 > 0; ARRAYFORMULA(ABS(TRANSPOSE(OFFSET(Tags!S1; D92 - 1; 0; 1; 2)))); )');

    const options = {
      0: { color: '#cccccc', type: 'bars' },
      1: { color: '#4285f4', type: 'bars' },
      2: { color: '#ea4335', type: 'line' }
    };

    const chart = sheet.newChart()
      .addRange(sheet.getRange('B94:B106'))
      .addRange(sheet.getRange('I94:K106'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.COMBO)
      .setPosition(92, 7, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('backgroundColor', { fill: '#f3f3f3' })
      .setOption('series', options)
      .setOption('height', 402)
      .setOption('width', 783);
    sheet.insertChart(chart.build());
  }

  buildTags_ () {
    const sheet = this._spreadsheet.getSheetByName('Tags');
    if (!sheet) return;

    const numRows = sheet.getMaxRows() - 1;
    if (numRows < 1) return;

    const range = sheet.getRange(2, 5, numRows, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(range, true)
      .setAllowInvalid(false)
      .build();

    this.sheet.getRange(92, 2, 1, 2).setDataValidation(rule);
  }

  insertChart1_ () {
    this.sheet.insertChart(
      this.sheet.newChart()
        .addRange(this.sheetTagsByCategory.getRange('A1:A'))
        .addRange(this.sheetTagsByCategory.getRange('B1:M'))
        .setNumHeaders(1)
        .setChartType(Charts.ChartType.COLUMN)
        .setPosition(this.nextRow, 2, 0, 0)
        .setTransposeRowsAndColumns(true)
        .setOption('title', 'Category per month')
        .setOption('mode', 'view')
        .setOption('legend', 'left')
        .setOption('useFirstColumnAsDomain', true)
        .setOption('focusTarget', 'category')
        .setOption('backgroundColor', { fill: '#f3f3f3' })
        .setOption('height', 421)
        .setOption('width', 1013)
        .build());

    this.nextRow += 21;
  }

  insertChart2_ () {
    this.sheet.insertChart(
      this.sheet.newChart()
        .addRange(this.sheetTagsByCategory.getRange('A1:A'))
        .addRange(this.sheetTagsByCategory.getRange('B1:M'))
        .setNumHeaders(1)
        .setChartType(Charts.ChartType.BAR)
        .setPosition(this.nextRow, 2, 0, 0)
        .setTransposeRowsAndColumns(true)
        .setOption('title', 'Share per month')
        .setOption('mode', 'view')
        .setOption('legend', 'left')
        .setOption('isStacked', 'percent')
        .setOption('useFirstColumnAsDomain', true)
        .setOption('focusTarget', 'category')
        .setOption('backgroundColor', { fill: '#f3f3f3' })
        .setOption('height', 421)
        .setOption('width', 1013)
        .build());

    this.nextRow += 21;
  }

  insertChart3_ () {
    this.sheet.insertChart(
      this.sheet.newChart()
        .addRange(this.sheetTagsByCategory.getRange('A1:A'))
        .addRange(this.sheetTagsByCategory.getRange('N1:N'))
        .setNumHeaders(1)
        .setChartType(Charts.ChartType.PIE)
        .setPosition(this.nextRow, 2, 0, 0)
        .setOption('useFirstColumnAsDomain', true)
        .setOption('mode', 'view')
        .setOption('focusTarget', 'category')
        .setOption('backgroundColor', { fill: '#f3f3f3' })
        .setOption('title', 'Average per category')
        .setOption('pieHole', 0.5)
        .setOption('height', 421)
        .setOption('width', 1013)
        .build());

    this.nextRow += 21;
  }

  insertChart4_ () {
    this.sheet.insertChart(
      this.sheet.newChart()
        .addRange(this.sheetTagsByCategory.getRange('A1:A'))
        .addRange(this.sheetTagsByCategory.getRange('N1:N'))
        .setNumHeaders(1)
        .setChartType(Charts.ChartType.RADAR)
        .setPosition(this.nextRow, 2, 0, 0)
        .setOption('useFirstColumnAsDomain', true)
        .setOption('mode', 'view')
        .setOption('focusTarget', 'category')
        .setOption('backgroundColor', { fill: '#f3f3f3' })
        .setOption('title', 'Average per category')
        .setOption('lineWidth', 3)
        .setOption('pointSize', 7)
        .setOption('height', 421)
        .setOption('width', 491)
        .build());

    this.sheet.insertChart(
      this.sheet.newChart()
        .addRange(this.sheetTagsByCategory.getRange('A1:A'))
        .addRange(this.sheetTagsByCategory.getRange('O1:O'))
        .setNumHeaders(1)
        .setChartType(Charts.ChartType.RADAR)
        .setPosition(this.nextRow, 7, 11, 0)
        .setOption('useFirstColumnAsDomain', true)
        .setOption('mode', 'view')
        .setOption('focusTarget', 'category')
        .setOption('backgroundColor', { fill: '#f3f3f3' })
        .setOption('title', 'Total per category')
        .setOption('lineWidth', 3)
        .setOption('pointSize', 7)
        .setOption('height', 421)
        .setOption('width', 491)
        .build());

    this.nextRow += 21;
  }

  setFormat_ () {
    this.sheet.protect().setWarningOnly(true);
    this.sheet.setTabColor('#e69138');
  }

  fixDependencies () {
    new CoolGalleryService('tags_by_category').install();
  }

  make () {
    this.setFormat_();
    this.insertChart1_();
    // this.insertChart2_();
    this.insertChart3_();
    this.insertChart4_();


    return this;
  }

  makeConfig () {
    this.sheetTagsByCategory = Spreadsheet3.getSheetByName('Tags by Category');
    this.nextRow = 5;
    return this;
  }
}
