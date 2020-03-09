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
				minor: 24,
				patch: 2,
			},
			name: "0.24.2"
		},

		template_version: {
			number: 71,
			name: "7.1"
		},

		TemplateId: "",
		TemplateSheets: [ "_Settings", "Cards", "Summary", "TTT", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "About" ],

		CoolGallery: {
			tags: {
				id: "",
				preview_id: "",
				version_name: "v1.0.1",
				version_date: "2020-02-25",
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
