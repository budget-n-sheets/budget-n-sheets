function optCalendar_ProcessRawEvents_(listEvents) {
	var list, cell, evento;
	var decimal_separator, description;
	// var OnlyEventsOwned = getUserSettings_('OnlyEventsOwned');
	var accounts, cards;
	var output, translation;
	var a, b, c, s, i, j;

	output = [ ];
	accounts = {
		regex: "",
		list: [ ]
	};
	cards = {
		regex: "",
		list: [ ]
	};

	decimal_separator = PropertiesService.getDocumentProperties().getProperty('decimal_separator');

	const db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');

	list = db_tables.accounts.names;
	list.splice(0, 0, "Wallet");

	a = list.join('|');
	a = '(' + a + ')';
	accounts.regex = new RegExp(a);

	list.sort(function(a, b) {
	  return b.length - a.length;
	});

	accounts.list = list;

	list = db_tables.cards.codes;

	a = list.join('|');
	a = '(' + a + ')';
	cards.regex = new RegExp(a);

	list.sort(function(a, b) {
	  return b.length - a.length;
	});

	cards.list = list;

	for (i = 0; i < listEvents.length; i++) {
		// if (OnlyEventsOwned && !listEvents[i].isOwnedByMe()) continue;

		evento = listEvents[i];

		description = evento.getDescription();
		if (description == "") continue;

		cell = {
			Id: evento.getId(),
			Day: evento.getStartTime().getDate(),
			Title: evento.getTitle(),
			Description: description,
			Table: -1,
			Card: -1,
			Value: 0,
			TranslationType: "",
			TranslationNumber: 0,
			Tags: [ ],
			hasAtIgn: true,
			hasQcc: false
		};

		if ( accounts.regex.test(cell.Description) ) {
			c = -1;
			a = description.length;
			for (j = 0; j < accounts.list.length; j++) {
				b = cell.Description.indexOf(accounts.list[j]);
				if (b != -1 && b < a) {
					c = j;
					a = b;
					break;
				}
			}

			if (c != -1) {
				cell.Table = db_tables.accounts.names.indexOf(accounts.list[c]);
			}
		}

		if ( cards.regex.test(cell.Description) ) {
			c = -1;
			a = description.length;
			for (j = 0; j < cards.list.length; j++) {
				b = cell.Description.indexOf(cards.list[j]);
				if (b != -1 && b < a) {
					c = j;
					a = b;
					break;
				}
			}

			if (c != -1) {
				c = db_tables.cards.codes.indexOf(cards.list[c]);
				cell.Card = db_tables.cards.codes[c];
			}
		}

		if (cell.Table == -1 && cell.Card == -1) continue;

		cell.hasAtIgn = /@ign/.test(cell.Description);
		cell.hasQcc = /#qcc/.test(cell.Description);

		if (decimal_separator) {
			cell.Value = cell.Description.match( /-?\$[\d]+\.[\d]{2}/ );
		} else {
			cell.Value = cell.Description.match( /-?\$[\d]+,[\d]{2}/ );
			if (cell.Value) cell.Value[0] = cell.Value[0].replace(",", ".");
		}

		if (cell.Value) cell.Value = Number(cell.Value[0].replace("\$", ""));
		else cell.Value = NaN;

		translation = cell.Description.match( /@(M(\+|-)(\d+)|Avg|Total)/ );
		if (translation) {
			if (translation[1] == "Total" || translation[1] == "Avg") {
				cell.TranslationType = translation[1];
			} else {
				cell.TranslationType = "M";
				cell.TranslationNumber = Number(translation[2] + translation[3]);
			}
		}

		cell.Tags = cell.Description.match(/#\w+/g);
		if (!cell.Tags) cell.Tags = [ ];
		else {
			for (j = 0; j < cell.Tags.length; j++) {
				cell.Tags[j] = cell.Tags[j].slice(1);
			}
		}

		output.push(cell);
	}

	return output;
}


function getAllOwnedCalendars() {
	var calendars = CalendarApp.getAllOwnedCalendars();
	var db_calendars;
	var digest, id, i;

	db_calendars = {
		name: [ ],
		id: [ ],
		md5: [ ]
	};

	for (i = 0; i < calendars.length; i++) {
		id = calendars[i].getId();
		digest = computeDigest("MD5", id, "UTF_8");

		db_calendars.name.push(calendars[i].getName());
		db_calendars.id.push(id);
		db_calendars.md5.push(digest);
	}

	setPropertiesService_('document', 'json', 'DB_CALENDARS', db_calendars);

	return db_calendars;
}


function getCalendarByMD5_(md5sum) {
	var calendar, db_calendars, a;

	db_calendars = getPropertiesService_('document', 'json', 'DB_CALENDARS');

	a = db_calendars.md5.indexOf(md5sum);
	a = db_calendars.id[a];

	a = CalendarApp.getCalendarById(a);

	if (a) {
		return a;
	} else {
		setUserSettings_('financial_calendar', '');
		setUserSettings_('PostDayEvents', false);
		setUserSettings_('CashFlowEvents', false);
	}
}


function calendarMuteEvents_(calendar, list) {
	var evento, description;
	// var OnlyEventsOwned = getUserSettings_("OnlyEventsOwned");
	var i;


	for (i = 0; i < list.length; i++) {
		evento = calendar.getEventById(list[i]);

		// if (OnlyEventsOwned && !evento.isOwnedByMe()) continue;

		description = evento.getDescription();
		description += "\n\n\n@ign";

		evento.setDescription(description);
	}
}
