function onOpenInstallable_ (e) {
  if (e.authMode !== ScriptApp.AuthMode.FULL) return;

  try {
    AppsScript.loadCache();
  } catch (err) {
    LogLog.error(err);
  }
}

function onEditInstallable_ (e) {
  if (e.authMode !== ScriptApp.AuthMode.FULL) return;

  let name = '';

  try {
    const sheet = e.range.getSheet();
    name = sheet.getName();
  } catch (err) {
    LogLog.error(err);
  }

  if (name !== 'Quick Actions' && Consts.month_name.short.indexOf(name) === -1) return;

  if (name === 'Quick Actions') {
    try {
      quickActions_(e.range, e.value);
    } catch (err) {
      LogLog.error(err);
    } finally {
      e.range.setValue('');
    }
  } else {
    try {
      const mm = Consts.month_name.short.indexOf(name);
      const status = SettingsSpreadsheet.getValueOf('optimize_load');
      if (status == null || status[mm]) RecalculationService.resume(mm, mm + 1);
    } catch (err) {
      LogLog.error(err);
    }
  }
}

function quickActions_ (range, value) {
  if (value === '') return;

  const row = range.getRow();

  switch (row) {
    case 8:
      toolInsertRows(range.getSheet());
      break;
    case 12:
      if (value === 'Collapse') pagesView_('hide', 1);
      else if (value === 'Expand') pagesView_('show');
      break;

    default:
      break;
  }

  const mm = Consts.month_name.long.indexOf(value);
  if (mm === -1) return;

  switch (row) {
    case 3:
      toolInsertRows(range.getSheet());
      break;
    case 4:
      toolPicker_('FormatAccount', mm);
      break;
    case 5:
      toolPicker_('UpdateCashFlowMm', mm);
      break;

    case 9:
      toolPicker_('FormatCards', mm);
      break;

    default:
      break;
  }
}

function dailyTrigger_ (e) {
  if (isAuthorizationRequired_()) return;
  if (!AppsScript.isInstalled()) return;
  if (UpdateService.checkAndUpdate()) return;

  const date = Utils.getLocaleDate();
  const yyyymmdd = {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate()
  };

  const financial_year = SettingsConst.getValueOf('financial_year');

  if (financial_year < yyyymmdd.year) {
    treatLayout_(yyyymmdd.year, yyyymmdd.month);
    TriggersService.restart();
    return;
  }

  if (yyyymmdd.date === 1) {
    treatLayout_(yyyymmdd.year, yyyymmdd.month);

    try {
      if (yyyymmdd.month > 2) {
        RecalculationService.suspend(0, yyyymmdd.month);
      }
    } catch (err) {
      LogLog.error(err);
    }
  }

  if (SettingsUser.getValueOf('post_day_events')) {
    postEventsForDate_(date);
  }
}

function weeklyTriggerPos_ (e) {
  if (isAuthorizationRequired_()) return;
  if (!AppsScript.isInstalled()) return;

  UpdateService.checkAndUpdate();

  const date = Utils.getLocaleDate();
  const month = date.getMonth();

  if (month % 3 !== 0) return;

  const financial_year = SettingsConst.getValueOf('financial_year');
  const yyyy = date.getFullYear();

  if (yyyy > financial_year) {
    RecalculationService.suspend(0, 12);
  } else if (yyyy === financial_year && month >= 3) {
    RecalculationService.suspend(0, yyyymmdd.month);
  }
}

function weeklyTriggerPre_ (e) {
  if (isAuthorizationRequired_()) return;
  if (!AppsScript.isInstalled()) return;
  if (UpdateService.checkAndUpdate()) return;

  const financial_year = SettingsConst.getValueOf('financial_year');
  const date = Utils.getLocaleDate();
  const yyyymm = {
    year: date.getFullYear(),
    month: date.getMonth()
  };

  if (yyyymm.year > financial_year) return;

  treatLayout_(yyyymm.year, yyyymm.month);
  TriggersService.restart();
}
