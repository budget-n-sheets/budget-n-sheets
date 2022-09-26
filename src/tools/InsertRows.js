class InsertRows {
  constructor (sheet) {
    this.sheet = sheet;
    this._maxRows = sheet.getMaxRows();
  }

  static pick (sheet) {
    const name = sheet.getName();
    switch (name) {
      case 'Cards':
        return new ToolInsertRowsCards();
      case 'Tags':
        return new ToolInsertRowsTags();

      default:
        break;
    }

    const mm = Consts.month_name.short.indexOf(name);
    if (mm === -1) return 1;
    return new ToolInsertRowsMonth(mm);
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't insert rows",
      'Select a month, Cards or Tags to insert rows.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  insertNumRows_ (numRows) {
    if (this._maxRows < this._headerRow + 3) return 1;
    this.sheet.insertRowsBefore(this._maxRows, numRows);
    this._maxRows += numRows;

    if (this.sheet.getLastRow() === this._maxRows) {
      const maxCols = this.sheet.getMaxColumns();
      const range = this.sheet.getRange(this._maxRows, 1, 1, maxCols);
      const values = range.getValues();

      range.clearContent()
        .offset(0 - numRows, 0)
        .setValues(values);
    }

    SpreadsheetApp.flush();
  }

  insertRows () {
    this.insertNumRows_(400);
    return this;
  }

  insertRowsTo (height, extras) {
    if (this._maxRows >= height) return this;
    this.insertNumRows_(height - this._maxRows + (extras ? 100 : 0));
    return this;
  }
}

class ToolInsertRowsMonth extends InsertRows {
  constructor (mm) {
    const name = Consts.month_name.short[mm];
    const sheet = SpreadsheetApp2.getActive().getSheetByName(name);
    super(sheet);

    this._headerRow = 4;
  }
}

class ToolInsertRowsCards extends InsertRows {
  constructor () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Cards');
    super(sheet);

    this._headerRow = 5;
  }
}

class ToolInsertRowsTags extends InsertRows {
  constructor () {
    const sheet = SpreadsheetApp2.getActive().getSheetByName('Tags');
    super(sheet);

    this._headerRow = 1;
  }
}
