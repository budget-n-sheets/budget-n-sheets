/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

const CACHE_KEYS = ['class_version2', 'admin_settings', 'user_settings', 'spreadsheet_settings', 'const_properties', 'db_accounts', 'db_cards', 'DB_CALENDARS', 'is_installed', 'load_cache'];

const TABLE_DIMENSION = Object.freeze({ height: 10, width: 5 });

const SPREADSHEET_SPECS = Object.freeze({
  initial_height: 400,

  ttt: {
    header: ['day', 'transaction', 'value', 'tags'],
    width: 4,
    row: 5
  },

  cards: {
    header: ['day', 'transaction', 'card', 'value', 'tags'],
    width: 5,
    row: 6
  },

  cash_flow: {
    header: ['flow', 'balance', 'transactions'],
    width: 3,
    row: 4
  },

  tags: {
    header: ['name', 'category', 'description', 'analytics', 'code']
  },

  backstage: {
    square: {
      height: 10,
      width: 5
    }
  }
});
