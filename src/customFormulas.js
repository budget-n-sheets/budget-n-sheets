/**
  * Returns a financial report.
  *
  * @param {string} range The range which is tested against criterias.
  * @param {number} sum_range The range to be accounted.
  * @return The financial report.
  * @customfunction
  */
function LNEREPORT(range, sum_range) {
  Utilities.sleep(200);

  if(sum_range == null || range == null) return 0;
  else if(sum_range.length != range.length) return 0;

  var SUM;
  var n1, n2, i;

  SUM = [
    [ 0 , 0 ],
    [ 0 , 0 ],
    [ 0 , 0 ],
    [ 0 , 0 ],
    [ 0 , 0 ],
    [ 0 , 0 ]
  ];


  n1 = sum_range.length;  i = 0;
  n2 = n1 - 1;
  while(i < n1  &&  sum_range[i] != '') {

    while(range[i] == ''  &&  i < n2) { i++; }

    if( /#wd/.test(range[i])  &&  Number(sum_range[i]) <= 0 ) {
      SUM[0][1]++;
      SUM[0][0] += Number(sum_range[i]);
    }
    if( /#dp/.test(range[i])  &&  Number(sum_range[i]) >= 0 ) {
      SUM[1][1]++;
      SUM[1][0] += Number(sum_range[i]);
    }
    if( /#trf/.test(range[i])  &&  Number(sum_range[i]) >= 0 ) {
      SUM[2][1]++;
      SUM[2][0] += Number(sum_range[i]);
    }
    if( /#trf/.test(range[i])  &&  Number(sum_range[i]) < 0 ) {
      SUM[3][1]++;
      SUM[3][0] += Number(sum_range[i]);
    }
    if( /#rct/.test(range[i]) ) {
      SUM[4][0] += Number(sum_range[i]);
    }

    i++;
  }

  return SUM;
}

/**
  * Returns a conditional sum across a range.
  *
  * @param {string} tag The pattern or test to apply to range.
  * @param {number} sum_range The range to be summed.
  * @param {string} range The range which is tested against criterion.
  * @return The total tagged.
  * @customfunction
  */
function LNESUMBYTAG(tag, range) {
  Utilities.sleep(200);

  if(!tag  ||  !range) return 0;

  var thisRegExp, masterRegExp;
  var SUM;
  var m1, n, m2, i, j;
  var v;

  SUM = [ ];
  thisRegExp = [ ];

  n = tag.length;
  if(n <= 2) return 0;
  else n -= 2;

  v = tag.slice(1, n+1);
  for(i = 0;  i < n;  i++) {
    SUM.push([ 0 ]);
    thisRegExp.push( new RegExp('#'+v[i]) );
  }

  if(n > 1) masterRegExp = v.join('|');
  else masterRegExp = v[0];

  masterRegExp = '#(' + masterRegExp + ')';
  masterRegExp = new RegExp(masterRegExp);


  m1 = range.length;  i = 0;
  m2 = m1 - 1;
  while(i < m1) {
    // while(range[i][1] == ''  &&  i < m2) { i++; }

    if(masterRegExp.test(range[i][1])) {
      for(j = 0;  j < n;  j++) {
        if(thisRegExp[j].test(range[i][1])) {
          SUM[j][0] += Number(range[i][0]);
        }
      }
    }

    i++;
  }

  return SUM;
}

/**
  * Returns a financial report.
  *
  * @param {number} range The data to evaluate.
  * @return The financial report.
  * @customfunction
  */
function LNEINF(range) {
  Utilities.sleep(200);

  if(!range) return "#ERROR!";

  var strINF = "";


  strINF += 'Withdrawal: (' + range[0][1] + ') ';
  strINF += Number(range[0][0]).formatFinancial() + '\n';

  strINF += 'Deposit: (' + range[1][1] + ') ';
  strINF += Number(range[1][0]).formatFinancial() + '\n';

  strINF += 'Trf. in: (' + range[2][1] + ') ';
  strINF += Number(range[2][0]).formatFinancial() + '\n';

  strINF += 'Trf. out: (' + range[3][1] + ') ';
  strINF += Number(range[3][0]).formatFinancial();

  return strINF;
}

/**
  * Returns credit card stats.
  *
  * @param {number} range The data to evaluate.
  * @return The stats.
  * @customfunction
  */
function BSINFCARD(range) {
  Utilities.sleep(200);

  if(!range) return "";

  var str = '';

  //str += 'P balance: ' + Number(range[0][0]).formatFinancial() + '\n';
  str += 'Credit: ' + Number(range[1][0]).formatFinancial() + '\n';
  str += 'Expenses: ' + Number(range[3][0]).formatFinancial() + '\n';
  str += '-----------\n';
  str += 'Balance: ' + Number(range[4][0]).formatFinancial();

  return str;
}
