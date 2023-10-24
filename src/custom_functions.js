/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

function BSSUMBYTAG (tag, range) {
  if (!Array.isArray(tag)) return
  if (!Array.isArray(tag[0])) return

  const n = tag[0].length - 1
  if (n < 1) return

  tag = tag[0].slice(1)

  const sum = new Array(n).fill(null)
  const pos = []

  let cr = 0
  // let regex = [];
  for (let i = 0; i < n; i++, cr++) {
    if (!/^\w+$/.test(tag[i])) continue

    // regex[cr] = tag[i];
    pos[cr] = i

    sum[i] = 0
    tag[i] = '#' + tag[i]
  }

  if (range === ''/* || regex.length === 0 */) return sum

  // regex = new RegExp('#(' + regex.join('|') + ')');
  // range = range.filter(r => regex.test(r[1]));

  for (const row of range) {
    for (let j = 0; j < cr; j++) {
      if (row[1].indexOf(tag[pos[j]]) > -1) {
        sum[pos[j]] += Number(row[0])
      }
    }
  }

  return sum
}
