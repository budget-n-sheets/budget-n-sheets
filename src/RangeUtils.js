/**
 * Budget n Sheets Copyright 2017-2023 Guilherme T Maeoka
 * <https://github.com/budget-n-sheets/budget-n-sheets>
 *
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions.
 * <https://www.gnu.org/licenses/>
 */

class RangeUtils {
  static filterTableRanges (ranges, specs) {
    const selected = { indexes: [], ranges: [] };
    const w = specs.width + 1;

    for (const range of ranges) {
      const column = range.getColumn() - 1;

      if (column % w === 0 && range.getNumColumns() === specs.width) {
        selected.ranges.push(range);
      } else {
        const last = range.getLastColumn() - 1;

        const start = (column - (column % w)) / w;
        const end = (last - (last % w)) / w;

        for (let i = start; i <= end; i++) {
          selected.indexes.push(i);
        }
      }
    }

    return selected;
  }

  static rollA1Notation (posRow, posCol, height, width, mode1, mode2) {
    if (!posRow || !posCol) return;
    if (!height) height = 1;
    if (!width) width = 1;
    if (!mode1) mode1 = 1;
    if (!mode2) mode2 = 1;

    posCol--;
    width--;
    mode1--;
    mode2--;

    let str, c, m;

    const f_ = 26;
    const s_ = 4;

    m = mode1 % s_;
    str = ((m === 1 || m === 3) ? '$' : '');

    c = (posCol - posCol % f_) / f_;
    str += (c ? String.fromCharCode(64 + c) : '');
    str += String.fromCharCode(65 + posCol % f_);

    str += (m >= 2 ? '$' : '');
    str += posRow;

    if (height === 1 && width === 0) return str;
    else {
      str += ':';
      posCol += width;

      m = mode2 % s_;
      str += ((m === 1 || m === 3) ? '$' : '');

      c = (posCol - posCol % f_) / f_;
      str += (c ? String.fromCharCode(64 + c) : '');
      str += String.fromCharCode(65 + posCol % f_);

      if (height !== -1) {
        str += (m >= 2 ? '$' : '');
        str += posRow + height - 1;
      }
    }

    return str;
  }
}
