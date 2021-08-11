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
  const listRanges = [];
  let isRangeOnly = false;
  let mm0 = 12;

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];

    const col = range.getColumn() - 1;
    if (col > 65) continue;

    if (col % _w === 0 && range.getNumColumns() === 5) {
      isRangeOnly = true;

      const mm = col / _w;
      if (mm < mm0) mm0 = mm;

      listRanges.push({
        range: range,
        mm: mm
      });
    } else if (!isRangeOnly) {
      const mm = (col - (col % _w)) / _w;

      let last = range.getLastColumn() - 1;
      last = (last - (last % _w)) / _w + 1;
      if (last > 11) last = 11;

      for (let j = mm; j < last; j++) list.push(j);
    }
  }

  for (let i = 0; i < listRanges.length; i++) {
    if (listRanges[i].mm !== mm0) continue;
    fastForwardInstallments_(listRanges[i].range);
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
  const ledger = new LedgerCards(sheet);

  const _w = 6;
  const col = range.getColumn() - 1;

  let mm = (col - (col % _w)) / _w + 1;
  while (list.length > 0 && mm < 12) {
    const merge = [];

    for (let i = 0; i < list.length; i++) {
      list[i].p1++;

      const line = list[i].line.slice();
      line[1] = line[1].replace(list[i].reg, list[i].p1 + '/' + list[i].p2);
      line[3] = '=' + FormatNumber.localeSignal(line[3]);

      merge.push(line);

      if (list[i].p1 === list[i].p2) {
        list.splice(i, 1);
        i--;
      }
    }

    ledger.mergeTransactions(mm, merge);
    SpreadsheetApp.flush();
    mm++;
  }
}

function forwardInstallments_ (range) {
  const snapshot = range.getValues();

  const merge = [];
  for (let i = 0; i < snapshot.length; i++) {
    if (snapshot[i][1] === '') continue;

    const match = snapshot[i][1].match(/((\d+)\/(\d+))/);
    if (!match) continue;

    let p1 = +match[2];
    const p2 = +match[3];

    if (p1 >= p2) continue;
    p1++;

    if (snapshot[i][0] > 0) snapshot[i][0] *= -1;

    snapshot[i][1] = snapshot[i][1].replace(match[1], p1 + '/' + p2);
    snapshot[i][3] = '=' + FormatNumber.localeSignal(snapshot[i][3]);

    merge.push(snapshot[i]);
  }

  const _w = 6;
  const col = range.getColumn() - 1;
  const mm = (col - (col % _w)) / _w + 1;

  if (mm < 12 && merge.length > 0) {
    const sheet = range.getSheet();
    if (sheet) {
      new LedgerCards(sheet).mergeTransactions(mm, merge);
      SpreadsheetApp.flush();
    }
  }
}
