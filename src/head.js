var MN_SHORT_ = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
    MN_FULL_ = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var TC_CODE_ = [ "A", "D", "E", "F", "G", "K", "L", "S", "T", "U" ],
    TC_NAME_ = [ "Food and supply", "Shopping and clothing", "Hobby", "Leisure time", "Home", "Other", "Health and insurance", "Services", "Transport", "Traveling" ];

var AppsScriptGlobal = (function() {
  var o = {
    test_chamber: false,

    AddonVersion: 56,
    AddonVersionName: "0.17.4",

    TemplateVersion: 50,
    TemplateVersionName: "5.4",
    TemplateSheets: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "Cards", "Summary", "About" ],

    TableDimensions: { height:10, width:5 }
  };

  return {
    test_chamber: function() { return o.test_chamber },

    AddonVersion: function() { return o.AddonVersion },
    AddonVersionName: function() { return o.AddonVersionName },

    TemplateVersion: function() { return o.TemplateVersion },
    TemplateVersionName: function() { return o.TemplateVersionName },
    TemplateSheets: function() { return o.TemplateSheets },

    TableDimensions: function() { return o.TableDimensions }
  };
})();
