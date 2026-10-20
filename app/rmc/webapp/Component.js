sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("rmc.app.Component", {
    metadata: { manifest: "json" },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(new JSONModel({
        busy: false,
        dashboard: {},
        priceChanges: [],
        calculations: [],
        profiles: [],
        constituents: [],
        proposals: [],
        postings: [],
        settings: [],
        movementRules: [],
        ruleTemplates: [],
        approvalPolicies: []
      }), "app");
    }
  });
});
