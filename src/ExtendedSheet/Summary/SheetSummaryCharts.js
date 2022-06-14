class SheetSummaryCharts extends SheetSummary {
  constructor () {
    super();

    this._spreadsheetId = SpreadsheetApp2.getActiveSpreadsheet().getId();
    this._sheetId = this._sheet.getSheetId();
  }

  insertChart1 () {
    const request = { addChart: { chart: { position: { overlayPosition: { widthPixels: 886, heightPixels: 482, anchorCell: { sheetId: this._sheetId, rowIndex: 23, columnIndex: 1 } } }, spec: { hiddenDimensionStrategy: 'SKIP_HIDDEN_ROWS_AND_COLUMNS', basicChart: { headerCount: 1, chartType: 'COMBO', legendPosition: 'TOP_LEGEND', compareMode: 'CATEGORY', interpolateNulls: true, domains: [{ domain: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 23, endRowIndex: 36, startColumnIndex: 2, endColumnIndex: 3 }] } } }], series: [{ type: 'COLUMN', targetAxis: 'LEFT_AXIS', color: { red: 183 / 255, green: 183 / 255, blue: 183 / 255 }, colorStyle: { rgbColor: { red: 183 / 255, green: 183 / 255, blue: 183 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 23, endRowIndex: 36, startColumnIndex: 3, endColumnIndex: 4 }] } } }, { type: 'COLUMN', targetAxis: 'LEFT_AXIS', color: { red: 204 / 255, green: 204 / 255, blue: 204 / 255 }, colorStyle: { rgbColor: { red: 204 / 255, green: 204 / 255, blue: 204 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 23, endRowIndex: 36, startColumnIndex: 4, endColumnIndex: 5 }] } } }, { type: 'COLUMN', targetAxis: 'LEFT_AXIS', color: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 }, colorStyle: { rgbColor: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 23, endRowIndex: 36, startColumnIndex: 5, endColumnIndex: 6 }] } } }, { type: 'COLUMN', targetAxis: 'LEFT_AXIS', color: { red: 230 / 255, green: 145 / 255, blue: 56 / 255 }, colorStyle: { rgbColor: { red: 230 / 255, green: 145 / 255, blue: 56 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 23, endRowIndex: 36, startColumnIndex: 6, endColumnIndex: 7 }] } } }, { type: 'LINE', targetAxis: 'LEFT_AXIS', color: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 }, colorStyle: { rgbColor: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 23, endRowIndex: 36, startColumnIndex: 7, endColumnIndex: 8 }] } } }, { type: 'LINE', targetAxis: 'LEFT_AXIS', color: { red: 230 / 255, green: 145 / 255, blue: 56 / 255 }, colorStyle: { rgbColor: { red: 230 / 255, green: 145 / 255, blue: 56 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 23, endRowIndex: 36, startColumnIndex: 8, endColumnIndex: 9 }] } } }] } } } } };

    Sheets.Spreadsheets.batchUpdate({ requests: [request] }, this._spreadsheetId);

    return this;
  }

  insertChart2 () {
    const chart = this._sheet.newChart()
      .addRange(this._sheet.getRange('B54:B64'))
      .addRange(this._sheet.getRange('D54:D64'))
      .setNumHeaders(1)
      .setChartType(Charts.ChartType.PIE)
      .setPosition(52, 8, 0, 0)
      .setOption('mode', 'view')
      .setOption('legend', 'top')
      .setOption('focusTarget', 'category')
      .setOption('height', 447)
      .setOption('width', 444)
      .build();

    this._sheet.insertChart(chart);

    return this;
  }

  insertChart3 () {
    const request = { addChart: { chart: { position: { overlayPosition: { widthPixels: 444, heightPixels: 459, anchorCell: { sheetId: this._sheetId, rowIndex: 71, columnIndex: 7 } } }, spec: { hiddenDimensionStrategy: 'SKIP_HIDDEN_ROWS_AND_COLUMNS', basicChart: { headerCount: 1, chartType: 'COMBO', legendPosition: 'TOP_LEGEND', compareMode: 'CATEGORY', interpolateNulls: true, domains: [{ domain: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 74, endRowIndex: 86, startColumnIndex: 1, endColumnIndex: 2 }] } } }], series: [{ type: 'COLUMN', targetAxis: 'LEFT_AXIS', color: { red: 183 / 255, green: 183 / 255, blue: 183 / 255 }, colorStyle: { rgbColor: { red: 183 / 255, green: 183 / 255, blue: 183 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 73, endRowIndex: 86, startColumnIndex: 8, endColumnIndex: 9 }] } } }, { type: 'COLUMN', targetAxis: 'LEFT_AXIS', color: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 }, colorStyle: { rgbColor: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 73, endRowIndex: 86, startColumnIndex: 9, endColumnIndex: 10 }] } } }, { type: 'LINE', targetAxis: 'LEFT_AXIS', color: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 }, colorStyle: { rgbColor: { red: 69 / 255, green: 129 / 255, blue: 142 / 255 } }, series: { sourceRange: { sources: [{ sheetId: this._sheetId, startRowIndex: 73, endRowIndex: 86, startColumnIndex: 10, endColumnIndex: 11 }] } } }] } } } } };

    Sheets.Spreadsheets.batchUpdate({ requests: [request] }, this._spreadsheetId);

    return this;
  }

  removeAllCharts () {
    this._sheet.getCharts().forEach(chart => this._sheet.removeChart(chart));

    return this;
  }
}