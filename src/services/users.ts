import { getRandomBytesAsync } from 'expo-crypto';
import { onValue, push, ref, remove, set, type Unsubscribe } from 'firebase/database';
import { database } from './firebase';
import type { UserEntry, UserFields } from '../types';
import { hashPassword } from '../utils/password';
import { isUserFields, validateUserInput } from '../utils/users';

export function subscribeUsers(onChange: (users: UserEntry[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onValue(ref(database, 'users'), (snapshot) => {
    const users: UserEntry[] = [];
    let invalid = false;
    snapshot.forEach((child) => {
      const value: unknown = child.val();
      if (isUserFields(value)) users.push({ key: child.key!, value });
      else invalid = true;
    });
    if (invalid) {
      onError(new Error('Database contains an invalid user record.'));
      return;
    }
    onChange(users);
  }, onError);
}

export async function saveUser(input: UserFields, existing?: UserEntry): Promise<void> {
  const validation = validateUserInput(input, !!existing);
  if (validation) throw new Error(validation);
  const matkhau = input.matkhau ? await hashPassword(input.matkhau, await getRandomBytesAsync(16)) : existing!.value.matkhau;
  // Construct explicitly: never spread UI state or metadata into the database.
  const value: UserFields = {
    email: input.email.trim().toLowerCase(),
    matkhau,
    hoten: input.hoten.trim(),
    hinhanh: input.hinhanh,
  };
  const target = existing ? ref(database, `users/${existing.key}`) : push(ref(database, 'users'));
  await set(target, value);
}

export async function deleteUser(key: string): Promise<void> {
  await remove(ref(database, `users/${key}`));
}
