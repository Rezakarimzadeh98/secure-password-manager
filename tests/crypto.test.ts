import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzePasswordStrength, calculateEntropy, estimateCrackingTime, generateSecurePassword, type PasswordConfig } from '../lib/crypto';
import { calculateCharsetSize, calculateMaxEntropy, cloneConfig, configsEqual, formatEntropy, sanitizeInput, validateConfig } from '../lib/utils';

const strongConfig: PasswordConfig = {
  length: 24,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: true,
  requireAllTypes: true,
  noConsecutiveRepeat: true,
  noSequential: true,
};

test('generateSecurePassword respects length and enabled character sets', () => {
  const password = generateSecurePassword(strongConfig);

  assert.equal(password.length, strongConfig.length);
  assert.match(password, /[A-Z]/);
  assert.match(password, /[a-z]/);
  assert.match(password, /[0-9]/);
  assert.match(password, /[^a-zA-Z0-9]/);
  assert.doesNotMatch(password, /[Il1O0o]/);
});

test('generateSecurePassword falls back safely when no character type is enabled', () => {
  const password = generateSecurePassword({
    length: 12,
    uppercase: false,
    lowercase: false,
    numbers: false,
    symbols: false,
  });

  assert.equal(password.length, 12);
  assert.match(password, /^[a-z]+$/);
});

test('analyzePasswordStrength distinguishes weak and strong passwords', () => {
  const weak = analyzePasswordStrength('abc');
  const strong = analyzePasswordStrength('Tr0ub4dor!2026#Safe');

  assert.equal(weak.label, 'Weak');
  assert.ok(strong.score > weak.score);
  assert.ok(['Strong', 'Excellent'].includes(strong.label));
});

test('entropy and cracking-time helpers return stable display values', () => {
  assert.equal(calculateEntropy(''), 0);
  assert.equal(formatEntropy(12.34), '12.3 bits');
  assert.equal(estimateCrackingTime(0), 'instant');
  assert.notEqual(estimateCrackingTime(80), 'instant');
});

test('config validation and utility helpers behave consistently', () => {
  const invalid = validateConfig({
    length: 6,
    uppercase: false,
    lowercase: false,
    numbers: false,
    symbols: false,
  });
  const clean = sanitizeInput('<script>alert(1)</script>');
  const cloned = cloneConfig(strongConfig);

  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes('at least 8')));
  assert.ok(invalid.errors.some((error) => error.includes('At least one character type')));
  assert.equal(clean, 'scriptalert(1)/script');
  assert.notStrictEqual(cloned, strongConfig);
  assert.equal(configsEqual(cloned, strongConfig), true);
  assert.equal(calculateCharsetSize(strongConfig), 87);
  assert.ok(calculateMaxEntropy(strongConfig) > 100);
});