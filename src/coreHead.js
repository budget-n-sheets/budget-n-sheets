var AppsScriptGlobal = (function() {
  var o = {
    test_chamber: false,

    AddonVersion: 54,
    AddonVersionName: "0.17.0-beta1",

    TemplateId: "",
    TemplateVersion: "5.4-beta",
    TemplateSheets: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "_Settings", "Cash Flow", "Tags", "Quick Actions", "_Backstage", "Cards", "Summary", "About" ],

    listNameMonth: [
      [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
      [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    ],

    listTagCategories: [
      [ 'A', 'D', 'E', 'F', 'G', 'K', 'L', 'S', 'T', 'U' ],
      [ 'Food and supply', 'Shopping and clothing', 'Hobby', 'Leisure time', 'Home', 'Other', 'Health and insurance', 'Services', 'Transport', 'Traveling' ]
    ],
    listScreenResolutionFactor: [ 1, 1.5, 2, 3 ],
  TableDimensions: { height:10, width:5 }
  };

  return {
    test_chamber: function() { return o.test_chamber },

    AddonVersion: function() { return o.AddonVersion },
    AddonVersionName: function() { return o.AddonVersionName },

    TemplateId: function() { return o.TemplateId },
    TemplateVersion: function() { return o.TemplateVersion },
    TemplateSheets: function() { return o.TemplateSheets },

    listNameMonth: function() { return o.listNameMonth },

    listTagCategories: function() { return o.listTagCategories },
    listScreenResolutionFactor: function() { return o.listScreenResolutionFactor },
    TableDimensions: function() { return o.TableDimensions }
  };
})();
