'use strict';

const Decimal = require('decimal.js');

Decimal.set({ precision: 34, rounding: Decimal.ROUND_HALF_UP });

function decimal(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return new Decimal(fallback);
  return new Decimal(value);
}

function calculateImpactLine({
  goodsReceipt,
  constituent,
  oldPrice,
  newPrice,
  priceUnit = 1,
  quantitySign = 1,
  roundingScale = 2
}) {
  const grQuantity = decimal(goodsReceipt.quantity).times(quantitySign);
  const contentQuantity = decimal(constituent.contentQuantity);
  const yieldFactor = decimal(constituent.yieldFactor, 1);
  const scrapFactor = decimal(constituent.scrapFactor, 1);
  const normalizedRmContent = contentQuantity.times(yieldFactor).times(scrapFactor);
  const priceDelta = decimal(newPrice).minus(oldPrice).div(decimal(priceUnit, 1));
  const amount = grQuantity.times(normalizedRmContent).times(priceDelta);

  return {
    eligibleQuantity: grQuantity.toDecimalPlaces(9).toString(),
    normalizedRmContent: normalizedRmContent.toDecimalPlaces(9).toString(),
    oldPrice: decimal(oldPrice).toDecimalPlaces(6).toString(),
    newPrice: decimal(newPrice).toDecimalPlaces(6).toString(),
    priceDelta: priceDelta.toDecimalPlaces(6).toString(),
    amount: amount.toDecimalPlaces(roundingScale).toString(),
    explanation:
      `${grQuantity.toString()} GR units × ${normalizedRmContent.toString()} RM units ` +
      `× (${decimal(newPrice).toString()} - ${decimal(oldPrice).toString()}) / ${decimal(priceUnit, 1).toString()}`
  };
}

function sum(values, scale = 6) {
  return values
    .reduce((total, value) => total.plus(decimal(value)), new Decimal(0))
    .toDecimalPlaces(scale)
    .toString();
}

module.exports = { calculateImpactLine, decimal, sum };
