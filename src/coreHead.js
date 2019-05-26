var AppsScriptGlobal = (function() {
  var o = {
    test_chamber: false,

    AddonVersion: 54,
    AddonVersionName: "0.17.0-beta3",

    TemplateId: "",
    TemplateVersion: 50,
    TemplateVersionName: "5.4-beta1",
    TemplateSheets: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "Cards", "Summary", "About" ],

    listNameMonth: [
      [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
      [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    ],

    listTagCategories: [
      [ 'A', 'D', 'E', 'F', 'G', 'K', 'L', 'S', 'T', 'U' ],
      [ 'Food and supply', 'Shopping and clothing', 'Hobby', 'Leisure time', 'Home', 'Other', 'Health and insurance', 'Services', 'Transport', 'Traveling' ]
    ],
    TableDimensions: { height:10, width:5 }
  };

  return {
    test_chamber: function() { return o.test_chamber },

    AddonVersion: function() { return o.AddonVersion },
    AddonVersionName: function() { return o.AddonVersionName },

    TemplateId: function() { return o.TemplateId },
    TemplateVersion: function() { return o.TemplateVersion },
    TemplateVersionName: function() { return o.TemplateVersionName },
    TemplateSheets: function() { return o.TemplateSheets },

    listNameMonth: function() { return o.listNameMonth },

    listTagCategories: function() { return o.listTagCategories },
    TableDimensions: function() { return o.TableDimensions }
  };
})();
