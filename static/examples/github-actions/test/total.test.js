import test from 'node:test';
import assert from 'node:assert/strict';
import { total } from '../src/total.js';

test('adds ordinary and negative values', () => {
  assert.equal(total([1, 2, 3]), 6);
  assert.equal(total([-2, 2]), 0);
});

test('rejects invalid input instead of coercing it', () => {
  for (const input of [[], {}, [1, '2'], [NaN], [Infinity]]) {
    assert.throws(() => total(input), TypeError);
  }
});

test('rejects overflow', () => {
  assert.throws(() => total([Number.MAX_VALUE, Number.MAX_VALUE]), RangeError);
});
