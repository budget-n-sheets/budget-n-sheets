function getTagData_ () {
  const data = {
    tags: [],
    months: [],
    average: [],
    total: []
  };

  const sheet = SpreadsheetApp2.getActiveSpreadsheet().getSheetByName('Tags');
  if (!sheet) return data;
  if (sheet.getMaxColumns() < 20) return data;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return data;

  const table = sheet.getRange(2, 5, lastRow - 1, 16).getValues();

  for (let i = 0; i < table.length; i++) {
    if (table[i][0] === '' || !/^\w+$/.test(table[i][0])) continue;

    data.tags[i] = table[i][0];
    data.months[i] = table[i].slice(1, 13);
    data.average[i] = table[i][14];
    data.total[i] = table[i][15];
  }

  return data;
}
