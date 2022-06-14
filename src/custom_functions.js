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
    if (/^\w+$/.test(tag[i])) {
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
  regex = new RegExp('#(' + regex.join('|') + ')');

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
  return 0;
}
