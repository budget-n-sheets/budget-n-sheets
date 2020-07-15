function setupTags_() {
	var sheet = SPREADSHEET.getSheetByName("Tags");
	var ranges, formula, rg, cd;
	var i, k;

  const h_ = TABLE_DIMENSION.height;
  const w_ = TABLE_DIMENSION.width;

  const tags = [ "D5:D404", "I5:I404", "N5:N404", "S5:S404", "X5:X404", "AC5:AC404" ];
  const combo = [ "C5:D404", "H5:I404", "M5:N404", "R5:S404", "W5:X404", "AB5:AC404" ];

  const num_acc = SETUP_SETTINGS["number_accounts"];

  const formulas = [[ ]];
  const col = 11 + w_*num_acc;

	ranges = sheet.getRange(2, 1, 90, 5);
	sheet.protect()
		.setUnprotectedRanges([ ranges ])
		.setWarningOnly(true);

	for (i = 0; i < 12; i++) {
		rg = "{ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + combo[0] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6) + "; 2)";
		cd = "{ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + tags[0] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6) + "; 1)";

		for (k = 1; k < 1 + num_acc; k++) {
			rg += "; ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + combo[k] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6 + w_*k) + "; 2)";
			cd += "; ARRAY_CONSTRAIN(\'" + MN_SHORT[i] + "\'!" + tags[k] + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, 6 + w_*k) + "; 1)";
		}

		rg += "; ARRAY_CONSTRAIN(\'Cards\'!" + rollA1Notation(6, 4 + 6*i, 400, 2) + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, col) + "; 2)}";
		cd += "; ARRAY_CONSTRAIN(\'Cards\'!" + rollA1Notation(6, 5 + 6*i, 400, 1) + "; \'_Backstage\'!" + rollA1Notation(2 + h_*i, col) + " ; 1)}";

		formula = "IFERROR(FILTER(" + rg + "; NOT(ISBLANK(" + cd + "))); \"\")";
		formula = "BSSUMBYTAG(TRANSPOSE($E$1:$E); " + formula + ")";
		formula = "{\"" + MN_FULL[i] + "\"; IF(\'_Settings\'!$B$7 > 0; " + formula + "; )}";

		formulas[0][i] = formula;
	}
	sheet.getRange(1, 6, 1, 12).setFormulas(formulas);

	formula = "ARRAYFORMULA($T$2:$T/\'_Settings\'!B6)";
	formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
	formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
	formula = "{\"average\"; " + formula + "}";
	sheet.getRange(1, 19).setFormula(formula);

	formula = "IF(COLUMN(" + rollA1Notation(2, 6, -1, 12) + ") - 5 < \'_Settings\'!$B$4 + \'_Settings\'!$B$6; ROW(" + rollA1Notation(2, 6, -1) + "); 0)";
	formula = "IF(COLUMN(" + rollA1Notation(2, 6, -1, 12) + ") - 5 >= \'_Settings\'!$B$4; " + formula + "; 0)";
	formula = "ARRAYFORMULA(SUMIF(" + formula + "; ROW(" + rollA1Notation(2, 6, -1) + "); " + rollA1Notation(2, 6, -1) + "))";
	formula = "IF(\'_Settings\'!$B$6 > 0; " + formula + "; ARRAYFORMULA($F$2:$F * 0))";
	formula = "IF(\'_Settings\'!$B$7 > 0; " + formula + "; \"\")";
	formula = "{\"total\"; " + formula + "}";
	sheet.getRange(1, 20).setFormula(formula);

	SpreadsheetApp.flush();
}