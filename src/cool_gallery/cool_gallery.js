function coolGallery (option) {
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(200);
  } catch (err) {
    return;
  }

  let info;
  switch (option) {
    case 'filter_by_tag':
      info = CoolGalleryMetadata.getFilterByTag();
      break;
    case 'stats_for_tags':
      info = CoolGalleryMetadata.getStatsForTags();
      break;

    default:
      throw new Error('Details of page not found.');
  }

  const ui = SpreadsheetApp2.getUi();

  const status = importGalleryTemplate_(info.id, info.sheet_name);
  lock.releaseLock();

  if (status === 0) {
    ui.alert(
      "Can't import analytics page",
      'A page with the name "' + info.sheet_name + '" already exists. Please rename, or delete the page.',
      ui.ButtonSet.OK);
    return;
  } else if (status === 1) {
    ui.alert(
      "Can't import analytics page",
      'The spreadsheet is not available. Try again later.',
      ui.ButtonSet.OK);
    return;
  }

  if (option === 'stats_for_tags') coolStatsForTags_(info);
  else if (option === 'filter_by_tag') coolFilterByTag_(info);
}

function importGalleryTemplate_ (id, name) {
  const spreadsheet = SpreadsheetApp2.getActiveSpreadsheet();
  let template;

  if (spreadsheet.getSheetByName(name)) return 0;

  try {
    template = SpreadsheetApp.openById(id);
  } catch (err) {
    LogLog.error(err);
    return 1;
  }

  const sheet = template.getSheetByName(name)
    .copyTo(spreadsheet)
    .setName(name);

  SpreadsheetApp.flush();
}
