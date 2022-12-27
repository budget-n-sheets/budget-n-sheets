/**
 * Budget n Sheets Copyright 2017-2022 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

const Goldfish = {
  db: {
    accounts: null,
    cards: null
  },
  spreadsheet: {
    _self: {},
    metadata: null,
    sheets: {}
  }
};

class RapidAccess {
  static db () {
    return new RapidAccessDb(Goldfish.db);
  }

  static spreadsheet () {
    return new RapidAccessSpreadsheet(Goldfish.spreadsheet);
  }
}
