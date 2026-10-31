'use strict';

function normalizeCommodityDraft(input = {}) {
  const draft = {
    code: String(input.code || '').trim().toUpperCase(),
    name: String(input.name || '').trim(),
    description: String(input.description || '').trim() || null,
    validFrom: input.validFrom || null,
    validTo: input.validTo || null
  };
  if (!draft.code || !draft.name || !draft.validFrom) {
    throw new Error('Commodity code, name and valid-from date are required.');
  }
  if (!/^[A-Z0-9_\-]{2,20}$/.test(draft.code)) {
    throw new Error('Commodity code must contain 2-20 uppercase letters, numbers, underscores or hyphens.');
  }
  assertValidity(draft.validFrom, draft.validTo);
  return draft;
}

function assertValidity(validFrom, validTo) {
  if (validTo && validTo < validFrom) {
    throw new Error('Valid-to date cannot precede valid-from date.');
  }
}

function lifecycleStatus(validTo, markedForDeletion, today = new Date().toISOString().slice(0, 10)) {
  if (markedForDeletion) return 'BLOCKED';
  return validTo && validTo <= today ? 'INACTIVE' : 'ACTIVE';
}

module.exports = { normalizeCommodityDraft, assertValidity, lifecycleStatus };
