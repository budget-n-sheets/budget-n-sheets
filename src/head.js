var MN_SHORT_ = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
		MN_FULL_ = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var TC_CODE_ = [ "A", "D", "E", "F", "G", "K", "L", "S", "T", "U" ],
		TC_NAME_ = [ "Food and supply", "Shopping and clothing", "Hobby", "Leisure time", "Home", "Other", "Health and insurance", "Services", "Transport", "Traveling" ];

var TABLE_DIMENSION_ = {height: 10, width: 5};

var HEAD_AG = 76;
var AppsScriptGlobal = (function() {
	var o = {
		script_version: {
			number: {
				major: 0,
				minor: 21,
				patch: 0,
			},
			name: "0.21.0"
		},

		template_version: {
			number: 59,
			name: "6.4"
		},

		AddonVersion: 76,
		AddonVersionName: "0.20.6",

		TemplateVersion: 59,
		TemplateVersionName: "6.4",
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

		AddonVersion: function() { return o.AddonVersion },
		AddonVersionName: function() { return o.AddonVersionName },

		TemplateVersion: function() { return o.TemplateVersion },
		TemplateVersionName: function() { return o.TemplateVersionName },
		TemplateId: function() { return o.TemplateId },
		TemplateSheets: function() { return o.TemplateSheets },

		CoolGallery: function() { return o.CoolGallery }
	};
})();
