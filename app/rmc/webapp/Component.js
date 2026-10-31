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
        selectedPriceChange: {},
        commodities: [],
        rmTypes: [],
        rmGrades: [],
        rmSubGrades: [],
        rmMasterRequests: [],
        suppliers: [],
        materials: [],
        bomHeaders: [],
        vendorPartLinkages: [],
        selectedLinkage: {},
        contractSearch: [],
        newLinkage: { supplierID: "", materialID: "", plant: "1000", purchasingOrg: "P100", contractItemID: "", revisionLevel: "B01", validFrom: "2026-11-01", validTo: "2027-12-31", missingContractReason: "" },
        newComposition: { bomHeaderID: "", validFrom: "2026-11-01", validTo: "2027-12-31" },
        selectedProfile: {},
        bomHierarchy: [],
        leafMapping: { bomItemID: "", gradeID: "", subGradeID: "", inputWeight: "1", outputWeight: "1", scrapWeight: "0", uoM: "KG", overrideReason: "" },
        workflowExceptions: [],
        reconciliations: [],
        newCommodity: { code: "", name: "", description: "", validFrom: "2026-11-01", validTo: "2027-12-31" },
        commodityCloseDate: "2026-10-28",
        newRmRequest: { requestType: "TYPE", proposedCode: "", proposedName: "", validFrom: "2026-11-01", validTo: "2027-12-31", reason: "", defaultPriceUoM: "KG", defaultCurrency: "INR" },
        workbench: {},
        costSheet: [],
        impactBreakdown: [],
        impactedParts: [],
        processStages: [],
        workflowStages: [],
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
