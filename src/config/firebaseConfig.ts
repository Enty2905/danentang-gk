// Firebase Web App identifiers are public configuration, not admin credentials.
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCMoRZ8l6CmV_EKEsGv9LT0Y0mUxGHB4Ug',
  authDomain: 'danentang-gk-5c8fe.firebaseapp.com',
  projectId: 'danentang-gk-5c8fe',
  appId: '1:1068833163047:web:a1e0b2c3e753b676efcb02',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://danentang-gk-5c8fe-default-rtdb.asia-southeast1.firebasedatabase.app',
};

export const ADMIN_UID = process.env.EXPO_PUBLIC_ADMIN_UID || 'Zc5USwjC6sQnMyHTr0ELBfVsjdO2';
