function optCalendar_ProcessRawEvents_(listEvents) {
	var list, cell, evento;
	var decimal_separator, description;
	// var OnlyEventsOwned = getUserSettings_('OnlyEventsOwned');
	var infoAccount, infoCard;
	var output, translation;
	var a, b, c, s, i, j;

	output = [ ];
	infoAccount = {
		name: [ ],
		regex: [ ],
		index: [ ]
	};
	infoCard = {
		code: [ ],
		regex: [ ],
		index: [ ]
	};

	decimal_separator = PropertiesService.getDocumentProperties().getProperty('decimal_separator');

	a = getTableGreatList_();

	list = a.list_account;
	list.splice(0, 0, "Wallet");
	infoAccount.index = list;
	list.sort(function(a, b) {
	  return b.length - a.length;
	});
	for (i = 0; i < list.length; i++) {
		s = new RegExp(list[i]);
		infoAccount.regex.push(s);
	}
	infoAccount.name = list;

	list = a.list_card;
	infoCard.index = list;
	list.sort(function(a, b) {
	  return b.length - a.length;
	});
	for (i = 0; i < list.length; i++) {
		s = new RegExp(list[i]);
		infoCard.regex.push(s);
	}
	infoCard.code = list;

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

		c = -1;
		for (j = 0; j < infoAccount.regex.length; j++) {
			if ( infoAccount.regex[j].test(cell.Description) ) {
				b = cell.Description.indexOf(infoAccount.name[j]);
				if (b != -1) {
					c = j;
					a = b;
					break;
				}
			}
		}
		for (j++; j < infoAccount.regex.length; j++) {
			if ( infoAccount.regex[j].test(cell.Description) ) {
				b = cell.Description.indexOf(infoAccount.name[j]);
				if (b != -1 && b < a) {
					c = j;
					a = b;
				}
			}
		}
		if (c != -1) {
			c = infoAccount.index.indexOf(infoAccount.name[c]);
			cell.Table = c;
		}

		c = -1;
		for (j = 0; j < infoCard.regex.length; j++) {
			if ( infoCard.regex[j].test(cell.Description) ) {
				b = cell.Description.indexOf(infoCard.code[j]);
				if (b != -1) {
					c = j;
					a = b;
					break;
				}
			}
		}
		for (j++; j < infoCard.regex.length; j++) {
			if ( infoCard.regex[j].test(cell.Description) ) {
				b = cell.Description.indexOf(infoCard.code[j]);
				if (b != -1 && b < a) {
					c = j;
					a = b;
				}
			}
		}
		if (c != -1) {
			c = infoCard.index.indexOf(infoCard.code[c]);
			cell.Card = infoCard.code[c];
		}

		if (cell.Table == -1 && cell.Card == -1) continue;

		cell.hasAtMute = /@(ign|mute)/.test(cell.Description);
		cell.hasQcc = /#qcc/.test(cell.Description);

		if (decimal_separator) {
			cell.Value = cell.Description.match( /-?\$[\d]+\.[\d]{2}/ );
		} else {
			cell.Value = cell.Description.match( /-?\$[\d]+,[\d]{2}/ );
			if (cell.Value) cell.Value[0] = cell.Value[0].replace(",", ".");
		}

		translation = cell.Description.match( /@(M(\+|-)(\d+)|Avg|Total)/ );
		if (translation) {
			if (translation[1] == "Total" || translation[1] == "Avg") {
				cell.TranslationType = translation[1];
			} else {
				cell.TranslationType = "M";
				cell.TranslationNumber = Number(translation[2] + translation[3]);
			}
		}

		if (cell.Value) cell.Value = Number(cell.Value[0].replace("\$", ""));
		else cell.Value = NaN;

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
	var calendars;
	var db_calendars;
	var digest, id, name, i;

	try {
		calendars = CalendarApp.getAllCalendars();
	} catch (err) {
		console.warn(err);
		calendars = [ ];
	}

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
