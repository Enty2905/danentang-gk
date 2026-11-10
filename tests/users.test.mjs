import test from 'node:test';
import assert from 'node:assert/strict';
import { pbkdf2Sync } from 'node:crypto';
import { validateUserInput, isUserFields } from '../src/utils/users.ts';
import { hashPassword } from '../src/utils/password.ts';

const input = { email: 'test@example.com', matkhau: 'Test123!', hoten: 'Nguyễn Văn An', hinhanh: 'data:image/jpeg;base64,/9j/2Q==' };

test('requires the exact four-field database shape', () => {
  assert.equal(isUserFields(input), true);
  assert.equal(isUserFields({ ...input, id: '1' }), false);
  assert.equal(isUserFields({ email: input.email }), false);
  assert.equal(isUserFields({ ...input, hinhanh: 1 }), false);
});

test('rejects missing fields, bad emails, short passwords and oversized images', () => {
  assert.equal(validateUserInput(input), '');
  for (const change of [{ email: 'bad' }, { hoten: '  ' }, { matkhau: '123' }, { hinhanh: '' }, { hinhanh: 'data:image/jpeg;base64,' + 'A'.repeat(350000) }]) {
    assert.notEqual(validateUserInput({ ...input, ...change }), '');
  }
});

test('an empty password preserves the existing value only when editing', () => {
  assert.equal(validateUserInput({ ...input, matkhau: '' }, true), '');
  assert.notEqual(validateUserInput({ ...input, matkhau: '' }), '');
});

test('password hashing matches Node PBKDF2 and different salts produce different hashes', async () => {
  const salt = new Uint8Array(16).fill(7);
  const actual = await hashPassword(input.matkhau, salt);
  const expected = pbkdf2Sync(input.matkhau, salt, 210000, 32, 'sha256').toString('hex');
  assert.equal(actual.split('$')[3], expected);
  assert.notEqual(actual, await hashPassword(input.matkhau, new Uint8Array(16).fill(8)));
  assert.equal(actual.includes(input.matkhau), false);
});
