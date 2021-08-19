const MONTH_NAME = Object.freeze({
  short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
});

const DATE_NOW = new Date();

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

const RESERVED_HREF = Object.freeze({
  home_developer: 'https://www.budgetnsheets.com',
  home_app: 'https://www.budgetnsheets.com',
  home_help: 'https://www.budgetnsheets.com/support',
  privacy_policy: 'https://www.budgetnsheets.com/privacy-policy',
  terms_of_service: 'https://www.budgetnsheets.com/terms-of-service',
  join_forum: 'https://groups.google.com/g/add-on-budget-n-sheets-forum',
  send_feedback: 'https://docs.google.com/forms/d/e/1FAIpQLSfS1agp9AHRgRx7NXZrosd7ME6yfR4f_VR5b36NZZ832tRUWw/viewform?usp=sf_link',
  home_wiki: 'https://github.com/guimspace/budget-n-sheets/wiki',
  g_marketplace: 'https://gsuite.google.com/marketplace/app/budget_n_sheets/628594713587'
});

const APPS_SCRIPT_GLOBAL = Object.freeze({
  script_version: {
    major: 0,
    minor: 42,
    patch: 19
  },

  template_version: {
    major: 0,
    minor: 12,
    patch: 0
  },

  backup_version: {
    major: 0,
    minor: 1,
    patch: 0
  },

  template_id: '',
  template_sheets: ['_Settings', '_Unique', 'Cards', 'Summary', 'TTT', 'Cash Flow', 'Tags', 'Quick Actions', '_Backstage', '_About BnS'],

  cool_gallery: {
    stats_for_tags: {
      id: '',
      preview_id: '',
      version_name: 'v1.0.1',
      version_date: '2020-02-25',
      name: 'Stats for Tags',
      description: 'View stats for your tags by month, category, and tags.',
      sheet_name: 'Stats for Tags'
    },
    filter_by_tag: {
      id: '',
      version_name: 'v0.3.0',
      version_date: '2020-05-07',
      name: 'Filter by Tag',
      description: 'Filter and sort all trasactions by a selected tag.',
      sheet_name: 'Filter by Tag'
    }
  }
});
