'use strict';

const { decimal } = require('./calculation-engine');

function fixed(value, scale = 6) {
  return decimal(value).toDecimalPlaces(scale).toString();
}

function effectivePrice(prices, gradeId, onDate) {
  return prices
    .filter((price) => price.grade_ID === gradeId && price.validFrom <= onDate && (!price.validTo || price.validTo >= onDate))
    .sort((left, right) => String(right.validFrom).localeCompare(String(left.validFrom)))[0];
}

function buildPricingWorkbench({
  priceChange,
  supplier,
  profile,
  material,
  contractItem,
  contract,
  constituents,
  grades,
  subGrades = [],
  bomItems,
  vendorPrices,
  eligibleQuantity,
  eligibleReceiptCount = 0
}) {
  const gradeMap = new Map(grades.map((grade) => [grade.ID, grade]));
  const subGradeMap = new Map(subGrades.map((subGrade) => [subGrade.ID, subGrade]));
  const bomItemMap = new Map(bomItems.map((item) => [item.ID, item]));
  let currentRmContribution = decimal(0);
  let revisedRmContribution = decimal(0);

  const lines = constituents.map((constituent) => {
    const grade = gradeMap.get(constituent.grade_ID) || {};
    const subGrade = subGradeMap.get(constituent.subGrade_ID) || {};
    const bomItem = bomItemMap.get(constituent.bomItem_ID) || {};
    const configuredScrapPct = decimal(bomItem.componentScrapPct || 0);
    const outputWeight = decimal(constituent.contentQuantity)
      .times(decimal(constituent.yieldFactor, 1));
    const inputWeight = outputWeight
      .times(decimal(constituent.scrapFactor, 1))
      .times(decimal(1).plus(configuredScrapPct.div(100)));
    const scrapWeight = DecimalMax(inputWeight.minus(outputWeight), decimal(0));
    const currentVendorPrice = effectivePrice(vendorPrices, constituent.grade_ID, priceChange.validFrom);
    const changedGrade = constituent.grade_ID === priceChange.grade_ID;
    const currentPrice = changedGrade ? decimal(priceChange.oldPrice) : decimal(currentVendorPrice?.price || 0);
    const revisedPrice = changedGrade ? decimal(priceChange.proposedPrice) : currentPrice;
    const priceUnit = decimal(changedGrade ? priceChange.priceUnit : (currentVendorPrice?.priceUnit || 1), 1);
    const currentScrapPrice = decimal(0);
    const revisedScrapPrice = decimal(0);
    const currentRmCost = outputWeight.times(currentPrice).div(priceUnit);
    const revisedRmCost = outputWeight.times(revisedPrice).div(priceUnit);
    const currentScrapCredit = scrapWeight.times(currentScrapPrice);
    const revisedScrapCredit = scrapWeight.times(revisedScrapPrice);
    const currentNetContribution = currentRmCost.minus(currentScrapCredit);
    const revisedNetContribution = revisedRmCost.minus(revisedScrapCredit);
    const totalDelta = revisedNetContribution.minus(currentNetContribution);
    currentRmContribution = currentRmContribution.plus(currentNetContribution);
    revisedRmContribution = revisedRmContribution.plus(revisedNetContribution);

    return {
      partCode: material.code,
      partDescription: material.description,
      gradeCode: grade.code || '',
      gradeName: grade.name || '',
      subGradeCode: subGrade.code || '',
      subGradeName: subGrade.name || '',
      scrapCode: configuredScrapPct.gt(0) ? `SCRAP-${grade.code || 'UNMAPPED'}` : '',
      inputWeight: fixed(inputWeight, 9),
      outputWeight: fixed(outputWeight, 9),
      scrapWeight: fixed(scrapWeight, 9),
      uoM: constituent.contentUoM,
      currentRmPrice: fixed(currentPrice),
      revisedRmPrice: fixed(revisedPrice),
      currentScrapPrice: fixed(currentScrapPrice),
      revisedScrapPrice: fixed(revisedScrapPrice),
      currentRmCost: fixed(currentRmCost),
      revisedRmCost: fixed(revisedRmCost),
      currentScrapCredit: fixed(currentScrapCredit),
      revisedScrapCredit: fixed(revisedScrapCredit),
      currentContribution: fixed(currentNetContribution),
      revisedContribution: fixed(revisedNetContribution),
      rmRateDelta: fixed(revisedPrice.minus(currentPrice)),
      scrapRateDelta: fixed(revisedScrapPrice.minus(currentScrapPrice)),
      adjustmentPct: '0',
      totalDelta: fixed(totalDelta),
      currency: priceChange.currency,
      changed: changedGrade,
      explanation: `${fixed(outputWeight, 9)} ${constituent.contentUoM} x (${fixed(revisedPrice)} - ${fixed(currentPrice)}) / ${priceUnit.toString()}`
    };
  });

  const currentPoPrice = decimal(contractItem.currentPrice);
  const unitDelta = revisedRmContribution.minus(currentRmContribution);
  const revisedPoPrice = currentPoPrice.plus(unitDelta);
  const changePct = currentPoPrice.isZero() ? decimal(0) : unitDelta.div(currentPoPrice).times(100);
  const impact = unitDelta.times(decimal(eligibleQuantity));
  const nonRmBalance = currentPoPrice.minus(currentRmContribution);

  return {
    summary: {
      documentType: 'RETRO_PRICE_AMENDMENT',
      requestNumber: priceChange.requestNumber,
      referenceNumber: priceChange.sourceReference || '',
      priceReason: 'RAW_MATERIAL',
      direction: decimal(priceChange.proposedPrice).gte(priceChange.oldPrice) ? 'INCREASE' : 'DECREASE',
      backToBack: true,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      companyCode: contract?.companyCode || supplier.companyCode || '',
      purchasingOrg: priceChange.purchasingOrg || contract?.purchasingOrg || supplier.purchasingOrg || '',
      purchasingGroup: contract?.purchasingGroup || '',
      plant: priceChange.plant || material.plant || '',
      partCode: material.code,
      partDescription: material.description,
      contractNumber: contract?.contractNumber || '',
      contractItem: contractItem.itemNumber,
      validFrom: priceChange.validFrom,
      validTo: priceChange.validTo,
      currency: priceChange.currency,
      status: priceChange.status,
      releaseStatus: priceChange.priceDocumentStatus || 'BLOCKED',
      priceDocumentMode: priceChange.priceDocumentMode || 'AMENDMENT',
      priceDocumentStatus: priceChange.priceDocumentStatus || 'BLOCKED',
      currentPoPrice: fixed(currentPoPrice),
      revisedPoPrice: fixed(revisedPoPrice),
      unitDelta: fixed(unitDelta),
      priceChangePct: fixed(changePct, 2),
      eligibleQuantity: fixed(eligibleQuantity, 9),
      estimatedImpact: fixed(impact, 2),
      affectedParts: 1,
      affectedGrades: lines.filter((line) => line.changed).length,
      affectedVendors: 1,
      affectedPlants: 1,
      affectedContracts: contract ? 1 : 0,
      grnCount: eligibleReceiptCount,
      calculationTrace: `${fixed(eligibleQuantity, 9)} eligible part units x ${fixed(unitDelta)} ${priceChange.currency} unit delta`
    },
    lines,
    impactedParts: [{
      supplierCode: supplier.code,
      supplierName: supplier.name,
      partCode: material.code,
      partDescription: material.description,
      plant: material.plant,
      revisionLevel: profile.revisionLevel || '01',
      contractNumber: contract?.contractNumber || '',
      contractItem: contractItem?.itemNumber || '',
      contractStatus: contract ? 'ALLOCATED' : 'PENDING_ALLOCATION',
      gradeCode: gradeMap.get(priceChange.grade_ID)?.code || '',
      subGradeCode: subGradeMap.get(priceChange.subGrade_ID)?.code || '',
      currentPrice: fixed(priceChange.oldPrice),
      revisedPrice: fixed(priceChange.proposedPrice),
      currency: priceChange.currency,
      validFrom: priceChange.validFrom,
      validTo: priceChange.validTo,
      readiness: contract ? 'READY' : 'CONTRACT_EXCEPTION_REQUIRED'
    }],
    breakdown: [
      {
        code: 'RAW_MATERIAL',
        label: 'Raw material contribution',
        currentValue: fixed(currentRmContribution),
        proposedValue: fixed(revisedRmContribution),
        delta: fixed(unitDelta),
        currency: priceChange.currency
      },
      {
        code: 'NON_RM',
        label: 'Non-RM / conversion balance',
        currentValue: fixed(nonRmBalance),
        proposedValue: fixed(nonRmBalance),
        delta: '0',
        currency: priceChange.currency
      },
      {
        code: 'TOTAL',
        label: 'Contract part price',
        currentValue: fixed(currentPoPrice),
        proposedValue: fixed(revisedPoPrice),
        delta: fixed(unitDelta),
        currency: priceChange.currency
      }
    ]
  };
}

function DecimalMax(left, right) {
  return left.greaterThan(right) ? left : right;
}

module.exports = { buildPricingWorkbench, effectivePrice };
