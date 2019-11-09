/**
 * Returns a financial report.
 *
 * @param {string} range The range which is tested against criterias.
 * @param {number} sum_range The range to be accounted.
 * @return The financial report.
 * @customfunction
 */
function BSREPORT(range, sum_range) {
	Utilities.sleep(200);

	if (sum_range == null || range == null) return 0;
	else if (sum_range.length != range.length) return 0;

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


	n1 = sum_range.length; i = 0;
	n2 = n1 - 1;
	while (i < n1 && sum_range[i] != '') {

		while (range[i] == '' && i < n2) { i++; }

		if ( /#wd/.test(range[i]) && Number(sum_range[i]) <= 0 ) {
			SUM[0][1]++;
			SUM[0][0] += Number(sum_range[i]);
		}
		if ( /#dp/.test(range[i]) && Number(sum_range[i]) >= 0 ) {
			SUM[1][1]++;
			SUM[1][0] += Number(sum_range[i]);
		}
		if ( /#trf/.test(range[i]) && Number(sum_range[i]) >= 0 ) {
			SUM[2][1]++;
			SUM[2][0] += Number(sum_range[i]);
		}
		if ( /#trf/.test(range[i]) && Number(sum_range[i]) < 0 ) {
			SUM[3][1]++;
			SUM[3][0] += Number(sum_range[i]);
		}
		if ( /#rct/.test(range[i]) ) {
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
function BSSUMBYTAG(tag, range) {
	if (!tag || !range) return;
	Utilities.sleep(200);

	var SUM;
	var regex;
	var n, i, j;

	n = tag[0].length;
	if (n < 2) return;
	else n--;

	tag = tag[0];
	tag = tag.slice(1);

	SUM = [ ];
	regex = [ ];
	for (i = 0; i < n; i++) {
		if (/^\w+$/.test(tag[i])) {
			SUM.push([ 0 ]);
			regex.push(tag[i]);
			tag[i] = "#" + tag[i];
		} else {
			SUM.push([ null ]);
			tag[i] = null;
		}
	}
	if (range === "0") return SUM;

	if (regex.length == 0) return SUM;
	else if (regex.length == 1) regex = regex[0];
	else regex = regex.join('|');

	regex = "#(" + regex + ")";
	regex = new RegExp(regex);

	for (i = 0; i < range.length; i++) {
		if ( !regex.test(range[i][1]) ) continue;

		for (j = 0; j < n; j++) {
			if (tag[j] && range[i][1].indexOf(tag[j]) !== -1) {
				SUM[j][0] += Number(range[i][0]);
			}
		}
	}

	return SUM;
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

	if (!range) return "";

	var str = '';

	//str += 'P balance: ' + Number(range[0][0]).formatFinancial() + '\n';
	str += 'Credit: ' + Number(range[1][0]).formatFinancial() + '\n';
	str += 'Expenses: ' + Number(range[3][0]).formatFinancial() + '\n';
	str += '-----------\n';
	str += 'Balance: ' + Number(range[4][0]).formatFinancial();

	return str;
}
