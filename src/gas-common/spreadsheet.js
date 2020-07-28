function copySheetsFromSource_() {
	var source = SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
	var destination = SpreadsheetApp.getActiveSpreadsheet();
	var sheets = destination.getSheets();
	var i;

	const list = APPS_SCRIPT_GLOBAL.template_sheets;

	for (i = 0; i < list.length; i++) {
		source.getSheetByName(list[i])
			.copyTo(destination)
			.setName(list[i]);
	}

	for (i = 0; i < sheets.length; i++) {
		destination.deleteSheet(sheets[i]);
	}
}


function deleteAllSheets_() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var sheets = spreadsheet.getSheets();

	sheets[0].showSheet();
	spreadsheet.setActiveSheet(sheets[0]);

	for (var i = sheets.length - 1; i > 0; i--) {
		spreadsheet.deleteSheet(sheets[i]);
	}

	spreadsheet.insertSheet();
	spreadsheet.deleteSheet(sheets[0]);
}


function isMissingSheet() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

	const sheets = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cash Flow", "Tags", "_Backstage", "Cards", "Summary" ];

	for (var i = 0; i < sheets.length; i++) {
		if (! spreadsheet.getSheetByName(sheets[i])) return true;
	}

	return false;
}


function isTemplateAvailable() {
	try {
		SpreadsheetApp.openById(APPS_SCRIPT_GLOBAL.template_id);
	} catch (err) {
		ConsoleLog.error("Spreadsheet template is not available!");
		return false;
	}

	return true;
}

function rollA1Notation (posRow, posCol, height, width, mode1, mode2) {
  if (!posRow || !posCol) return
  if (!height) height = 1
  if (!width) width = 1
  if (!mode1) mode1 = 1
  if (!mode2) mode2 = 1

  posCol--
  width--
  mode1--
  mode2--

  var str, c, m

  const f_ = 26
  const s_ = 4

  m = mode1 % s_
  str = ((m === 1 || m === 3) ? '$' : '')

  c = (posCol - posCol % f_) / f_
  str += (c ? String.fromCharCode(64 + c) : '')
  str += String.fromCharCode(65 + posCol % f_)

  str += (m >= 2 ? '$' : '')
  str += posRow

  if (height === 1 && width === 0) return str
  else {
    str += ':'
    posCol += width

    m = mode2 % s_
    str += ((m === 1 || m === 3) ? '$' : '')

    c = (posCol - posCol % f_) / f_
    str += (c ? String.fromCharCode(64 + c) : '')
    str += String.fromCharCode(65 + posCol % f_)

    if (height !== -1) {
      str += (m >= 2 ? '$' : '')
      str += posRow + height - 1
    }
  }

  return str
}
