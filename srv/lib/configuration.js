'use strict';

function parseSetting(setting) {
  switch ((setting.dataType || 'STRING').toUpperCase()) {
    case 'BOOLEAN':
      return ['true', '1', 'yes', 'y', 'x'].includes(String(setting.value).trim().toLowerCase());
    case 'INTEGER':
      return Number.parseInt(setting.value, 10);
    case 'DECIMAL':
      return Number.parseFloat(setting.value);
    case 'JSON':
      return JSON.parse(setting.value);
    default:
      return setting.value;
  }
}

function toConfig(settings) {
  return Object.fromEntries(settings.map((setting) => [setting.settingKey || setting.key, parseSetting(setting)]));
}

function validateSetting(setting) {
  const key = setting.settingKey || setting.key;
  if (!key || !/^[A-Z][A-Z0-9_.-]{2,79}$/.test(key)) {
    throw new Error('Setting keys must use uppercase letters, digits, dot, dash or underscore.');
  }
  parseSetting(setting);

  const numericBounds = {
    CALCULATION_CHUNK_SIZE: [10, 5000],
    CALCULATION_ROUNDING_SCALE: [0, 6],
    WORKER_MAX_CONCURRENT_RUNS: [1, 20]
  };
  const bounds = numericBounds[key];
  if (bounds) {
    const value = Number(setting.value);
    if (!Number.isInteger(value) || value < bounds[0] || value > bounds[1]) {
      throw new Error(`${key} must be an integer between ${bounds[0]} and ${bounds[1]}.`);
    }
  }
}

module.exports = { parseSetting, toConfig, validateSetting };
