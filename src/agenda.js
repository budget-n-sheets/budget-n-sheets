function optCalendar_ProcessRawEvents_(listEvents) {
	var evento, description;
	// var OnlyEventsOwned = getUserSettings_('OnlyEventsOwned');
	var output, translation, regexp, match;
	var list, cell, s, i, j;

	output = [ ];
	regexp = {
		accounts: "",
		cards: 0
	};

	const dec_p = PropertiesService.getDocumentProperties().getProperty('decimal_separator');
	const db_tables = getPropertiesService_('document', 'json', 'DB_TABLES');

	list = db_tables.accounts.names;
	list.splice(0, 0, "Wallet");

	list.sort(function(a, b) {
	  return b.length - a.length;
	});

	s = list.join('|');
	s = '(' + s + ')';

	regexp.accounts = new RegExp(s, 'g');

	if (db_tables.cards.count > 0) {
		list = db_tables.cards.codes;

		list.sort(function(a, b) {
		  return b.length - a.length;
		});

		s = list.join('|');
		s = '(' + s + ')';

		regexp.cards = new RegExp(s, 'g');
	}

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
			hasAtMute: true,
			hasQcc: false
		};

		match = cell.Description.match(regexp.accounts);
		if (match) {
			cell.Table = db_tables.accounts.names.indexOf(match[0]);
		}

		if (db_tables.cards.count > 0) {
			match = cell.Description.match(regexp.cards);
			if (match) {
				cell.Card = match[0];
			}
		}

		if (cell.Table == -1 && cell.Card == -1) continue;

		cell.hasAtMute = /@(ign|mute)/.test(cell.Description);
		cell.hasQcc = /#qcc/.test(cell.Description);

		if (dec_p) {
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
	var calendars = CalendarApp.getAllCalendars();
	var db_calendars;
	var digest, id, name, i;

	db_calendars = {
		name: [ ],
		id: [ ],
		md5: [ ]
	};

	for (i = 0; i < calendars.length; i++) {
		id = calendars[i].getId();
		digest = computeDigest("MD5", id, "UTF_8");

		name = calendars[i].getName();
		if (! calendars[i].isOwnedByMe()) name += " *";

		db_calendars.name.push(name);
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
	if (! calendar.isOwnedByMe()) return;

	var evento, description;
	// var OnlyEventsOwned = getUserSettings_("OnlyEventsOwned");
	var i;


	for (i = 0; i < list.length; i++) {
		evento = calendar.getEventById(list[i]);

		// if (OnlyEventsOwned && !evento.isOwnedByMe()) continue;

		description = evento.getDescription();
		description += "\n\n\n@mute";

		evento.setDescription(description);
	}
}
