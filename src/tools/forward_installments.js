function validateForwardInstallments_ () {
  const ranges = SpreadsheetApp.getActiveRangeList().getRanges();
  const sheet = ranges[0].getSheet();

  if (sheet.getSheetName() !== 'Cards') {
    SpreadsheetApp2.getUi().alert(
      "Can't forward installments",
      'Select sheet Cards to forward installments.',
      SpreadsheetApp2.getUi().ButtonSet.OK);
    return;
  }

  if (sheet.getLastRow() < 6) return;

  const _w = 6;
  let list = [];
  let isRangeOnly = false;
  let mm0 = -1;

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];

    const col = range.getColumn() - 1;
    if (col > 65) continue;

    if (col % 6 === 0 && range.getNumColumns() === 5) {
      if (!isRangeOnly) {
        isRangeOnly = true;
        mm0 = col / 6;
      } else if (col / 6 !== mm0) {
        continue;
      }

      fastForwardInstallments_(range);
    }

    if (isRangeOnly) continue;

    const mm = (col - (col % _w)) / _w;

    let last = range.getLastColumn() - 1;
    last = (last - (last % _w)) / _w + 1;
    if (last > 11) last = 11;

    for (let j = mm; j < last; j++) list.push(j);
  }

  if (isRangeOnly) return;

  list = list.filter((value, index, self) => {
                return self.indexOf(value) === index;
              })
              .sort((a, b) => {
                return a - b;
              });

  for (let i = 0; i < list.length; i++) {
    const numRows = sheet.getLastRow() - 5;
    const mm = list[i];

    let range = sheet.getRange(6, 1 + _w * mm, numRows, 5);
    const snapshot = range.getValues();

    let n = 0;
    while (n < snapshot.length && snapshot[n][3] !== '') { n++; }
    if (n === 0) return;

    range = range.offset(0, 0, n, 5);

    forwardInstallments_(range);
  }
}

function fastForwardInstallments_ (range) {
  const snapshot = range.getValues();
  const list = [];

  for (let i = 0; i < snapshot.length; i++) {
    if (snapshot[i][1] === '') continue;

    const match = snapshot[i][1].match(/((\d+)\/(\d+))/);
    if (!match) continue;

    const p1 = +match[2];
    const p2 = +match[3];
    if (p1 >= p2) continue;

    if (snapshot[i][0] > 0) snapshot[i][0] *= -1;

    const value = FormatNumber.localeSignal(snapshot[i][3]);
    snapshot[i][3] = '';

    list.push({
      line: snapshot[i],
      value: value,

      reg: match[1],
      p1: p1,
      p2: p2
    });
  }

  if (list.length === 0) return;

  const sheet = range.getSheet();

  const _w = 6;
  const col = range.getColumn() - 1;

  let mm = (col - (col % _w)) / _w + 1;
  while (list.length > 0 && mm < 12) {
    const merge = { table: [], values: [] };

    for (let i = 0; i < list.length; i++) {
      list[i].p1++;

      const line = list[i].line.slice();
      line[1] = line[1].replace(list[i].reg, list[i].p1 + '/' + list[i].p2);

      merge.table.push(line);
      merge.values.push(list.value);

      if (list[i].p1 === list[i].p2) {
        list.splice(i, 1);
        i--;
      }
    }

    mergeEventsInTable_(sheet, merge, { name: 'cards', k: mm });
    mm++;
  }

  SpreadsheetApp.flush();
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
  if (merge.table.length > 0) SpreadsheetApp.flush();
}