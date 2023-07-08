/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RestoreCopy extends SetupSuperCopy {
  constructor (config) {
    super(config)
  }

  copyCardsData_ () {
    const source = this.source.getSheetByName('Cards');
    if (!source) return;
    const numRows = source.getLastRow() - 5;
    if (numRows < 1) return;

    const destination = this.destination.getSheetByName('Cards');
    new ToolInsertRowsCards().insertRowsTo(5 + numRows, true);

    const values = source.getRange(6, 1, numRows, 6 * 12).getValues();
    destination.getRange(6, 1, numRows, 6 * 12).setValues(values);
  }

  copyTables_ () {
    if (this.name_accounts.length === 0) return

    const metadata = JSON.parse(this.metadata.get('db_accounts'));
    const accountsService = new AccountsService();

    this.name_accounts.forEach(e => {
      const acc = accountsService.getByName(e.name);
      if (acc) accountsService.update(acc.id, metadata[e.prevIndex]);
    });

    accountsService.save();
    accountsService.flush();
  }

  copyTtt_ () {
    let mm = -1;
    while (++mm < 12) {
      const source = this.source.getSheetByName(Consts.month_name.short[mm]);
      if (!source) continue;
      const numRows = source.getLastRow() - 4;
      if (numRows < 1) continue;

      const sheet = this.destination.getSheetByName(Consts.month_name.short[mm]);
      new ToolInsertRowsMonth(mm).insertRowsTo(4 + numRows, true);

      const values = source.getRange(5, 1, numRows, 4).getValues();
      sheet.getRange(5, 1, numRows, 4).setValues(values);

      this.name_accounts.forEach(e => {
        const values = source.getRange(5, 1 + 5 * (1 + e.prevIndex), numRows, 4).getValues();
        sheet.getRange(5, 1 + 5 * (1 + e.index), numRows, 4).setValues(values);
      });
    }
  }

  copy () {
    this.copyTables_();
    this.copyCards_()
    this.copyTtt_();
    this.copyCardsData_();
    this.copyTags_();
    this.copySettings_();
  }
}
