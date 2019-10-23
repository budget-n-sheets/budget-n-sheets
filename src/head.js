var MN_SHORT_ = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
		MN_FULL_ = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var TC_CODE_ = [ "A", "D", "E", "F", "G", "K", "L", "S", "T", "U" ],
		TC_NAME_ = [ "Food and supply", "Shopping and clothing", "Hobby", "Leisure time", "Home", "Other", "Health and insurance", "Services", "Transport", "Traveling" ];

var AppsScriptGlobal = (function() {
	var o = {
		AddonVersion: 66,
		AddonVersionName: "0.19.0-beta2",

		TemplateVersion: 55,
		TemplateVersionName: "5.9",
		TemplateId: "",
		TemplateSheets: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cards", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "Summary", "About" ],

		CoolGallery: {
			tags: {
				id: "",
				preview_url: "",
				version: 1,
				version_name: "v0.1.0",
				version_date: "2019-10-22",
				name: "Stats for Tags",
				sheet_name: "Stats for Tags"
			}
		},

		TableDimensions: { height:10, width:5 }
	};

	return {
		AddonVersion: function() { return o.AddonVersion },
		AddonVersionName: function() { return o.AddonVersionName },

		TemplateVersion: function() { return o.TemplateVersion },
		TemplateVersionName: function() { return o.TemplateVersionName },
		TemplateId: function() { return o.TemplateId },
		TemplateSheets: function() { return o.TemplateSheets },

		CoolGallery: function() { return o.CoolGallery },

		TableDimensions: function() { return o.TableDimensions }
	};
})();
