var MN_SHORT_ = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
		MN_FULL_ = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var TC_CODE_ = [ "A", "D", "E", "F", "G", "K", "L", "S", "T", "U" ],
		TC_NAME_ = [ "Food and supply", "Shopping and clothing", "Hobby", "Leisure time", "Home", "Other", "Health and insurance", "Services", "Transport", "Traveling" ];

var TABLE_DIMENSION_ = {height: 10, width: 5};

var HEAD_AG = 72;
var AppsScriptGlobal = (function() {
	var o = {
		AddonVersion: 74,
		AddonVersionName: "0.20.0-beta",

		TemplateVersion: 59,
		TemplateVersionName: "6.4",
		TemplateId: "",
		TemplateSheets: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "Summary", "About" ],

		CoolGallery: {
			tags: {
				id: "",
				preview_id: "",
				version: 2,
				version_name: "v0.2.1",
				version_date: "2019-12-24",
				name: "Stats for Tags",
				sheet_name: "Stats for Tags"
			}
		}
	};

	return {
		AddonVersion: function() { return o.AddonVersion },
		AddonVersionName: function() { return o.AddonVersionName },

		TemplateVersion: function() { return o.TemplateVersion },
		TemplateVersionName: function() { return o.TemplateVersionName },
		TemplateId: function() { return o.TemplateId },
		TemplateSheets: function() { return o.TemplateSheets },

		CoolGallery: function() { return o.CoolGallery }
	};
})();
