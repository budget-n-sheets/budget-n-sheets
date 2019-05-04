/**
  * Number format $ x,xx0.00;-$ x,xx0.00
  */
Number.prototype.formatCurrency = function() {
  var n = this;
  var s = n < 0 ? '-$ ' : '$ ';
  var i = parseInt(n = Math.abs(+n || 0).toFixed(2)) + '';
  var j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + DEC_PS : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + DEC_PS) + (2 ? DEC_P + Math.abs(n - i).toFixed(2).slice(2) : '');
};

/**
  * Number format x,xx0.00;(x,xx0.00)
  */
Number.prototype.formatFinancial = function() {
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
Number.prototype.formatLocaleSignal = function() {
  var n = this;
  var s = n < 0 ? '-' : '+';
  var i = parseInt(n = Math.abs(n).toFixed(2)) + '';
  var j = i.length;
  return s + i.substr(0, j) + DEC_P + Math.abs(n - i).toFixed(2).slice(2);
};



function getSpreadsheetDate() {
  var timezone, date;


  try {
    timezone = SpreadsheetApp.getActiveSpreadsheet()
      .getSpreadsheetTimeZone();
  } catch(err) {
    timezone = 'GMT';

    Logger.log('getSpreadsheetDate() : ' + err.message);
    console.error("getSpreadsheetDate()", err);
  }

  date = Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'");

  return new Date(date);
}
