class RangeUtils {
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