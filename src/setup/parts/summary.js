function setupSummary_ () {
  const formulaBuild = FormulaBuild.summary();

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Summary');
  let formula, chart, options;

  const h_ = TABLE_DIMENSION.height;

  options = {
    0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Income' },
    1: { color: '#cccccc', type: 'bars', labelInLegend: 'Expenses' },
    2: { color: '#45818e', type: 'bars', labelInLegend: 'Income' },
    3: { color: '#e69138', type: 'bars', labelInLegend: 'Expenses' },
    4: { color: '#45818e', type: 'line', labelInLegend: 'Avg Income' },
    5: { color: '#e69138', type: 'line', labelInLegend: 'Avg Expenses' }
  };

  sheet.protect()
    .setUnprotectedRanges([
      sheet.getRange(52, 2, 1, 3), sheet.getRange(72, 2, 1, 3)
    ])
    .setWarningOnly(true);
  sheet.getRange('B2').setValue(SETUP_SETTINGS.financial_year + ' | Year Summary');

  formulas = [];
  const buildTable1 = formulaBuild.table1();
  for (i = 0; i < 12; i++) {
    formulas[i] = ['', null, '', null];

    formulas[i][0] = '=_Backstage!$B' + (3 + h_ * i);
    formulas[i][2] = buildTable1.expensesMonth(i);
  }
  sheet.getRange(11, 4, 12, 4).setFormulas(formulas);

  chart = sheet.newChart()
    .addRange(sheet.getRange('C25:I36'))
    .setChartType(Charts.ChartType.COMBO)
    .setPosition(24, 2, 0, 0)
    .setOption('mode', 'view')
    .setOption('legend', 'top')
    .setOption('focusTarget', 'category')
    .setOption('series', options)
    .setOption('height', 482)
    .setOption('width', 886);

  sheet.insertChart(chart.build());

  if (SETUP_SETTINGS.decimal_places !== 2) {
    sheet.getRangeList(['D9:I22', 'D25:G36']).setNumberFormat(SETUP_SETTINGS.number_format);
  }

  formula = formulaBuild.table2().data();
  sheet.getRange(55, 2).setFormula(formula);

  chart = sheet.newChart()
    .addRange(sheet.getRange('B54:B64'))
    .addRange(sheet.getRange('D54:D64'))
    .setNumHeaders(1)
    .setChartType(Charts.ChartType.PIE)
    .setPosition(52, 8, 0, 0)
    .setOption('mode', 'view')
    .setOption('legend', 'top')
    .setOption('focusTarget', 'category')
    .setOption('height', 447)
    .setOption('width', 444);

  sheet.insertChart(chart.build());

  formula = formulaBuild.table3().total();
  sheet.getRange(75, 4).setFormula(formula);

  options = {
    0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Total' },
    1: { color: '#45818e', type: 'bars', labelInLegend: 'Total' },
    2: { color: '#45818e', type: 'line', labelInLegend: 'Average' }
  };

  chart = sheet.newChart()
    .addRange(sheet.getRange('B75:B86'))
    .addRange(sheet.getRange('I75:K86'))
    .setChartType(Charts.ChartType.COMBO)
    .setPosition(72, 8, 0, 0)
    .setOption('mode', 'view')
    .setOption('legend', 'top')
    .setOption('focusTarget', 'category')
    .setOption('series', options)
    .setOption('height', 459)
    .setOption('width', 444);

  sheet.insertChart(chart.build());

  SpreadsheetApp.flush();
}
