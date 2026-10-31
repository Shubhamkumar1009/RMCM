'use strict';

const Decimal = require('decimal.js');

function explodeBom({ rootMaterialID, plant, keyDate, headers, items, materials, maxDepth = 20 }) {
  const materialById = new Map(materials.map((row) => [row.ID, row]));
  const headerByMaterial = new Map(
    headers
      .filter((row) => row.plant === plant && row.validFrom <= keyDate && (!row.validTo || row.validTo >= keyDate))
      .map((row) => [row.material_ID, row])
  );
  const itemsByHeader = new Map();
  for (const item of items.filter((row) => row.relevantToRmc !== false)) {
    const rows = itemsByHeader.get(item.header_ID) || [];
    rows.push(item);
    itemsByHeader.set(item.header_ID, rows);
  }
  const root = materialById.get(rootMaterialID);
  if (!root) throw new Error('The root material does not exist.');
  const result = [];
  const visit = (materialID, path, depth, accumulatedQuantity, ancestors) => {
    if (depth > maxDepth) throw new Error(`BOM exceeds the supported depth of ${maxDepth}.`);
    if (ancestors.has(materialID)) throw new Error('BOM cycle detected.');
    const header = headerByMaterial.get(materialID);
    if (!header) return;
    const nextAncestors = new Set(ancestors).add(materialID);
    for (const item of (itemsByHeader.get(header.ID) || []).sort((a, b) => a.itemNumber.localeCompare(b.itemNumber))) {
      const component = materialById.get(item.component_ID) || { ID: item.component_ID, code: item.componentDescription, description: item.componentDescription };
      const quantity = new Decimal(accumulatedQuantity).times(item.componentQuantity || 0);
      const lineagePath = [...path, component.code].join('/');
      const leafPart = !headerByMaterial.has(item.component_ID);
      result.push({
        bomItemID: item.ID,
        materialID: item.component_ID,
        parentMaterialID: materialID,
        materialCode: component.code,
        materialDescription: component.description || item.componentDescription,
        itemNumber: item.itemNumber,
        hierarchyDepth: depth,
        lineagePath,
        leafPart,
        quantity: quantity.toFixed(),
        uoM: item.componentUoM
      });
      if (!leafPart) visit(item.component_ID, [...path, component.code], depth + 1, quantity, nextAncestors);
    }
  };
  visit(rootMaterialID, [root.code], 1, new Decimal(1), new Set());
  return result;
}

function assessComposition(nodes, constituents) {
  const leaves = nodes.filter((node) => node.leafPart);
  const mappedByItem = new Map(constituents.map((row) => [row.bomItem_ID, row]));
  const findings = [];
  for (const leaf of leaves) {
    const row = mappedByItem.get(leaf.bomItemID);
    if (!row) {
      findings.push({ code: 'UNMAPPED_LEAF', mandatory: true, message: `${leaf.lineagePath} has no RM mapping.` });
      continue;
    }
    if (!row.grade_ID || !row.contentUoM || new Decimal(row.inputWeight || 0).lte(0) || new Decimal(row.outputWeight || 0).lte(0)) {
      findings.push({ code: 'INVALID_LEAF_MAPPING', mandatory: true, message: `${leaf.lineagePath} has incomplete grade, weight or UoM data.` });
    }
    if (new Decimal(row.outputWeight || 0).plus(row.scrapWeight || 0).gt(row.inputWeight || 0)) {
      findings.push({ code: 'WEIGHT_IMBALANCE', mandatory: true, message: `${leaf.lineagePath} output plus scrap exceeds input weight.` });
    }
    if (row.source === 'MANUAL') {
      findings.push({ code: 'MANUAL_OVERRIDE', mandatory: false, message: `${leaf.lineagePath} uses a documented manual mapping override.` });
    }
  }
  const mappedLeaves = leaves.length - findings.filter((finding) => finding.code === 'UNMAPPED_LEAF').length;
  return {
    completenessPct: leaves.length ? new Decimal(mappedLeaves).div(leaves.length).times(100).toFixed(2) : '0.00',
    findings
  };
}

function values(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value.map(String) : String(value).split(',').map((item) => item.trim());
}

function isInOrganizationalScope(user, target) {
  const attributes = user?.attr || {};
  const checks = [
    ['companyCode', target.companyCode],
    ['purchasingOrg', target.purchasingOrg],
    ['plant', target.plant],
    ['supplier', target.supplierCode]
  ];
  return checks.every(([key, required]) => {
    if (!required) return true;
    const allowed = values(attributes[key]);
    return allowed.includes('*') || allowed.includes(String(required));
  });
}

module.exports = { explodeBom, assessComposition, isInOrganizationalScope };
