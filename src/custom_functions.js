function BSBLANK (array) {
  Utilities.sleep(200);
  if (!Array.isArray(array)) return 1;
  if (!Array.isArray(array[0])) return 1;

  const n = array[0].indexOf('');
  return (n > -1 ? n + 1 : array[0].length);
}

function BSREPORT (data) {
  Utilities.sleep(300);

  const stats = [
    [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]
  ];

  if (data === '') return stats;

  const sum_range = data[0];
  const range = data[1];

  let i = -1;
  const n = sum_range.length;

  while (++i < n && sum_range[i] !== '') {
    if (range[i].indexOf('#wd') !== -1 && sum_range[i] <= 0) {
      stats[0][1]++;
      stats[0][0] += sum_range[i];
    }

    if (range[i].indexOf('#dp') !== -1 && sum_range[i] >= 0) {
      stats[1][1]++;
      stats[1][0] += sum_range[i];
    }

    if (range[i].indexOf('#trf') !== -1) {
      if (sum_range[i] >= 0) {
        stats[2][1]++;
        stats[2][0] += sum_range[i];
      } else {
        stats[3][1]++;
        stats[3][0] += sum_range[i];
      }
    }

    if (range[i].indexOf('#rct') !== -1) {
      stats[4][0] += sum_range[i];
    }
  }

  return stats;
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
