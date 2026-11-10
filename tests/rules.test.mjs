import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { ref, set, get, remove, update } from 'firebase/database';

let environment;
const user = { email: 'an@example.com', matkhau: 'pbkdf2-sha256$210000$' + 'a'.repeat(32) + '$' + 'b'.repeat(64), hoten: 'Nguyễn Văn An', hinhanh: 'data:image/jpeg;base64,/9j/2Q==' };
before(async () => {
  const source = JSON.parse(await readFile(new URL('../database.rules.json', import.meta.url), 'utf8'));
  source.rules.users['.read'] = "auth != null && auth.uid === 'test-admin'";
  source.rules.users['.write'] = "auth != null && auth.uid === 'test-admin'";
  environment = await initializeTestEnvironment({ projectId: 'demo-danentang-gk', database: { host: '127.0.0.1', port: 9000, rules: JSON.stringify(source) } });
});
after(async () => { await environment?.cleanup(); });

test('admin can create, read, update and delete a four-field user', async () => {
  const db = environment.authenticatedContext('test-admin').database();
  await assertSucceeds(set(ref(db, 'users/crud'), user));
  await assertSucceeds(get(ref(db, 'users')));
  await assertSucceeds(update(ref(db, 'users/crud'), { hoten: 'Tên mới' }));
  await assertSucceeds(remove(ref(db, 'users/crud')));
});

test('anonymous and non-admin users cannot read or write', async () => {
  for (const context of [environment.unauthenticatedContext(), environment.authenticatedContext('someone-else')]) {
    const db = context.database();
    await assertFails(get(ref(db, 'users')));
    await assertFails(set(ref(db, 'users/blocked'), user));
    await assertFails(remove(ref(db, 'users/blocked')));
  }
});

test('admin cannot add fields, omit required fields, store plaintext passwords or invalid images', async () => {
  const db = environment.authenticatedContext('test-admin').database();
  for (const invalid of [{ ...user, id: 'extra' }, { ...user, role: 'admin' }, { ...user, matkhau: 'Test123!' }, { ...user, hinhanh: 'https://example.com/a.jpg' }, { email: user.email }]) {
    await assertFails(set(ref(db, 'users/invalid'), invalid));
  }
  await assertFails(set(ref(db, 'other'), { example: true }));
});
