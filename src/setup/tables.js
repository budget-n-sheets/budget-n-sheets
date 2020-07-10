function setupTables_() {
	console.time("add-on/setup/tables");
	var ids, acc, r, i, j, k;

	const init_month = SETUP_SETTINGS["init_month"];
	const list_acc = SETUP_SETTINGS["list_acc"];
	const num_acc = SETUP_SETTINGS["number_accounts"];

	i = 0;
	j = 0;
	ids = [ ];
	while (j < 1 + num_acc && i < 99) {
		r = randomString(7, "lonum");
		if (ids.indexOf(r) === -1) {
			ids[j] = r;
			j++;
		}
		i++;
	}
	if (ids.length < 1 + num_acc) throw new Error("Could not generate unique IDs.");

	db_tables = {
		accounts: {
			ids: [ ],
			names: [ ],
			data: [ ]
		},
		cards: {
			count: 0,
			ids: [ ],
			codes: [ ],
			data: [ ]
		}
	};

	for (k = 0; k < num_acc; k++) {
		db_tables.accounts.ids[k] = ids[1 + k];

		acc = {
			id: ids[1 + k],
			name: list_acc[k],
			balance: 0,
			time_a: init_month,
			time_z: 11
		};

		db_tables.accounts.names[k] = list_acc[k];
		db_tables.accounts.data[k] = acc;
	}

	PropertiesService2.setProperty("document", "DB_TABLES", "json", db_tables);
	console.timeEnd("add-on/setup/tables");
}
