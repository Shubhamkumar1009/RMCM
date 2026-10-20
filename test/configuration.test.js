'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseSetting, toConfig, validateSetting } = require('../srv/lib/configuration');

test('parses typed administrator settings', () => {
  assert.equal(parseSetting({ value: 'true', dataType: 'BOOLEAN' }), true);
  assert.equal(parseSetting({ value: '1', dataType: 'BOOLEAN' }), true);
  assert.equal(parseSetting({ value: '500', dataType: 'INTEGER' }), 500);
  assert.deepEqual(toConfig([{ settingKey: 'A', value: '2', dataType: 'INTEGER' }]), { A: 2 });
});

test('rejects unsafe calculation chunk sizes', () => {
  assert.throws(
    () => validateSetting({ key: 'CALCULATION_CHUNK_SIZE', value: '100000', dataType: 'INTEGER' }),
    /between 10 and 5000/
  );
});
