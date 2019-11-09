function BSREPORT(data) {
	var stats;
	var range, sum_range;
	var n, i;

	stats = [
		[ 0 , 0 ], [ 0 , 0 ], [ 0 , 0 ], [ 0 , 0 ], [ 0 , 0 ], [ 0 , 0 ]
	];

	if (data == "") return stats;

	range = data[0];
	sum_range = data[1];

	i = 0;
	n = sum_range.length;

	while (i < n && sum_range[i] != '') {
		if (/#wd/.test(range[i]) && sum_range[i] <= 0) {
			stats[0][1]++;
			stats[0][0] += sum_range[i];
		}
		if (/#dp/.test(range[i]) && sum_range[i] >= 0) {
			stats[1][1]++;
			stats[1][0] += sum_range[i];
		}
		if (/#trf/.test(range[i]) && sum_range[i] >= 0) {
			stats[2][1]++;
			stats[2][0] += sum_range[i];
		}
		if (/#trf/.test(range[i]) && sum_range[i] < 0) {
			stats[3][1]++;
			stats[3][0] += sum_range[i];
		}
		if (/#rct/.test(range[i])) {
			stats[4][0] += sum_range[i];
		}

		i++;
	}

	return stats;
}


function BSSUMBYTAG(tag, range) {
	var sum, regex;
	var n, i, j;

	n = tag[0].length;
	if (n < 2) return;
	else n--;

	tag = tag[0];
	tag = tag.slice(1);

	sum = [ ];
	regex = [ ];
	for (i = 0; i < n; i++) {
		if (/^\w+$/.test(tag[i])) {
			sum.push([ 0 ]);
			regex.push(tag[i]);
			tag[i] = "#" + tag[i];
		} else {
			sum.push([ null ]);
			tag[i] = null;
		}
	}

	if (regex.length == 0) return sum;
	else if (regex.length == 1) regex = regex[0];
	else regex = regex.join('|');

	regex = "#(" + regex + ")";
	regex = new RegExp(regex);

	for (i = 0; i < range.length; i++) {
		if (!regex.test(range[i][1])) continue;

		for (j = 0; j < n; j++) {
			if (tag[j] && range[i][1].indexOf(tag[j]) !== -1) {
				sum[j][0] += Number(range[i][0]);
			}
		}
	}

	return sum;
}


function BSINFCARD(data) {
	var inf = '';

	inf += 'Credit: ' + Number(data[1][0]).formatFinancial() + '\n';
	inf += 'Expenses: ' + Number(data[3][0]).formatFinancial() + '\n';
	inf += '-----------\n';
	inf += 'Balance: ' + Number(data[4][0]).formatFinancial();

	return inf;
}


function BSINF(data) {
	var inf = '';

	inf += 'Withdrawal: (' + data[0][1] + ') ';
	inf += Number(data[0][0]).formatFinancial() + '\n';

	inf += 'Deposit: (' + data[1][1] + ') ';
	inf += Number(data[1][0]).formatFinancial() + '\n';

	inf += 'Trf. in: (' + data[2][1] + ') ';
	inf += Number(data[2][0]).formatFinancial() + '\n';

	inf += 'Trf. out: (' + data[3][1] + ') ';
	inf += Number(data[3][0]).formatFinancial();

	return inf;
}
