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
        navigationExpanded: true,
        selectedNavigationKey: "overview",
        selectedPersona: "ALL",
        personaOptions: [
          { key: "ALL", text: "All personas (demo)", icon: "sap-icon://group" },
          { key: "BUYER", text: "Buyer", icon: "sap-icon://customer-financial-fact-sheet" },
          { key: "RM_ADMIN", text: "RM Admin", icon: "sap-icon://shield" },
          { key: "COMMODITY_ADMIN", text: "Commodity Admin", icon: "sap-icon://dimension" },
          { key: "APPROVER", text: "Approver", icon: "sap-icon://approvals" }
        ],
        persona: {
          key: "ALL", label: "All personas", description: "Complete demonstration workspace", icon: "sap-icon://group", defaultTab: "overview",
          showAnalytics: true, showMasterData: true, showPrices: true, showWorkbench: true, showPartContent: true, showGovernance: true, showAdmin: true,
          canBuyer: true, canRmAdmin: true, canCommodityAdmin: true, canApprover: true
        },
        dashboard: {},
        dashboardVisuals: { healthBars: [], contributionBars: [] },
        analytics: { monthlyTrend: [], supplierExposure: [], commodityComparison: [], impactTrend: [], workflowMix: [] },
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
        newLinkage: { supplierID: "", materialID: "", plant: "1000", purchasingOrg: "P100", contractItemID: "", revisionLevel: "B01", validFrom: "2026-11-01", validTo: "2027-12-31", missingContractReason: "", linkageType: "BOUGHT_OUT", partType: "BOUGHT_OUT", indexingFrequency: "QUARTERLY", initialSettledRate: "", initialRateCurrency: "INR", preliminaryExposure: false, sourceReference: "" },
        newComposition: { bomHeaderID: "", validFrom: "2026-11-01", validTo: "2027-12-31" },
        selectedProfile: {},
        bomHierarchy: [],
        leafMapping: { bomItemID: "", gradeID: "", subGradeID: "", inputWeight: "1", outputWeight: "1", scrapWeight: "0", uoM: "KG", overrideReason: "", minimumThickness: "", maximumThickness: "", tubeOutsideDiameter: "", length: "", width: "", numberOfBlanks: "", plmWeight: "", finishWeight: "", forgeCastWeight: "", offcutWeight: "", offcutPct: "", scrapYieldPct: "", surfaceArea: "", surfaceAreaUoM: "M2", surfaceProcess: "", surfaceProtectionCost: "", boughtOutCost: "", packagingTermsCost: "", polypropyleneContent: "", talcPct: "", impactModifier: "1" },
        workflowExceptions: [],
        reconciliations: [],
        newCommodity: { code: "", name: "", description: "", validFrom: "2026-11-01", validTo: "2027-12-31" },
        commodityCloseDate: "2026-10-28",
        newRmRequest: { requestType: "TYPE", proposedCode: "", proposedName: "", validFrom: "2026-11-01", validTo: "2027-12-31", reason: "", defaultPriceUoM: "KG", defaultCurrency: "INR" },
        newPriceChange: { supplierID: "", gradeID: "", subGradeID: "", purchasingOrg: "P100", plant: "1000", inputMode: "ABSOLUTE", enteredValue: "", priceUoM: "KG", priceUnit: "1", currency: "INR", validFrom: "2026-11-01", validTo: "2027-12-31", secondAmendmentDate: "", thirdAmendmentDate: "", reason: "", sourceReference: "", attachmentReference: "" },
        approvalComment: "",
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
        approvalPolicies: [],
        approvalRecords: [],
        systemEvents: [],
        legacyControls: []
      }), "app");
    }
  });
});
