import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

// Salt and algorithm metadata live inside matkhau; no extra DB fields are used.
export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  if (salt.length < 16) throw new Error('Salt must contain at least 16 random bytes.');
  const hash = await pbkdf2Async(sha256, password, salt, { c: 210000, dkLen: 32, asyncTick: 10 });
  return `pbkdf2-sha256$210000$${bytesToHex(salt)}$${bytesToHex(hash)}`;
}
