function setupSummary_ () {
  const formulaBuild = FormulaBuild.summary();
  let testBuild;

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
      sheet.getRange(50, 2, 1, 3), sheet.getRange(70, 2, 1, 3)
    ])
    .setWarningOnly(true);
  sheet.getRange('B2').setValue(SETUP_SETTINGS.financial_year + ' | Year Summary');

  formulas = [];
  const buildTable1 = formulaBuild.table1();
  for (i = 0; i < 12; i++) {
    formulas[i] = ['', null, '', null];

    formulas[i][0] = '=_Backstage!$B' + (3 + h_ * i);

    formula = '=SUM(_Backstage!$B' + (4 + h_ * i) + ':$B' + (6 + h_ * i) + ')';
    testBuild = buildTable1.expenses_month(i);
    if (formula !== testBuild) ConsoleLog.warn('Formula build failed: FormulaBuild.summary().table1().expenses_month()');

    formulas[i][2] = formula;
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

  formula = 'IF(AND(E50 > 0; _Settings!B7 > 0); QUERY({Tags!$B$1:$T}; "select Col1, sum(Col18), -1 * sum(Col"&(4 + E50)&") where Col3=true or Col3=\'TRUE\' group by Col1 label Col1 \'\', -1 * sum(Col"&(4 + E50)&") \'\', sum(Col18) \'\'"); )';
  testBuild = formulaBuild.table2().data();
  if (formula !== testBuild) ConsoleLog.warn('Formula build failed: FormulaBuild.summary().table2().data()');
  sheet.getRange(53, 2).setFormula(formula);

  chart = sheet.newChart()
    .addRange(sheet.getRange('B52:B62'))
    .addRange(sheet.getRange('D52:D62'))
    .setNumHeaders(1)
    .setChartType(Charts.ChartType.PIE)
    .setPosition(50, 8, 0, 0)
    .setOption('mode', 'view')
    .setOption('legend', 'top')
    .setOption('focusTarget', 'category')
    .setOption('height', 447)
    .setOption('width', 444);

  sheet.insertChart(chart.build());

  formula = 'IF(AND(E50 > 0; _Settings!B7 > 0); INDEX(TRANSPOSE(QUERY({Tags!$B$1:$T}; "select -1 * sum(Col5), -1 * sum(Col6), -1 * sum(Col7), -1 * sum(Col8), -1 * sum(Col9), -1 * sum(Col10), -1 * sum(Col11), -1 * sum(Col12), -1 * sum(Col13), -1 * sum(Col14), -1 * sum(Col15), -1 * sum(Col16) where Col1=\'"&B70&"\' and (Col3=true or Col3=\'TRUE\') group by Col1")); 0; 2); )';
  testBuild = formulaBuild.table3().total();
  if (formula !== testBuild) ConsoleLog.warn('Formula build failed: FormulaBuild.summary().table3().total()');
  sheet.getRange(73, 4).setFormula(formula);

  options = {
    0: { color: '#b7b7b7', type: 'bars', labelInLegend: 'Total' },
    1: { color: '#45818e', type: 'bars', labelInLegend: 'Total' },
    2: { color: '#45818e', type: 'line', labelInLegend: 'Average' }
  };

  chart = sheet.newChart()
    .addRange(sheet.getRange('B73:B84'))
    .addRange(sheet.getRange('I73:K84'))
    .setChartType(Charts.ChartType.COMBO)
    .setPosition(70, 8, 0, 0)
    .setOption('mode', 'view')
    .setOption('legend', 'top')
    .setOption('focusTarget', 'category')
    .setOption('series', options)
    .setOption('height', 459)
    .setOption('width', 444);

  sheet.insertChart(chart.build());

  SpreadsheetApp.flush();
}
