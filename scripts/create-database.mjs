import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const salt = randomBytes(16);
const passwordHash = pbkdf2Sync('Demo123!', salt, 210000, 32, 'sha256');
const image = await readFile(new URL('../assets/sample-user.jpg', import.meta.url));
const database = {
  users: {
    'sample-an': {
      email: 'an@example.com',
      matkhau: `pbkdf2-sha256$210000$${salt.toString('hex')}$${passwordHash.toString('hex')}`,
      hoten: 'Nguyễn Văn An',
      hinhanh: `data:image/jpeg;base64,${image.toString('base64')}`,
    },
  },
};
await writeFile(new URL('../database.json', import.meta.url), JSON.stringify(database, null, 2) + '\n', 'utf8');
console.log('Created database.json with exactly email, matkhau, hoten, hinhanh.');
