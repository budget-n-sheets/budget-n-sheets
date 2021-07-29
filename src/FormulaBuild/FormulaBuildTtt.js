class FormulaBuildTtt {
  static header () {
    return FormulaBuildTttHeader;
  }
}

class FormulaBuildTttHeader {
  static balance (index, mm) {
    const balance = rollA1Notation(3 + TABLE_DIMENSION.height * mm, 7 + TABLE_DIMENSION.width * index);

    return 'CONCAT("Balance "; TO_TEXT(_Backstage!' + balance + '))';
  }

  static expenses (index, mm) {
    const expenses = rollA1Notation(4 + TABLE_DIMENSION.height * mm, 7 + TABLE_DIMENSION.width * index);

    return 'CONCAT("Expenses "; TO_TEXT(_Backstage!' + expenses + '))';
  }

  static report (index, mm) {
    const _h = TABLE_DIMENSION.height;
    const _w = TABLE_DIMENSION.width;

    let part_1, part_2, part_3, part_4;

    part_1 = 'TO_TEXT(_Backstage!' + rollA1Notation(2 + _h * mm, 8 + _w * index) + ')';
    part_1 = '"Withdrawal: ["; _Backstage!' + rollA1Notation(2 + _h * mm, 9 + _w * index) + '; "] "; ' + part_1 + '; "\n"; ';

    part_2 = 'TO_TEXT(_Backstage!' + rollA1Notation(3 + _h * mm, 8 + _w * index) + ')';
    part_2 = '"Deposit: ["; _Backstage!' + rollA1Notation(3 + _h * mm, 9 + _w * index) + '; "] "; ' + part_2 + '; "\n"; ';

    part_3 = 'TO_TEXT(_Backstage!' + rollA1Notation(4 + _h * mm, 8 + _w * index) + ')';
    part_3 = '"Trf. in: ["; _Backstage!' + rollA1Notation(4 + _h * mm, 9 + _w * index) + '; "] "; ' + part_3 + '; "\n"; ';

    part_4 = 'TO_TEXT(_Backstage!' + rollA1Notation(5 + _h * mm, 8 + _w * index) + ')';
    part_4 = '"Trf. out: ["; _Backstage!' + rollA1Notation(5 + _h * mm, 9 + _w * index) + '; "] "; ' + part_4;

    return 'CONCATENATE(' + part_1 + part_2 + part_3 + part_4 + ')';
  }
}
