var MN_SHORT_ = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
		MN_FULL_ = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var TC_CODE_ = [ "A", "D", "E", "F", "G", "K", "L", "S", "T", "U" ],
		TC_NAME_ = [ "Food and supply", "Shopping and clothing", "Hobby", "Leisure time", "Home", "Other", "Health and insurance", "Services", "Transport", "Traveling" ];

var TABLE_DIMENSION_ = {height: 10, width: 5};

var AppsScriptGlobal = (function() {
	var o = {
		script_version: {
			number: {
				major: 0,
				minor: 22,
				patch: 1,
			},
			name: "0.22.1"
		},

		template_version: {
			number: 59,
			name: "6.4"
		},

		TemplateId: "",
		TemplateSheets: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "Summary", "About" ],

		CoolGallery: {
			tags: {
				id: "",
				preview_id: "",
				version: 2,
				version_name: "v0.2.2",
				version_date: "2019-12-26",
				name: "Stats for Tags",
				sheet_name: "Stats for Tags"
			}
		}
	};

	return {
		script_version: function() { return o.script_version },
		template_version: function() { return o.template_version },

		TemplateId: function() { return o.TemplateId },
		TemplateSheets: function() { return o.TemplateSheets },

		CoolGallery: function() { return o.CoolGallery }
	};
})();
