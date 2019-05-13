var AppsScriptGlobal = (function() {
  var o = {
    test_chamber: false,

    SpreadsheetTemplateId: '',
    SpreadsheetTemplateVersion: '4.10',
    SpreadsheetTemplateListSheets: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', '_Settings', 'Cash Flow', 'Tags', 'Quick Actions', '_Backstage', 'Cards', 'Summary', 'About' ],

    AddonVersion: 54,
    AddonVersionName: "0.16.2",
    DateNextRelease: 0,

    listNameMonth: [
      [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
      [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    ],

    requiredVersion: {
      showPanelTables: 54,
      showPanelTags: 53,
      showSidebarMainSettings: 53,
      toolUpdateCashFlow: 53
    },
    listTagCategories: [
      [ 'A', 'D', 'E', 'F', 'G', 'K', 'L', 'S', 'T', 'U' ],
      [ 'Food and supply', 'Shopping and clothing', 'Hobby', 'Leisure time', 'Home', 'Other', 'Health and insurance', 'Services', 'Transport', 'Traveling' ]
    ],
    listScreenResolutionFactor: [ 1, 1.5, 2, 3 ]
  };

  return {
    test_chamber: function() { return o.test_chamber },

    SpreadsheetTemplateId: function() { return o.SpreadsheetTemplateId },
    SpreadsheetTemplateVersion: function() { return o.SpreadsheetTemplateVersion },
    SpreadsheetTemplateListSheets: function() { return o.SpreadsheetTemplateListSheets },

    AddonVersion: function() { return o.AddonVersion },
    AddonVersionName: function() { return o.AddonVersionName },
    DateNextRelease: function() { return o.DateNextRelease },

    listNameMonth: function() { return o.listNameMonth },

    requiredVersion: function() { return o.requiredVersion },
    listTagCategories: function() { return o.listTagCategories },
    listScreenResolutionFactor: function() { return o.listScreenResolutionFactor }
  };
})();
