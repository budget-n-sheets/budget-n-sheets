function setupCashFlow_() {
	var sheet = SPREADSHEET.getSheetByName("Cash Flow");
	var ranges, formula, b_f3f3f3, b_d9ead3;
	var d, s;
	var i, j, k;

	const h_ = TABLE_DIMENSION.height;

	const init_month = SETUP_SETTINGS["init_month"];
	const dec_p = SETUP_SETTINGS["decimal_separator"];
	const num_acc = SETUP_SETTINGS["number_accounts"];
	const financial_year = SETUP_SETTINGS["financial_year"];

	const dec_c = (dec_p ? "," : "\\");
	const options = "{\"charttype\"" + dec_c + "\"column\"; \"color\"" + dec_c + "\"#93c47d\"; \"negcolor\"" + dec_c + "\"#e06666\"; \"empty\"" + dec_c + "\"zero\"; \"nan\"" + dec_c + "\"convert\"}";

	ranges = [ ];
	for (i = 0; i < 12; i++) {
		ranges[2*i] = sheet.getRange(4, 2 + 4*i, 31);
		ranges[2*i + 1] = sheet.getRange(4, 4 + 4*i, 31);
	}

	sheet.protect()
		.setUnprotectedRanges(ranges)
		.setWarningOnly(true);

	// if (financial_year == 2020) {
	// 	ranges = [ "C4:C33", "G4:G31", "K4:K33", "O4:O32", "S4:S33", "W4:W32", "AA4:AA33", "AE4:AE33", "AI4:AI32", "AM4:AM33", "AQ4:AQ32", "AU4:AU33" ];
	//
	// 	b_f3f3f3 = [ "F32:H33", "N33:P33", "V33:X33", "AH33:AJ33", "AP33:AR33" ];
	//
	// 	b_d9ead3 = [ "B6:D6", "B7:D7", "B13:D13", "B14:D14", "B20:D20", "B21:D21", "B27:D27", "B28:D28", "F3:H3", "F4:H4", "F10:H10", "F11:H11", "F17:H17", "F18:H18", "F24:H24", "F25:H25", "F31:H31", "J3:L3", "J9:L9", "J10:L10", "J16:L16", "J17:L17", "J23:L23", "J24:L24", "J30:L30", "J31:L31", "N6:P6", "N7:P7", "N13:P13", "N14:P14", "N20:P20", "N21:P21", "N27:P27", "N28:P28", "R4:T4", "R5:T5", "R11:T11", "R12:T12", "R18:T18", "R19:T19", "R25:T25", "R26:T26", "R32:T32", "R33:T33", "V8:X8", "V9:X9", "V15:X15", "V16:X16", "V22:X22", "V23:X23", "V29:X29", "V30:X30", "Z6:AB6", "Z7:AB7", "Z13:AB13", "Z14:AB14", "Z20:AB20", "Z21:AB21", "Z27:AB27", "Z28:AB28", "AD3:AF3", "AD4:AF4", "AD10:AF10", "AD11:AF11", "AD17:AF17", "AD18:AF18", "AD24:AF24", "AD25:AF25", "AD31:AF31", "AD32:AF32", "AH7:AJ7", "AH8:AJ8", "AH14:AJ14", "AH15:AJ15", "AH21:AJ21", "AH22:AJ22", "AH28:AJ28", "AH29:AJ29", "AL5:AN5", "AL6:AN6", "AL12:AN12", "AL13:AN13", "AL19:AN19", "AL20:AN20", "AL26:AN26", "AL27:AN27", "AL33:AN33", "AP3:AR3", "AP9:AR9", "AP10:AR10", "AP16:AR16", "AP17:AR17", "AP23:AR23", "AP24:AR24", "AP30:AR30", "AP31:AR31", "AT7:AV7", "AT8:AV8", "AT14:AV14", "AT15:AV15", "AT21:AV21", "AT22:AV22", "AT28:AV28", "AT29:AV29" ];
	//
	// 	for (i = 1; i < 12; i++) {
	// 		d = new Date(financial_year, i, 0).getDate();
	// 		sheet.getRange(4, 3 + 4*i).setFormulaR1C1("=R[" + (d - 1) + "]C[-4] + RC[-1]");
	// 	}
	// } else {
		ranges = [ ];
		b_f3f3f3 = [ ];
		b_d9ead3 = [ ];

		i = 0;
		d = new Date(financial_year, 1 + i, 0).getDate();
		ranges.push([ rollA1Notation(5, 3 + 4*i, d - 1) ]);
		if (d < 31) {
			b_f3f3f3.push([ rollA1Notation(4 + d, 2 + 4*i, 31 - d, 3) ]);
		}

		formula = "SPARKLINE(" + rollA1Notation(4, 3 + 4*i, d, 1) + "; " + options + ")";
		sheet.getRange(2, 2 + 4*i).setFormula(formula);

		j = 0;
		s = new Date(financial_year, 0, 1).getDay();
		while (j < d) {
			switch (s) {
				case 0:
					b_d9ead3.push([ rollA1Notation(4 + j, 2, 1, 3) ]);
					s += 6;
					j += 6;
					break;
				case 6:
					b_d9ead3.push([ rollA1Notation(4 + j, 2, 1, 3) ]);
					s = 0;
					j++;
					break;
				default:
					s = (s + 1)%7;
					j++;
					break;
			}
		}

		for (i = 1; i < 12; i++) {
			sheet.getRange(4, 3 + 4*i).setFormulaR1C1("=R[" + (d - 1) + "]C[-4] + RC[-1]");

			d = new Date(financial_year, 1 + i, 0).getDate();
			ranges.push([ rollA1Notation(5, 3 + 4*i, d - 1) ]);
			if (d < 31) {
				b_f3f3f3.push([ rollA1Notation(4 + d, 2 + 4*i, 31 - d, 3) ]);
			}

			formula = "SPARKLINE(" + rollA1Notation(4, 3 + 4*i, d, 1) + "; " + options + ")";
			sheet.getRange(2, 2 + 4*i).setFormula(formula);

			j = 0;
			s = new Date(financial_year, i, 1).getDay();
			while (j < d) {
				switch (s) {
					case 0:
						b_d9ead3.push([ rollA1Notation(4 + j, 2 + 4*i, 1, 3) ]);
						s = 6;
						j += 6;
						break;
					case 6:
						b_d9ead3.push([ rollA1Notation(4 + j, 2 + 4*i, 1, 3) ]);
						s = 0;
						j++;
						break;
					default:
						s = (s + 1)%7;
						j++;
						break;
				}
			}
		}
	// }

	sheet.getRangeList(ranges).setFormulaR1C1("=R[-1]C + RC[-1]");
	sheet.getRangeList(b_f3f3f3).setBackground("#f3f3f3");
	sheet.getRangeList(b_d9ead3).setBackground("#d9ead3");

	ranges = [ "G", "L", "Q", "V", "AA" ];

	sheet.getRange(4, 3).setFormula("=0 + B4");

	if (init_month == 0) {
		formula = "=0 + B4";
	} else {
		d = new Date(financial_year, init_month, 0).getDate();
		formula = "=" + rollA1Notation(3 + d, 4*init_month - 1) + " + " + rollA1Notation(4, 2 + 4*init_month);
	}

	for (k = 0; k < num_acc; k++) {
		 formula += " + \'_Backstage\'!" + ranges[k] + (2 + h_*init_month);
	}
	sheet.getRange(4, 3 + 4*init_month).setFormula(formula);

	if (SETUP_SETTINGS['decimal_places'] !== 2) {
    const list_format = [];

    for (let i = 0; i < 12; i++) {
      list_format[i] = rollA1Notation(4, 2 + 4 * i, 31, 2);
    }

    sheet.getRangeList(list_format).setNumberFormat(SETUP_SETTINGS['number_format']);
  }

	SpreadsheetApp.flush();
}
