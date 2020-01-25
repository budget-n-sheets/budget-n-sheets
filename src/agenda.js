function optCalendar_ProcessRawEvents_(listEvents) {
	var list, cell,
			thisEvent;
	// var OnlyEventsOwned = getUserSettings_('OnlyEventsOwned');
	var regExp_Account, regExp_Card, code_Card;
	var output, translation;
	var s, i, j;

	output = [ ];
	code_Card = [ ];
	regExp_Card = [ ];
	regExp_Account = [ /Wallet/ ];

	list = optTable_GetList_();
	for (i = 0; i < list.length; i++) {
		if (list[i].Type === "Account") {
			s = new RegExp(list[i].Name);
			regExp_Account.push(s);
		} else {
			s = new RegExp(list[i].Code);
			regExp_Card.push(s);
			code_Card.push(list[i].Code);
		}
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

		if (PropertiesService.getDocumentProperties().getProperty("decimal_separator")) {
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


function calendarRefreshDb_() {
	var calendars = CalendarApp.getAllOwnedCalendars();
	var db_calendars;
	var digest, id, i;

	db_calendars = {
		id: [ ],
		md5: [ ]
	};

	for (i = 0; i < calendars.length; i++) {
		id = calendars[i].getId();
		digest = computeDigest("MD5", id, "UTF_8");

		db_calendars.id.push(id);
		db_calendars.md5.push(digest);
	}

	setPropertiesService_('document', 'json', 'DB_CALENDARS', db_calendars);
}


function getAllOwnedCalendars() {
	var list = CalendarApp.getAllOwnedCalendars();
	var calendars;
	var digest, i;

	calendars = {
		name: [ ],
		md5: [ ]
	};

	for (i = 0; i < list.length; i++) {
		calendars.name.push( list[i].getName() );

		digest = computeDigest("MD5", list[i].getId(), "UTF_8");
		calendars.md5.push(digest);
	}

	return calendars;
}


function getCalendarByMD5_(md5sum) {
	if (typeof md5sum != "string") {
		console.warn("getCalendarByMD5_(): Invalid parameter.", md5sum);
		return;
	}

	var list = CalendarApp.getAllOwnedCalendars();
	var digest, i;

	for (i = 0; i < list.length; i++) {
		digest = computeDigest("MD5", list[i].getId(), "UTF_8");
		if (digest === md5sum) return list[i];
	}

	setUserSettings_("FinancialCalendar", "");
	setUserSettings_("PostDayEvents", false);
	setUserSettings_("CashFlowEvents", false);
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
