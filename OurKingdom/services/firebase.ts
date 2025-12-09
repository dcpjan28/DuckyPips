import * as firebaseApp from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoded config as per request to ensure functionality matches original
const firebaseConfig = { 
    apiKey: "AIzaSyDM-hAqL6znr_yJNs6IcNwIsw9chyde9d4", 
    authDomain: "duckypips-d7b2e.firebaseapp.com", 
    projectId: "duckypips-d7b2e", 
    storageBucket: "duckypips-d7b2e.firebasestorage.app", 
    messagingSenderId: "497344225222", 
    appId: "1:497344225222:web:96e47b8ea0f59b90b85cc7", 
    measurementId: "G-ZP83N5HXQF" 
};

// Cast module to any to avoid "no exported member" TS error if types are mismatched
export const app = (firebaseApp as any).initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Use a default app ID for data separation
export const DEFAULT_APP_ID = 'ducky-pips-v1';