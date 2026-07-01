import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSeendate, clamp01 } from '../util.js';

test('parseSeendate parses a valid GDELT timestamp to ISO', () => {
  assert.equal(parseSeendate('20260615T091500Z'), '2026-06-15T09:15:00.000Z');
});

test('parseSeendate returns null for missing / too-short input', () => {
  assert.equal(parseSeendate(undefined), null);
  assert.equal(parseSeendate(''), null);
  assert.equal(parseSeendate('2026061'), null); // < 15 chars
});

test('parseSeendate returns null for an unparseable date', () => {
  assert.equal(parseSeendate('99999999T999999Z'), null);
});

test('clamp01 clamps to [0,1]', () => {
  assert.equal(clamp01(0.42), 0.42);
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(5), 1);
});

test('clamp01 falls back to 0.5 on NaN', () => {
  assert.equal(clamp01(NaN), 0.5);
});
