import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordForSubmit } from './authValidation.js';

test('login accepts a password without signup complexity rules', () => {
  assert.equal(validatePasswordForSubmit('wrongpw', true), null);
  assert.equal(validatePasswordForSubmit('abc123', true), null);
});

test('signup still enforces complexity rules', () => {
  assert.equal(validatePasswordForSubmit('abc123', false), 'Password must contain at least one uppercase letter.');
  assert.equal(validatePasswordForSubmit('Abcdefg', false), 'Password must contain at least one number.');
  assert.equal(validatePasswordForSubmit('Abcdef1', false), 'Password must contain at least one special character.');
});
