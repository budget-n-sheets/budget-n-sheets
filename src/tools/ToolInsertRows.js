class ToolInsertRows {
  constructor (sheet) {
    if (sheet) {
      this._sheet = sheet;
      this._maxRows = sheet.getMaxRows();
    }
  }

  static pick (sheet) {
    const name = sheet.getName();
    switch (name) {
      case 'Cards':
        return new ToolInsertRowsCards(sheet);
      case 'Tags':
        return new ToolInsertRowsTags(sheet);

      default:
        break;
    }

    if (Consts.month_name.short.indexOf(name) === -1) return 1;
    return new ToolInsertRowsMonth(sheet);
  }

  static showWarning () {
    SpreadsheetApp2.getUi().alert(
      "Can't insert rows",
      'Select a month, Cards or Tags to insert rows.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
  }

  insertNumRows_ (numRows) {
    if (this._maxRows < this._headerRow + 3) return 1;
    this._sheet.insertRowsBefore(this._maxRows, numRows);
    this._maxRows += numRows;

    if (this._sheet.getLastRow() === this._maxRows) {
      const maxCols = this._sheet.getMaxColumns();
      const range = this._sheet.getRange(this._maxRows, 1, 1, maxCols);
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
    const diff = this._maxRows - this._sheet.getLastRow();
    if (diff > height) return 1;
    this.insertNumRows_(height - diff + (extras ? 100 : 0));
    return this;
  }

  setSheet (sheet) {
    this._sheet = sheet;
    this._maxRows = sheet.getMaxRows();
    return this;
  }
}

class ToolInsertRowsMonth extends ToolInsertRows {
  constructor (sheet) {
    super(sheet);
    this._headerRow = 4;
  }
}

class ToolInsertRowsCards extends ToolInsertRows {
  constructor (sheet) {
    super(sheet);
    this._headerRow = 5;
  }
}

class ToolInsertRowsTags extends ToolInsertRows {
  constructor (sheet) {
    super(sheet);
    this._headerRow = 1;
  }
}
