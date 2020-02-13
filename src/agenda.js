function optCalendar_ProcessRawEvents_(listEvents) {
	var list, cell,
			thisEvent;
	var decimal_separator;
	// var OnlyEventsOwned = getUserSettings_('OnlyEventsOwned');
	var regExp_Account, regExp_Card, code_Card;
	var output, translation;
	var a, s, i, j;

	output = [ ];
	code_Card = [ ];
	regExp_Card = [ ];
	regExp_Account = [ ];

	decimal_separator = PropertiesService.getDocumentProperties().getProperty('decimal_separator');

	a = getTableGreatList_();

	a.list_account.push("Wallet");
	a.list_account.sort(function(a, b) {
	  return b.length - a.length;
	});

	list = a.list_account;
	for (i = 0; i < list.length; i++) {
		s = new RegExp(list[i]);
		regExp_Account.push(s);
	}

	a.list_card.sort(function(a, b) {
	  return b.length - a.length;
	});

	list = a.list_card;
	for (i = 0; i < list.length; i++) {
		code_Card.push(list[i]);

		s = new RegExp(list[i]);
		regExp_Card.push(s);
	}

	for (i = 0; i < listEvents.length; i++) {
		// if (OnlyEventsOwned && !listEvents[i].isOwnedByMe()) continue;
		thisEvent = listEvents[i];

		cell = {
			Id: thisEvent.getId(),
			Day: thisEvent.getStartTime().getDate(),
			Title: thisEvent.getTitle(),
			Description: thisEvent.getDescription(),
			Table: -1,
			Card: -1,
			Value: 0,
			TranslationType: "",
			TranslationNumber: 0,
			Tags: [ ],
			hasAtIgn: true,
			hasQcc: false
		};


		cell.hasAtIgn = /@ign/.test(cell.Description);
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

		for (j = 0; j < regExp_Account.length; j++) {
			if ( regExp_Account[j].test(cell.Description) ) {
				cell.Table = j;
				break;
			}
		}

		for (j = 0; j < regExp_Card.length; j++) {
			if ( regExp_Card[j].test(cell.Description) ) {
				cell.Card = code_Card[j];
				break;
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
