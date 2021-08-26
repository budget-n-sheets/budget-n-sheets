class CoolStatsForTags extends CoolGallery {
  constructor () {
    const metadata = CoolGalleryMetadata.getStatsForTags();
    super(metadata);
  }

  buildPart1_ () {
    const sheet = this._sheets[0];
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
    const sheet = this._sheets[0];
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
    const sheet = this._sheets[0];

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
    const sheet = this._sheets[0];

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

    const range = sheetTags.getRange(2, 5, numRows, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(range, true)
      .setAllowInvalid(false)
      .build();

    this._sheets[0].getRange(92, 2, 1, 2).setDataValidation(rule);
  }

  build () {
    this.buildPart1_();
    this.buildPart2_();
    this.buildPart3_();
    this.buildPart4_();
    this.buildTags_();

    this._sheets[0].setTabColor('#e69138');
  }

  makeConfig () {
    this.config_();

    return this;
  }
}