sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, MessageBox, MessageToast, Filter, FilterOperator) {
  "use strict";

  const RMC = "/odata/v4/rmc";
  const ADMIN = "/odata/v4/admin";
  const PERSONAS = {
    ALL: { label: "All personas", description: "Complete demonstration workspace", icon: "sap-icon://group", defaultTab: "overview", showAnalytics: true, showMasterData: true, showPrices: true, showWorkbench: true, showPartContent: true, showGovernance: true, showAdmin: true, canBuyer: true, canRmAdmin: true, canCommodityAdmin: true, canApprover: true },
    BUYER: { label: "Buyer", description: "Master requests, linkages, composition and price amendments", icon: "sap-icon://customer-financial-fact-sheet", defaultTab: "masterData", showAnalytics: true, showMasterData: true, showPrices: true, showWorkbench: true, showPartContent: true, showGovernance: false, showAdmin: false, canBuyer: true, canRmAdmin: false, canCommodityAdmin: false, canApprover: false },
    RM_ADMIN: { label: "RM Admin", description: "RM hierarchy activation and lifecycle governance", icon: "sap-icon://shield", defaultTab: "masterData", showAnalytics: true, showMasterData: true, showPrices: false, showWorkbench: false, showPartContent: false, showGovernance: true, showAdmin: false, canBuyer: false, canRmAdmin: true, canCommodityAdmin: false, canApprover: false },
    COMMODITY_ADMIN: { label: "Commodity Admin", description: "Acceptable commodity catalog and validity", icon: "sap-icon://dimension", defaultTab: "masterData", showAnalytics: true, showMasterData: true, showPrices: false, showWorkbench: false, showPartContent: false, showGovernance: true, showAdmin: false, canBuyer: false, canRmAdmin: false, canCommodityAdmin: true, canApprover: false },
    APPROVER: { label: "Approver", description: "Exception, composition and commercial decisions", icon: "sap-icon://approvals", defaultTab: "prices", showAnalytics: true, showMasterData: true, showPrices: true, showWorkbench: true, showPartContent: true, showGovernance: true, showAdmin: false, canBuyer: false, canRmAdmin: false, canCommodityAdmin: false, canApprover: true }
  };

  return Controller.extend("rmc.app.controller.App", {
    onInit: function () {
      this.onRefresh();
      this._refreshTimer = null;
    },

    onExit: function () {
      clearInterval(this._refreshTimer);
    },

    _model: function () {
      return this.getOwnerComponent().getModel("app");
    },

    _scrollToTop: function () {
      window.setTimeout(() => {
        window.scrollTo(0, 0);
        document.querySelector(".sapMPageEnableScrolling")?.scrollTo(0, 0);
      }, 0);
    },

    onToggleSideNavigation: function () {
      const model = this._model();
      model.setProperty("/navigationExpanded", !model.getProperty("/navigationExpanded"));
    },

    onNavigationSelect: function (event) {
      const key = event.getParameter("item")?.getKey();
      if (!key) return;
      this._model().setProperty("/selectedNavigationKey", key);
      this.byId("mainTabs")?.setSelectedKey(key);
      this._scrollToTop();
    },

    onPersonaChange: function (event) {
      const key = event.getParameter("selectedItem")?.getKey() || this._model().getProperty("/selectedPersona") || "ALL";
      const persona = PERSONAS[key] || PERSONAS.ALL;
      this._model().setProperty("/selectedPersona", key);
      this._model().setProperty("/persona", { key, ...persona });
      this._model().setProperty("/selectedNavigationKey", persona.defaultTab);
      this.byId("mainTabs")?.setSelectedKey(persona.defaultTab);
      this._scrollToTop();
      MessageToast.show(`Viewing the application as ${persona.label}`);
    },

    _request: async function (url, options) {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        ...options
      });
      if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
          const body = await response.json();
          message = body.error?.message || body.error?.message?.value || message;
        } catch (_ignored) { /* response was not JSON */ }
        throw new Error(message);
      }
      return response.status === 204 ? null : response.json();
    },

    _query: async function (url) {
      const result = await this._request(url);
      return result.value || [];
    },

    onRefresh: async function () {
      const model = this._model();
      model.setProperty("/busy", true);
      try {
        await Promise.all([
          this._loadDashboard(),
          this._loadPriceChanges(),
          this._loadMasterData(),
          this._loadContent(),
          this._loadPostings(),
          this._loadAdmin(),
          this._loadGovernance()
        ]);
        await this._initializeContentSelection();
        this._buildDashboardVisuals();
      } catch (error) {
        MessageBox.error(error.message);
      } finally {
        model.setProperty("/busy", false);
      }
    },

    _loadDashboard: async function () {
      const data = await this._request(`${RMC}/getDashboard`, { method: "POST", body: "{}" });
      this._model().setProperty("/dashboard", data);
    },

    _initializeContentSelection: async function () {
      const model = this._model();
      const linkages = model.getProperty("/vendorPartLinkages") || [];
      const profiles = model.getProperty("/profiles") || [];
      const selectedLinkage = model.getProperty("/selectedLinkage");
      const selectedProfile = model.getProperty("/selectedProfile");
      if (!selectedLinkage?.ID && linkages[0]) model.setProperty("/selectedLinkage", linkages[0]);
      if (!selectedProfile?.ID && profiles[0]) model.setProperty("/selectedProfile", profiles[0]);
      if (model.getProperty("/selectedLinkage/material_ID")) await this.onLoadBomHierarchy();
    },

    _buildDashboardVisuals: function () {
      const model = this._model();
      const workbench = model.getProperty("/workbench") || {};
      const linkages = model.getProperty("/vendorPartLinkages") || [];
      const profiles = model.getProperty("/profiles") || [];
      const findings = model.getProperty("/workflowExceptions") || [];
      const priceChanges = model.getProperty("/priceChanges") || [];
      const commodities = model.getProperty("/commodities") || [];
      const rmTypes = model.getProperty("/rmTypes") || [];
      const rmGrades = model.getProperty("/rmGrades") || [];
      const rmSubGrades = model.getProperty("/rmSubGrades") || [];
      const selectedPrice = model.getProperty("/selectedPriceChange") || {};
      const stages = model.getProperty("/processStages") || [];
      const breakdown = model.getProperty("/impactBreakdown") || [];
      const currentPrice = Number(workbench.currentPoPrice || 0);
      const proposedPrice = Number(workbench.revisedPoPrice || 0);
      const priceMaximum = Math.max(1, currentPrice, proposedPrice);
      const allocated = linkages.filter((row) => row.contractStatus === "ALLOCATED").length;
      const approvedProfiles = profiles.filter((row) => row.status === "APPROVED").length;
      const resolvedFindings = findings.filter((row) => row.status !== "OPEN").length;
      const approvedPrices = priceChanges.filter((row) => row.status === "APPROVED").length;
      const completeStages = stages.filter((row) => row.state === "Success").length;
      const percent = (value, total) => total ? Math.round(value / total * 100) : 100;
      model.setProperty("/dashboardVisuals", {
        currentPrice,
        proposedPrice,
        currentPricePercent: currentPrice / priceMaximum * 100,
        proposedPricePercent: proposedPrice / priceMaximum * 100,
        unitDelta: Number(workbench.unitDelta || 0),
        eligibleQuantity: Number(workbench.eligibleQuantity || 0),
        estimatedImpact: Number(workbench.estimatedImpact || 0),
        currency: workbench.currency || "INR",
        priceChangePct: Number(workbench.priceChangePct || 0),
        affectedParts: Number(workbench.affectedParts || 0),
        approvedPrices,
        openFindings: findings.filter((row) => row.status === "OPEN").length,
        priceRequestCount: priceChanges.length,
        selectedRequestNumber: selectedPrice.requestNumber || "No request selected",
        selectedOldPrice: Number(selectedPrice.oldPrice || 0),
        selectedProposedPrice: Number(selectedPrice.proposedPrice || 0),
        selectedPriceStatus: selectedPrice.status || "NOT SELECTED",
        selectedDocumentStatus: selectedPrice.priceDocumentStatus || "NOT RELEASED",
        masterCounts: [
          { label: "Commodities", value: commodities.length, detail: "Governed catalog", icon: "sap-icon://dimension", accent: "Purple" },
          { label: "RM types", value: rmTypes.length, detail: "Commodity-linked", icon: "sap-icon://product", accent: "Blue" },
          { label: "Grades", value: rmGrades.length, detail: "Approved hierarchy", icon: "sap-icon://multi-select", accent: "Indigo" },
          { label: "Subgrades", value: rmSubGrades.length, detail: "Pricing precision", icon: "sap-icon://tag", accent: "Cyan" }
        ],
        stageCompletion: percent(completeStages, stages.length),
        healthBars: [
          { label: "Contract allocation", detail: `${allocated} of ${linkages.length}`, percent: percent(allocated, linkages.length), state: allocated === linkages.length ? "Success" : "Warning" },
          { label: "Approved composition", detail: `${approvedProfiles} of ${profiles.length}`, percent: percent(approvedProfiles, profiles.length), state: approvedProfiles === profiles.length ? "Success" : "Warning" },
          { label: "Resolved findings", detail: `${resolvedFindings} of ${findings.length}`, percent: percent(resolvedFindings, findings.length), state: resolvedFindings === findings.length ? "Success" : "Warning" },
          { label: "Journey readiness", detail: `${completeStages} of ${stages.length} stages`, percent: percent(completeStages, stages.length), state: completeStages === stages.length ? "Success" : "Information" }
        ],
        contributionBars: breakdown.map((row) => ({
          ...row,
          currentPercent: Number(row.currentPercent || 0),
          proposedPercent: Number(row.proposedPercent || 0)
        }))
      });
      this._buildAnalyticsModel();
    },

    _buildAnalyticsModel: function () {
      const model = this._model();
      const visuals = model.getProperty("/dashboardVisuals") || {};
      const priceChanges = model.getProperty("/priceChanges") || [];
      const basePrice = Number(visuals.currentPrice || 2250);
      const currency = visuals.currency || "INR";
      const scaleHeight = (value, maximum, minimum = 0) => `${Math.max(1.1, ((value - minimum) / Math.max(1, maximum - minimum)) * 7.2 + 1.2).toFixed(2)}rem`;
      const trendValues = [2085, 2100, 2092, 2130, 2165, 2188, 2204, 2195, 2220, 2236, basePrice, Number(visuals.proposedPrice || 2265)];
      const indexValues = [103, 104, 103, 106, 108, 110, 111, 110, 112, 114, 115, 117];
      const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
      const maximumTrend = Math.max(...trendValues);
      const minimumTrend = Math.min(...trendValues) - 35;
      const exposure = [
        ["Apex Components", 1240000, 100], ["Nova Forgings", 985000, 79], ["Orbit Mobility", 760000, 61],
        ["Prism Auto", 635000, 51], ["Vertex Metals", 420000, 34], ["Zenith Parts", 285000, 23]
      ];
      const commodities = [
        ["Steel", 118, 86], ["Aluminium", 112, 73], ["Copper", 106, 62],
        ["Polymer", 103, 54], ["Rubber", 99, 47], ["Zinc", 96, 39]
      ];
      const impacts = [1450, 1820, 1360, 2290, 2780, 3150, 3680, Number(visuals.estimatedImpact || 4200)];
      model.setProperty("/analytics", {
        currency,
        managedSpend: "4.33M",
        annualizedImpact: "50.4K",
        activeSuppliers: exposure.length,
        trackedCommodities: commodities.length,
        requestVolume: Math.max(priceChanges.length, 18),
        monthlyTrend: months.map((month, index) => ({
          month,
          price: trendValues[index],
          index: indexValues[index],
          priceHeight: scaleHeight(trendValues[index], maximumTrend, minimumTrend),
          indexHeight: scaleHeight(indexValues[index], 120, 98)
        })),
        supplierExposure: exposure.map(([label, value, percent]) => ({ label, value: value.toLocaleString("en-IN"), percent })),
        commodityComparison: commodities.map(([label, index, percent]) => ({ label, index, percent })),
        impactTrend: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((month, index) => ({
          month,
          value: impacts[index].toLocaleString("en-IN"),
          height: scaleHeight(impacts[index], Math.max(...impacts))
        })),
        workflowMix: [
          { label: "Approved", value: 46, state: "Success" },
          { label: "In review", value: 28, state: "Information" },
          { label: "Draft", value: 18, state: "Warning" },
          { label: "Exception", value: 8, state: "Error" }
        ]
      });
    },

    _loadPriceChanges: async function () {
      const query = "$expand=supplier,grade($expand=rawMaterialType),subGrade&$orderby=createdAt desc&$top=200";
      const rows = await this._query(`${RMC}/PriceChangeRequests?${query}`);
      this._model().setProperty("/priceChanges", rows);
      const currentId = this._model().getProperty("/selectedPriceChange/ID");
      const selected = rows.find((row) => row.ID === currentId) || rows[0];
      if (selected) {
        this._model().setProperty("/selectedPriceChange", selected);
        await this._loadPricingWorkbench(selected.ID);
      }
    },

    _loadMasterData: async function () {
      const [commodities, rmTypes, rmGrades, rmSubGrades, requests, linkages, suppliers, materials, bomHeaders] = await Promise.all([
        this._query(`${RMC}/Commodities?$orderby=code`),
        this._query(`${RMC}/RawMaterialTypes?$expand=commodity&$orderby=code`),
        this._query(`${RMC}/RawMaterialGrades?$expand=rawMaterialType&$orderby=code`),
        this._query(`${RMC}/RawMaterialSubGrades?$expand=grade($expand=rawMaterialType)&$orderby=code`),
        this._query(`${RMC}/RawMaterialMasterRequests?$orderby=createdAt desc&$top=100`),
        this._query(`${RMC}/VendorPartLinkages?$expand=supplier,material,contractItem($expand=contract)&$orderby=createdAt desc&$top=200`),
        this._query(`${RMC}/Suppliers?$orderby=code`),
        this._query(`${RMC}/Materials?$orderby=code`),
        this._query(`${RMC}/BomHeaders?$expand=material&$orderby=material/code,validFrom desc`)
      ]);
      const model = this._model();
      model.setProperty("/commodities", commodities);
      model.setProperty("/rmTypes", rmTypes);
      model.setProperty("/rmGrades", rmGrades);
      model.setProperty("/rmSubGrades", rmSubGrades);
      model.setProperty("/rmMasterRequests", requests);
      model.setProperty("/vendorPartLinkages", linkages);
      model.setProperty("/suppliers", suppliers);
      model.setProperty("/materials", materials);
      model.setProperty("/bomHeaders", bomHeaders);
      if (!model.getProperty("/newLinkage/supplierID") && suppliers[0]) model.setProperty("/newLinkage/supplierID", suppliers[0].ID);
      if (!model.getProperty("/newLinkage/materialID") && materials[0]) model.setProperty("/newLinkage/materialID", materials[0].ID);
      if (!model.getProperty("/leafMapping/gradeID") && rmGrades[0]) model.setProperty("/leafMapping/gradeID", rmGrades[0].ID);
      if (!model.getProperty("/leafMapping/subGradeID") && rmSubGrades[0]) model.setProperty("/leafMapping/subGradeID", rmSubGrades[0].ID);
      if (!model.getProperty("/newComposition/bomHeaderID") && bomHeaders[0]) model.setProperty("/newComposition/bomHeaderID", bomHeaders[0].ID);
      if (!model.getProperty("/newPriceChange/supplierID") && suppliers[0]) model.setProperty("/newPriceChange/supplierID", suppliers[0].ID);
      if (!model.getProperty("/newPriceChange/gradeID") && rmGrades[0]) model.setProperty("/newPriceChange/gradeID", rmGrades[0].ID);
    },

    _loadPricingWorkbench: async function (priceChangeID) {
      const payload = JSON.stringify({ priceChangeID });
      const [summary, costResult, breakdownResult, impactedResult] = await Promise.all([
        this._request(`${RMC}/getPricingWorkbench`, { method: "POST", body: payload }),
        this._request(`${RMC}/getCostSheet`, { method: "POST", body: payload }),
        this._request(`${RMC}/getImpactBreakdown`, { method: "POST", body: payload }),
        this._request(`${RMC}/getImpactedParts`, { method: "POST", body: payload })
      ]);
      const costSheet = costResult.value || costResult;
      const breakdown = breakdownResult.value || breakdownResult;
      const maximum = Math.max(1, ...breakdown.map((row) => Number(row.proposedValue || 0)));
      const visualBreakdown = breakdown.map((row) => ({
        ...row,
        currentPercent: Math.max(0, Number(row.currentValue || 0) / maximum * 100),
        proposedPercent: Math.max(0, Number(row.proposedValue || 0) / maximum * 100)
      }));
      this._model().setProperty("/workbench", summary);
      this._model().setProperty("/costSheet", costSheet);
      this._model().setProperty("/impactBreakdown", visualBreakdown);
      this._model().setProperty("/impactedParts", impactedResult.value || impactedResult);
      this._model().setProperty("/processStages", this._processStages(summary, costSheet));
      this._model().setProperty("/workflowStages", this._workflowStages(summary));
    },

    _processStages: function (summary, costSheet) {
      const approved = summary.status === "APPROVED";
      return [
        { number: "01", title: "Master Data", detail: "RM, grade and vendor", state: "Success", icon: "sap-icon://database" },
        { number: "02", title: "Composition", detail: "Approved cost BOM", state: costSheet.length ? "Success" : "Error", icon: "sap-icon://tree" },
        { number: "03", title: "RM Price", detail: approved ? "Approved revision" : summary.status, state: approved ? "Success" : "Warning", icon: "sap-icon://money-bills" },
        { number: "04", title: "Cost Sheet", detail: `${costSheet.length} constituents`, state: costSheet.length ? "Success" : "Error", icon: "sap-icon://table-chart" },
        { number: "05", title: "Simulate", detail: `${summary.currency} ${summary.estimatedImpact}`, state: approved ? "Information" : "None", icon: "sap-icon://simulate" },
        { number: "06", title: "Execute", detail: "Controlled posting", state: "None", icon: "sap-icon://paper-plane" },
        { number: "07", title: "Insights", detail: "Reconcile and learn", state: "None", icon: "sap-icon://business-objects-experience" }
      ];
    },

    _workflowStages: function (summary) {
      const rank = { DRAFT: 0, REJECTED: 0, SUBMITTED: 1, UNDER_REVIEW: 2, APPROVED: 3, EFFECTIVE: 4, SUPERSEDED: 5 }[summary.status] || 0;
      return [
        { number: "01", title: "Created", role: "Price Requester", state: "Success", complete: true },
        { number: "02", title: "Submitted", role: "Commercial Analyst", state: rank >= 1 ? "Success" : "None", complete: rank >= 1 },
        { number: "03", title: "Commercial approval", role: "Purchasing Approver", state: rank >= 3 ? "Success" : "Information", complete: rank >= 3 },
        { number: "04", title: "Impact simulation", role: "Pricing Analyst", state: rank >= 3 ? "Information" : "None", complete: false },
        { number: "05", title: "Finance approval", role: "Finance Reviewer", state: "None", complete: false },
        { number: "06", title: "Execution", role: "Posting Service", state: "None", complete: false }
      ];
    },

    _loadCalculations: async function (showErrors) {
      try {
        const query = "$expand=priceChange&$orderby=createdAt desc&$top=200";
        this._model().setProperty("/calculations", await this._query(`${RMC}/CalculationRuns?${query}`));
        await this._loadDashboard();
      } catch (error) {
        if (showErrors) MessageBox.error(error.message);
      }
    },

    _loadContent: async function () {
      const query = "$expand=profile($expand=material,supplier,contractItem),grade($expand=rawMaterialType),subGrade&$orderby=createdAt desc&$top=500";
      const [constituents, profiles, exceptions, reconciliations] = await Promise.all([
        this._query(`${RMC}/PartConstituents?${query}`),
        this._query(`${RMC}/PartProfiles?$expand=linkage,material,supplier,contractItem,bomHeader&$orderby=createdAt desc&$top=200`),
        this._query(`${RMC}/WorkflowExceptions?$orderby=createdAt desc&$top=200`),
        this._query(`${RMC}/ReconciliationRecords?$orderby=createdAt desc&$top=100`)
      ]);
      this._model().setProperty("/constituents", constituents);
      this._model().setProperty("/profiles", profiles);
      this._model().setProperty("/workflowExceptions", exceptions);
      this._model().setProperty("/reconciliations", reconciliations);
    },

    _loadPostings: async function () {
      const [postings, proposals] = await Promise.all([
        this._query(`${RMC}/PostingRecords?$orderby=createdAt desc&$top=100`),
        this._query(`${RMC}/ContractPriceProposals?$expand=contractItem($expand=contract)&$orderby=createdAt desc&$top=100`)
      ]);
      this._model().setProperty("/postings", postings);
      this._model().setProperty("/proposals", proposals);
    },

    _loadAdmin: async function () {
      const [settings, movementRules, ruleTemplates, approvalPolicies] = await Promise.all([
        this._query(`${ADMIN}/AppSettings?$orderby=category,settingKey`),
        this._query(`${ADMIN}/MovementTypeRules?$orderby=movementType`),
        this._query(`${ADMIN}/PriceRuleTemplates?$orderby=code`),
        this._query(`${ADMIN}/ApprovalPolicies?$orderby=objectType,sequence`)
      ]);
      this._model().setProperty("/settings", settings);
      this._model().setProperty("/movementRules", movementRules);
      this._model().setProperty("/ruleTemplates", ruleTemplates);
      this._model().setProperty("/approvalPolicies", approvalPolicies);
    },

    _loadGovernance: async function () {
      const [approvals, events, controlsResult] = await Promise.all([
        this._query(`${RMC}/ApprovalRecords?$orderby=decidedAt desc&$top=200`),
        this._query(`${RMC}/SystemEvents?$orderby=occurredAt desc&$top=200`),
        this._request(`${RMC}/getLegacyControlMatrix`, { method: "POST", body: "{}" })
      ]);
      this._model().setProperty("/approvalRecords", approvals);
      this._model().setProperty("/systemEvents", events);
      this._model().setProperty("/legacyControls", controlsResult.value || controlsResult);
    },

    _selected: function (tableId, label) {
      const item = this.byId(tableId).getSelectedItem();
      if (!item) {
        MessageToast.show(`Select a ${label} first.`);
        return null;
      }
      return item.getBindingContext("app").getObject();
    },

    _approvalComment: function () {
      const comment = String(this._model().getProperty("/approvalComment") || "").trim();
      if (!comment) MessageToast.show("Enter an approval or rejection remark first.");
      return comment;
    },

    _action: async function (name, payload, successMessage) {
      this._model().setProperty("/busy", true);
      try {
        await this._request(`${RMC}/${name}`, { method: "POST", body: JSON.stringify(payload) });
        MessageToast.show(successMessage);
        await this.onRefresh();
      } catch (error) {
        MessageBox.error(error.message);
      } finally {
        this._model().setProperty("/busy", false);
      }
    },

    onCreatePriceChange: function () {
      const draft = this._model().getProperty("/newPriceChange");
      this._action("createPriceChange", {
        supplierID: draft.supplierID,
        gradeID: draft.gradeID,
        subGradeID: draft.subGradeID || null,
        purchasingOrg: draft.purchasingOrg,
        plant: draft.plant,
        inputMode: draft.inputMode,
        enteredValue: draft.enteredValue,
        priceUoM: draft.priceUoM,
        priceUnit: Number(draft.priceUnit || 1),
        currency: draft.currency,
        validFrom: draft.validFrom,
        validTo: draft.validTo || null,
        secondAmendmentDate: draft.secondAmendmentDate || null,
        thirdAmendmentDate: draft.thirdAmendmentDate || null,
        reason: draft.reason,
        sourceReference: draft.sourceReference || null,
        attachmentReference: draft.attachmentReference || null
      }, "Price-change draft created with overlap and effective-price validation.");
    },

    onSubmitPrice: function () {
      const row = this._selected("priceTable", "price request");
      if (row) this._action("submitPriceChange", { priceChangeID: row.ID, expectedVersion: row.version }, "Price change submitted.");
    },

    onPriceSelectionChange: async function (event) {
      const row = event.getParameter("listItem")?.getBindingContext("app")?.getObject();
      if (!row) return;
      this._model().setProperty("/selectedPriceChange", row);
      this._model().setProperty("/busy", true);
      try {
        await this._loadPricingWorkbench(row.ID);
        MessageToast.show("Pricing workbench refreshed for the selected request.");
      } catch (error) {
        MessageBox.error(error.message);
      } finally {
        this._model().setProperty("/busy", false);
      }
    },

    onMasterSearch: function (event) {
      const value = event.getParameter("newValue") || "";
      const filters = value ? [new Filter({
        filters: [
          new Filter("code", FilterOperator.Contains, value),
          new Filter("name", FilterOperator.Contains, value)
        ],
        and: false
      })] : [];
      ["commodityTable", "rmTypeTable", "rmGradeTable", "rmSubGradeTable"].forEach((id) => {
        this.byId(id).getBinding("items")?.filter(filters);
      });
    },

    onCreateRmRequest: async function () {
      const draft = this._model().getProperty("/newRmRequest");
      const payload = {
        requestType: draft.requestType,
        proposedCode: String(draft.proposedCode || "").trim().toUpperCase(),
        proposedName: String(draft.proposedName || "").trim(),
        validFrom: draft.validFrom,
        validTo: draft.validTo || null,
        reason: String(draft.reason || "").trim(),
        defaultPriceUoM: draft.defaultPriceUoM || null,
        defaultCurrency: draft.defaultCurrency || null,
        commodity_ID: this.byId("requestCommodity").getSelectedKey() || null,
        rawMaterialType_ID: this.byId("requestRmType").getSelectedKey() || null,
        grade_ID: this.byId("requestGrade").getSelectedKey() || null
      };
      try {
        await this._request(`${RMC}/RawMaterialMasterRequests`, { method: "POST", body: JSON.stringify(payload) });
        MessageToast.show("RM master request saved as draft.");
        this._model().setProperty("/newRmRequest/proposedCode", "");
        this._model().setProperty("/newRmRequest/proposedName", "");
        this._model().setProperty("/newRmRequest/reason", "");
        await this._loadMasterData();
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onCreateCommodity: async function () {
      const draft = this._model().getProperty("/newCommodity");
      const saved = await this._commodityAction("createCommodity", {
        code: draft.code,
        name: draft.name,
        description: draft.description || null,
        validFrom: draft.validFrom,
        validTo: draft.validTo || null
      }, "Commodity created and activated.");
      if (saved) {
        this._model().setProperty("/newCommodity/code", "");
        this._model().setProperty("/newCommodity/name", "");
        this._model().setProperty("/newCommodity/description", "");
      }
    },

    onCloseCommodityValidity: function () {
      const row = this._selected("commodityTable", "commodity");
      if (!row) return;
      this._commodityAction("closeCommodityValidity", {
        commodityID: row.ID,
        expectedVersion: row.version,
        validTo: this._model().getProperty("/commodityCloseDate")
      }, `Validity closed for ${row.code}.`);
    },

    onToggleCommodityDeletion: function () {
      const row = this._selected("commodityTable", "commodity");
      if (!row) return;
      const markedForDeletion = !row.markedForDeletion;
      const execute = () => this._commodityAction("setCommodityDeletionMarker", {
        commodityID: row.ID,
        expectedVersion: row.version,
        markedForDeletion
      }, markedForDeletion ? `${row.code} marked for deletion.` : `${row.code} deletion marker cleared.`);
      if (!markedForDeletion) {
        execute();
        return;
      }
      MessageBox.confirm(`Mark ${row.code} for deletion? Existing references and audit history will be retained.`, {
        emphasizedAction: MessageBox.Action.OK,
        onClose: (action) => {
          if (action === MessageBox.Action.OK) execute();
        }
      });
    },

    _commodityAction: async function (name, payload, message) {
      this._model().setProperty("/busy", true);
      try {
        await this._request(`${RMC}/${name}`, { method: "POST", body: JSON.stringify(payload) });
        MessageToast.show(message);
        await this._loadMasterData();
        return true;
      } catch (error) {
        MessageBox.error(error.message);
        return false;
      } finally {
        this._model().setProperty("/busy", false);
      }
    },

    onSearchContracts: async function () {
      const draft = this._model().getProperty("/newLinkage");
      try {
        const result = await this._request(`${RMC}/searchValidContractItems`, {
          method: "POST",
          body: JSON.stringify({ supplierID: draft.supplierID, materialID: draft.materialID, plant: draft.plant, businessDate: draft.validFrom })
        });
        const rows = result.value || result;
        this._model().setProperty("/contractSearch", rows);
        this._model().setProperty("/newLinkage/contractItemID", rows[0]?.contractItemID || "");
        MessageToast.show(rows.length ? `${rows.length} valid contract item(s) found.` : "No valid contract found; provide an exception reason.");
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onCreateLinkage: function () {
      const draft = this._model().getProperty("/newLinkage");
      this._action("createVendorPartLinkage", {
        supplierID: draft.supplierID,
        materialID: draft.materialID,
        plant: draft.plant,
        purchasingOrg: draft.purchasingOrg,
        contractItemID: draft.contractItemID || null,
        revisionLevel: draft.revisionLevel,
        validFrom: draft.validFrom,
        validTo: draft.validTo || null,
        missingContractReason: draft.contractItemID ? null : draft.missingContractReason,
        linkageType: draft.linkageType,
        partType: draft.partType,
        indexingFrequency: draft.indexingFrequency,
        initialSettledRate: draft.initialSettledRate || null,
        initialRateCurrency: draft.initialRateCurrency || null,
        preliminaryExposure: Boolean(draft.preliminaryExposure),
        sourceReference: draft.sourceReference || null
      }, draft.contractItemID ? "Vendor-part linkage created with contract allocation." : "Linkage created and no-contract exception submitted.");
    },

    onLinkageSelectionChange: async function (event) {
      const row = event.getParameter("listItem")?.getBindingContext("app")?.getObject();
      if (!row) return;
      this._model().setProperty("/selectedLinkage", row);
      this._model().setProperty("/newLinkage/supplierID", row.supplier_ID);
      this._model().setProperty("/newLinkage/materialID", row.material_ID);
      this._model().setProperty("/newLinkage/plant", row.plant);
      this._model().setProperty("/newLinkage/purchasingOrg", row.purchasingOrg);
      this._model().setProperty("/newLinkage/validFrom", row.validFrom);
      await this.onLoadBomHierarchy();
    },

    onApproveContractException: function () {
      const row = this._selected("linkageTable", "linkage");
      if (row) this._action("decideContractException", { linkageID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment: "Approved controlled no-contract continuation in demo." }, "No-contract exception approved.");
    },

    onRejectContractException: function () {
      const row = this._selected("linkageTable", "linkage");
      if (row) this._action("decideContractException", { linkageID: row.ID, expectedVersion: row.version, decision: "REJECT", comment: "Missing-contract justification rejected in demo." }, "No-contract exception rejected.");
    },

    onAllocateContract: function () {
      const row = this._selected("linkageTable", "linkage");
      const contractItemID = this._model().getProperty("/newLinkage/contractItemID");
      if (row && contractItemID) this._action("allocateContract", { linkageID: row.ID, expectedVersion: row.version, contractItemID, businessDate: row.validFrom }, "Contract allocated to the linkage.");
      else if (row) MessageToast.show("Search and select a valid contract item first.");
    },

    onLoadBomHierarchy: async function () {
      const row = this._model().getProperty("/selectedLinkage");
      if (!row?.material_ID) return;
      try {
        const result = await this._request(`${RMC}/getBomHierarchy`, {
          method: "POST",
          body: JSON.stringify({ materialID: row.material_ID, plant: row.plant, keyDate: row.validFrom })
        });
        const nodes = result.value || result;
        this._model().setProperty("/bomHierarchy", nodes);
        this._model().setProperty("/leafMapping/bomItemID", nodes.find((node) => node.leafPart)?.bomItemID || "");
        const header = this._model().getProperty("/bomHeaders").find((item) => item.material_ID === row.material_ID && item.plant === row.plant);
        this._model().setProperty("/newComposition/bomHeaderID", header?.ID || "");
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onCreateCompositionRevision: function () {
      const linkage = this._selected("linkageTable", "linkage");
      const draft = this._model().getProperty("/newComposition");
      if (linkage) this._action("createCompositionRevision", {
        linkageID: linkage.ID,
        expectedVersion: linkage.version,
        bomHeaderID: draft.bomHeaderID,
        validFrom: draft.validFrom,
        validTo: draft.validTo || null
      }, "Composition revision created from the effective BOM.");
    },

    onProfileSelectionChange: async function (event) {
      const row = event.getParameter("listItem")?.getBindingContext("app")?.getObject();
      if (!row) return;
      this._model().setProperty("/selectedProfile", row);
      const linkage = this._model().getProperty("/vendorPartLinkages").find((item) => item.ID === row.linkage_ID);
      if (linkage) {
        this._model().setProperty("/selectedLinkage", linkage);
        await this.onLoadBomHierarchy();
      }
    },

    onMapCompositionLeaf: function () {
      const profile = this._selected("profileTable", "composition revision");
      const mapping = this._model().getProperty("/leafMapping");
      if (profile) this._action("mapCompositionLeaf", {
        profileID: profile.ID,
        expectedVersion: profile.version,
        bomItemID: mapping.bomItemID,
        gradeID: mapping.gradeID,
        subGradeID: mapping.subGradeID || null,
        inputWeight: mapping.inputWeight,
        outputWeight: mapping.outputWeight,
        scrapWeight: mapping.scrapWeight,
        uoM: mapping.uoM,
        overrideReason: mapping.overrideReason || null,
        minimumThickness: mapping.minimumThickness || null,
        maximumThickness: mapping.maximumThickness || null,
        tubeOutsideDiameter: mapping.tubeOutsideDiameter || null,
        length: mapping.length || null,
        width: mapping.width || null,
        numberOfBlanks: mapping.numberOfBlanks || null,
        plmWeight: mapping.plmWeight || null,
        finishWeight: mapping.finishWeight || null,
        forgeCastWeight: mapping.forgeCastWeight || null,
        offcutWeight: mapping.offcutWeight || null,
        offcutPct: mapping.offcutPct || null,
        scrapYieldPct: mapping.scrapYieldPct || null,
        surfaceArea: mapping.surfaceArea || null,
        surfaceAreaUoM: mapping.surfaceAreaUoM || null,
        surfaceProcess: mapping.surfaceProcess || null,
        surfaceProtectionCost: mapping.surfaceProtectionCost || null,
        boughtOutCost: mapping.boughtOutCost || null,
        packagingTermsCost: mapping.packagingTermsCost || null,
        polypropyleneContent: mapping.polypropyleneContent || null,
        talcPct: mapping.talcPct || null,
        impactModifier: mapping.impactModifier || "1"
      }, "Leaf RM mapping saved and completeness recalculated.");
    },

    onSubmitComposition: function () {
      const row = this._selected("profileTable", "composition revision");
      if (row) this._action("submitComposition", { profileID: row.ID, expectedVersion: row.version }, "Composition submitted for approval.");
    },

    onApproveComposition: function () {
      const row = this._selected("profileTable", "composition revision");
      if (row) this._action("decideComposition", { profileID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment: "Approved complete leaf mapping in demo." }, "Composition revision approved and frozen.");
    },

    onRejectComposition: function () {
      const row = this._selected("profileTable", "composition revision");
      if (row) this._action("decideComposition", { profileID: row.ID, expectedVersion: row.version, decision: "REJECT", comment: "Returned for composition rework in demo." }, "Composition returned for rework.");
    },

    onResolveException: function () {
      const row = this._selected("exceptionTable", "workflow finding");
      if (row) this._action("resolveWorkflowException", { exceptionID: row.ID, expectedVersion: row.version, resolution: "Reviewed and resolved by Approver in demo.", exclude: false }, "Workflow finding resolved.");
    },

    onExcludeException: function () {
      const row = this._selected("exceptionTable", "non-mandatory workflow finding");
      if (row) this._action("resolveWorkflowException", { exceptionID: row.ID, expectedVersion: row.version, resolution: "Excluded with documented demo rationale.", exclude: true }, "Non-mandatory finding excluded.");
    },

    onReconcilePriceChange: function () {
      const row = this._model().getProperty("/selectedPriceChange");
      if (row?.ID) this._action("reconcilePriceChange", { priceChangeID: row.ID }, "Approved price document reconciled.");
    },

    onSubmitRmRequest: function () {
      const row = this._selected("rmRequestTable", "RM master request");
      if (row) this._rmRequestAction("submitRmMasterRequest", { requestID: row.ID, expectedVersion: row.version }, "RM master request submitted to RM Admin.");
    },

    onApproveRmRequest: function () {
      const row = this._selected("rmRequestTable", "RM master request");
      if (row) this._rmRequestAction("decideRmMasterRequest", { requestID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment: "Approved by RM Admin in demo" }, "RM master request approved and activated.");
    },

    onRejectRmRequest: function () {
      const row = this._selected("rmRequestTable", "RM master request");
      if (row) this._rmRequestAction("decideRmMasterRequest", { requestID: row.ID, expectedVersion: row.version, decision: "REJECT", comment: "Rejected by RM Admin in demo" }, "RM master request rejected.");
    },

    _rmRequestAction: async function (name, payload, message) {
      try {
        await this._request(`${RMC}/${name}`, { method: "POST", body: JSON.stringify(payload) });
        MessageToast.show(message);
        await this._loadMasterData();
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onReleaseSimulation: function () {
      const row = this._model().getProperty("/selectedPriceChange");
      this._action("releasePriceDocument", { priceChangeID: row.ID, expectedVersion: row.version, mode: "SIMULATION" }, "Price document released for simulation only; no approval is required.");
    },

    onReleaseAmendment: function () {
      const row = this._model().getProperty("/selectedPriceChange");
      this._action("releasePriceDocument", { priceChangeID: row.ID, expectedVersion: row.version, mode: "AMENDMENT" }, "Price document released for approval.");
    },

    onApprovePriceDocument: function () {
      const row = this._model().getProperty("/selectedPriceChange");
      const comment = this._approvalComment();
      if (row.ID && comment) this._action("decidePriceDocument", { priceChangeID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment }, "Price document approved for contract proposal.");
    },

    onRejectPriceDocument: function () {
      const row = this._model().getProperty("/selectedPriceChange");
      const comment = this._approvalComment();
      if (row.ID && comment) this._action("decidePriceDocument", { priceChangeID: row.ID, expectedVersion: row.version, decision: "REJECT", comment }, "Price document returned to Buyer.");
    },

    onApprovePrice: function () {
      const row = this._selected("priceTable", "price request");
      const comment = this._approvalComment();
      if (row && comment) this._action("decidePriceChange", { priceChangeID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment }, "Price change approved.");
    },

    onRejectPrice: function () {
      const row = this._selected("priceTable", "price request");
      const comment = this._approvalComment();
      if (row && comment) this._action("decidePriceChange", { priceChangeID: row.ID, expectedVersion: row.version, decision: "REJECT", comment }, "Price change rejected.");
    },

    onQueueCalculation: function () {
      const row = this._selected("priceTable", "approved price request");
      if (row) this._action("queueCalculation", { priceChangeID: row.ID, periodFrom: row.validFrom, periodTo: row.validTo || row.validFrom, priority: 100 }, "Calculation queued.");
    },

    onApproveRun: function () {
      const row = this._selected("runTable", "completed calculation");
      if (row) this._action("decideCalculation", { runID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment: "Approved in demo" }, "Calculation approved.");
    },

    onRerunCalculation: function () {
      const row = this._selected("runTable", "calculation");
      if (row) this._action("rerunCalculation", {
        runID: row.ID,
        expectedVersion: row.version,
        reason: "Trial Gate T1 controlled rerun after corrected source data.",
        priority: row.priority || 100
      }, "A new calculation run was queued with lineage to the selected run.");
    },

    onSimulatePosting: function () {
      const row = this._selected("runTable", "approved calculation");
      if (row) this._action("simulatePosting", { runID: row.ID }, "Posting simulated; no S/4 call was made.");
    },

    onReverseSimulatedPosting: function () {
      const row = this._selected("postingTable", "posting simulation");
      if (row) this._action("reverseSimulatedPosting", {
        postingID: row.ID,
        reason: "Trial Gate T1 controlled reversal demonstration."
      }, "Posting simulation reversed with retained evidence.");
    },

    onCreateProposal: async function () {
      const row = this._selected("runTable", "calculation");
      if (!row) return;
      try {
        const items = await this._query(`${RMC}/ContractItems?$top=1`);
        if (!items.length) throw new Error("No demo contract item is available.");
        await this._action("createContractProposal", { runID: row.ID, contractItemID: items[0].ID, validFrom: row.priceChange?.validFrom || row.periodTo }, "Contract price proposal created.");
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onSaveSetting: async function () {
      const row = this._selected("settingsTable", "setting");
      if (!row) return;
      try {
        await this._request(`${ADMIN}/AppSettings('${encodeURIComponent(row.settingKey)}')`, {
          method: "PATCH",
          body: JSON.stringify({ value: row.value })
        });
        MessageToast.show("Setting saved. New calculations will snapshot the new value.");
        await this._loadAdmin();
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onSaveMovementRule: async function () {
      const row = this._selected("movementTable", "movement rule");
      if (!row) return;
      try {
        await this._request(`${ADMIN}/MovementTypeRules('${row.movementType}')`, {
          method: "PATCH",
          body: JSON.stringify({ eligible: row.eligible, quantitySign: Number(row.quantitySign), requiresReference: row.requiresReference })
        });
        MessageToast.show("Movement-type policy saved.");
        await this._loadAdmin();
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onSavePriceRule: async function () {
      const row = this._selected("priceRuleTable", "price rule template");
      if (!row) return;
      try {
        await this._request(`${ADMIN}/PriceRuleTemplates(${row.ID})`, {
          method: "PATCH",
          body: JSON.stringify({
            observationDays: Number(row.observationDays),
            lagDays: Number(row.lagDays),
            premium: row.premium,
            noChangeThresholdPct: row.noChangeThresholdPct,
            roundingScale: Number(row.roundingScale),
            active: row.active
          })
        });
        MessageToast.show("Price rule template saved.");
        await this._loadAdmin();
      } catch (error) {
        MessageBox.error(error.message);
      }
    },

    onSaveApprovalPolicy: async function () {
      const row = this._selected("approvalPolicyTable", "approval policy");
      if (!row) return;
      try {
        await this._request(`${ADMIN}/ApprovalPolicies(${row.ID})`, {
          method: "PATCH",
          body: JSON.stringify({
            minimumAmount: row.minimumAmount,
            maximumAmount: row.maximumAmount || null,
            requiredRole: row.requiredRole,
            sequence: Number(row.sequence),
            active: row.active
          })
        });
        MessageToast.show("Approval policy saved.");
        await this._loadAdmin();
      } catch (error) {
        MessageBox.error(error.message);
      }
    }
  });
});
