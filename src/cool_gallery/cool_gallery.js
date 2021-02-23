function getGalleryTemplates () {
  const gallery = APPS_SCRIPT_GLOBAL.cool_gallery;
  const list = {};

  for (const key in gallery) {
    const template = gallery[key];

    list[key] = {
      name: template.name,
      description: template.description,
      preview_id: template.preview_id,
      version_name: template.version_name,
      version_date: template.version_date
    };
  }

  return list;
}

function coolGallery (option) {
  const ui = SpreadsheetApp2.getUi();

  let s;
  let info;

  info = APPS_SCRIPT_GLOBAL.cool_gallery;
  info = info[option];
  if (!info) {
    ConsoleLog.warn('getCoolSheet_(): Details of page not found.', { option: option, info: info });
    showDialogErrorMessage();
    return 2;
  }

  const lock = LockService.getDocumentLock();
  s = lock.tryLock(200);
  if (!s) {
    ui.alert(
      "Can't import analytics page",
      'Add-on is busy. Try again in a moment.',
      ui.ButtonSet.OK);
    return 0;
  }

  s = getCoolSheet_(info);
  lock.releaseLock();

  if (s === 0) {
    ui.alert(
      "Can't import analytics page",
      'A page with the name "' + info.sheet_name + '" already exists. Please rename, or delete the page.',
      ui.ButtonSet.OK);
    return -1;
  } else if (s === 1) {
    ui.alert(
      "Can't import analytics page",
      'The spreadsheet is not available. Try again later.',
      ui.ButtonSet.OK);
    return 1;
  }

  if (option === 'stats_for_tags') {
    coolStatsForTags_(info);
  } else if (option === 'filter_by_tag') {
    coolFilterByTag_(info);
  }

  console.info('add-on/cool_gallery/import/', info.sheet_name);
  return -1;
}

function getCoolSheet_ (info) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let template;

  if (spreadsheet.getSheetByName(info.sheet_name)) return 0;

  try {
    template = SpreadsheetApp.openById(info.id);
  } catch (err) {
    ConsoleLog.error(err);
    return 1;
  }

  template.getSheetByName(info.sheet_name)
    .copyTo(spreadsheet)
    .setName(info.sheet_name);
  SpreadsheetApp.flush();
}
