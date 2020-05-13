var MN_SHORT = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
		MN_FULL = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var TC_CODE = [ "A", "D", "E", "F", "G", "K", "L", "S", "T", "U" ],
		TC_NAME = [ "Food and supply", "Shopping and clothing", "Hobby", "Leisure time", "Home", "Other", "Health and insurance", "Services", "Transport", "Traveling" ];

var DATE_NOW = new Date();

var SPREADSHEET, SETUP_SETTINGS;

var TABLE_DIMENSION = Object.freeze({height: 10, width: 5});

var APPS_SCRIPT_GLOBAL = Object.freeze({
	script_version: {
		major: 0,
		minor: 30,
		patch: 5
	},

	template_version: {
		major: 0,
		minor: 9,
		patch: 0
	},

	template_id: "",
	template_sheets: [ "_Settings", "Cards", "Summary", "TTT", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "_About BnS" ],

	cool_gallery: {
		stats_for_tags: {
			id: "",
			preview_id: "",
			version_name: "v1.0.1",
			version_date: "2020-02-25",
			name: "Stats for Tags",
			sheet_name: "Stats for Tags"
		},
		filter_by_tag: {
			id: "",
			version_name: "v0.3.0",
			version_date: "2020-05-07",
			name: "Filter by Tag",
			sheet_name: "Filter by Tag"
		}
	}
});
