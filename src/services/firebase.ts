import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from '../config/firebaseConfig';

const existing = getApps().length > 0;
export const app = existing ? getApp() : initializeApp(firebaseConfig);
// No remember-me feature is required. The session ends on a full app reload.
export const auth = existing ? getAuth(app) : initializeAuth(app, { persistence: inMemoryPersistence });
export const database = getDatabase(app, firebaseConfig.databaseURL || undefined);
