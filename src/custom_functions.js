function BSREPORT (data) {
  return [
    [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]
  ];
}

function BSSUMBYTAG (tag, range) {
  Utilities.sleep(300);

  let n = tag[0].length;
  if (n < 2) return;
  else n--;

  tag = tag[0];
  tag = tag.slice(1);

  const sum = [];
  const pos = [];

  let cr = 0;
  let regex = [];
  for (let i = 0; i < n; i++) {
    if (/^\S+$/.test(tag[i])) {
      sum[i] = [0];
      regex[cr] = tag[i];
      tag[i] = '#' + tag[i];

      pos[cr] = i;
      cr++;
    } else {
      sum[i] = [null];
    }
  }

  if (range === '' || regex.length === 0) return sum;

  regex = regex.map(e => {
    try {
      new RegExp('#(' + e + ')');
      return e;
    } catch (err) {
      return e.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
  }).join('|');

  regex = new RegExp('#(' + regex + ')');

  for (let i = 0; i < range.length; i++) {
    if (!range[i][1]) continue;
    if (!regex.test(range[i][1])) continue;

    for (let j = 0; j < cr; j++) {
      if (range[i][1].indexOf(tag[pos[j]]) !== -1) {
        sum[pos[j]][0] += Number(range[i][0]);
      }
    }
  }

  return sum;
}

function BSCARDPART (data) {
  Utilities.sleep(300);

  if (!data) return 0;

  const current = data[0];
  const max = data[1];
  const values = data[2];

  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    if (current[i] >= max[i]) continue;
    if (current[i] === '' || max[i] === '' || values[i] === '') continue;

    sum += (max[i] - current[i]) * values[i];
  }

  return sum;
}
