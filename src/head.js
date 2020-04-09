var MN_SHORT_ = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
		MN_FULL_ = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var TC_CODE_ = [ "A", "D", "E", "F", "G", "K", "L", "S", "T", "U" ],
		TC_NAME_ = [ "Food and supply", "Shopping and clothing", "Hobby", "Leisure time", "Home", "Other", "Health and insurance", "Services", "Transport", "Traveling" ];

var DATE_NOW = new Date();

var TABLE_DIMENSION_ = Object.freeze({height: 10, width: 5});

var APPS_SCRIPT_GLOBAL_ = Object.freeze({
	script_version: {
		number: {
			major: 0,
			minor: 27,
			patch: 1
		},
		name: "0.27.1"
	},

	template_version: {
		number: 84,
		name: "8.3"
	},

	template_id: "",
	template_sheets: [ "_Settings", "Cards", "Summary", "TTT", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "About" ],

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
			version_name: "v0.1.1",
			version_date: "2020-03-23",
			name: "Filter by Tag",
			sheet_name: "Filter by Tag"
		}
	}
});
