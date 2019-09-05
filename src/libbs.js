/**
  * Number format $ x,xx0.00;-$ x,xx0.00
  */
Number.prototype.formatCurrency = function() {
  var DEC_P = PropertiesService.getDocumentProperties().getProperty("decimal_separator") ? "." : ",";
  var DEC_PS = (DEC_P === "." ? "," : ".");

  var n = this;
  var s = n < 0 ? '-$ ' : '$ ';
  var i = parseInt(n = Math.abs(+n || 0).toFixed(2)) + '';
  var j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + DEC_PS : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + DEC_PS) + (2 ? DEC_P + Math.abs(n - i).toFixed(2).slice(2) : '');
};

/**
  * Number format x,xx0.00;(x,xx0.00)
  */
Number.prototype.formatFinancial = function(p_dec_p) {
	var DEC_P, DEC_PS;

	if(p_dec_p) {
	  DEC_P = p_dec_p === "] [" ? "," : ".";
	} else {
		DEC_P = PropertiesService.getDocumentProperties().getProperty("decimal_separator") ? "." : ",";
	}

	DEC_PS = (DEC_P === "." ? "," : ".");

  var n = this;
  var s = n < 0 ? true : false;
  var i = parseInt(n = Math.abs(+n || 0).toFixed(2)) + '';
  var j = (j = i.length) > 3 ? j % 3 : 0;
  var a = (j ? i.substr(0, j) + DEC_PS : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + DEC_PS) + (2 ? DEC_P + Math.abs(n - i).toFixed(2).slice(2) : '');

  if(s) {
    a = '(' + a + ')';
  }

  return a;
};

/**
  * Number format +0.00;-0.00
  */
Number.prototype.formatLocaleSignal = function(p_dec_p) {
	var DEC_P, DEC_PS;

	if(p_dec_p) {
	  DEC_P = p_dec_p === "] [" ? "," : ".";
	} else {
		DEC_P = PropertiesService.getDocumentProperties().getProperty("decimal_separator") ? "." : ",";
	}

	DEC_PS = (DEC_P === "." ? "," : ".");

  var n = this;
  var s = n < 0 ? '-' : '+';
  var i = parseInt(n = Math.abs(n).toFixed(2)) + '';
  var j = i.length;
  return s + i.substr(0, j) + DEC_P + Math.abs(n - i).toFixed(2).slice(2);
};


function getSpreadsheetDate(d) {
  var timezone, date;

  if(d) date = d;
  else date = new Date();

  try {
    timezone = SpreadsheetApp.getActiveSpreadsheet()
      .getSpreadsheetTimeZone();
  } catch(err) {
    timezone = "GMT";
    console.error("getSpreadsheetDate()", err);
  }

	if(typeof timezone != "string") {
		timezone = "GMT";
	}

  date = Utilities.formatDate(date, timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'");
  return new Date(date);
}
