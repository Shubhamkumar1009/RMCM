sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
  "use strict";

  const RMC = "/odata/v4/rmc";
  const ADMIN = "/odata/v4/admin";

  return Controller.extend("rmc.app.controller.App", {
    onInit: function () {
      this.onRefresh();
      this._refreshTimer = setInterval(() => this._loadCalculations(false), 5000);
    },

    onExit: function () {
      clearInterval(this._refreshTimer);
    },

    _model: function () {
      return this.getOwnerComponent().getModel("app");
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
          this._loadCalculations(false),
          this._loadContent(),
          this._loadPostings(),
          this._loadAdmin()
        ]);
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

    _loadPriceChanges: async function () {
      const query = "$expand=supplier,grade($expand=rawMaterialType)&$orderby=createdAt desc&$top=200";
      this._model().setProperty("/priceChanges", await this._query(`${RMC}/PriceChangeRequests?${query}`));
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
      const query = "$expand=profile($expand=material,supplier),grade($expand=rawMaterialType)&$orderby=createdAt desc&$top=500";
      this._model().setProperty("/constituents", await this._query(`${RMC}/PartConstituents?${query}`));
    },

    _loadPostings: async function () {
      this._model().setProperty("/postings", await this._query(`${RMC}/PostingRecords?$orderby=createdAt desc&$top=100`));
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

    _selected: function (tableId, label) {
      const item = this.byId(tableId).getSelectedItem();
      if (!item) {
        MessageToast.show(`Select a ${label} first.`);
        return null;
      }
      return item.getBindingContext("app").getObject();
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

    onSubmitPrice: function () {
      const row = this._selected("priceTable", "price request");
      if (row) this._action("submitPriceChange", { priceChangeID: row.ID, expectedVersion: row.version }, "Price change submitted.");
    },

    onApprovePrice: function () {
      const row = this._selected("priceTable", "price request");
      if (row) this._action("decidePriceChange", { priceChangeID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment: "Approved in demo" }, "Price change approved.");
    },

    onRejectPrice: function () {
      const row = this._selected("priceTable", "price request");
      if (row) this._action("decidePriceChange", { priceChangeID: row.ID, expectedVersion: row.version, decision: "REJECT", comment: "Rejected during demo review" }, "Price change rejected.");
    },

    onQueueCalculation: function () {
      const row = this._selected("priceTable", "approved price request");
      if (row) this._action("queueCalculation", { priceChangeID: row.ID, periodFrom: row.validFrom, periodTo: row.validTo || row.validFrom, priority: 100 }, "Calculation queued.");
    },

    onApproveRun: function () {
      const row = this._selected("runTable", "completed calculation");
      if (row) this._action("decideCalculation", { runID: row.ID, expectedVersion: row.version, decision: "APPROVE", comment: "Approved in demo" }, "Calculation approved.");
    },

    onSimulatePosting: function () {
      const row = this._selected("runTable", "approved calculation");
      if (row) this._action("simulatePosting", { runID: row.ID }, "Posting simulated; no S/4 call was made.");
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
