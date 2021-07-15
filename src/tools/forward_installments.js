function validateForwardInstallments_ () {
  const activeRange = SpreadsheetApp.getActiveRange();
  const sheet = activeRange.getSheet();

  if (sheet.getSheetName() !== 'Cards') {
    SpreadsheetApp2.getUi().alert(
      "Can't forward installments",
      'Select sheet Cards to forward installments.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return;
  }

  const numRows = sheet.getLastRow() - 5;
  if (numRows < 1) return;

  const col = activeRange.getColumn() - 1;
  if (col > 65) return;

  if (col % 6 === 0 && activeRange.getNumColumns() === 5) {
    forwardInstallments_(activeRange);
    return;
  }

  const _w = 6;
  const mm = (col - (col % _w)) / _w;

  let range = sheet.getRange(6, 1 + _w * mm, numRows, 5);
  const snapshot = range.getValues();

  let n = 0;
  while (n < snapshot.length && snapshot[n][3] !== '') { n++; }
  if (n === 0) return;

  range = range.offset(0, 0, n, 5);

  forwardInstallments_(range);
}

function forwardInstallments_ (range) {
  const merge = { table: [], values: [] };
  const snapshot = range.getValues();

  for (let i = 0; i < snapshot.length; i++) {
    if (snapshot[i][1] === '') continue;

    let match = snapshot[i][1].match(/((\d+)\/(\d+))/);
    if (!match) continue;

    let p1 = +match[2];
    const p2 = +match[3];

    if (p1 >= p2) continue;
    p1++;

    if (snapshot[i][0] > 0) snapshot[i][0] *= -1;

    snapshot[i][1] = snapshot[i][1].replace(match[1], p1 + "/" + p2);

    const value = FormatNumber.localeSignal(snapshot[i][3]);
    snapshot[i][3] = '';

    merge.table.push(snapshot[i]);
    merge.values.push(value);
  }

  const sheet = range.getSheet();

  const _w = 6;
  const col = range.getColumn() - 1;
  const mm = (col - (col % _w)) / _w;

  mergeEventsInTable_(sheet, merge, { name: 'cards', k: (mm + 1) });
}
