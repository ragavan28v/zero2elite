import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCdqpAakgSkhuB-tiI1oqab_GLckCFJ730",
  authDomain: "zero2elite-a7f1a.firebaseapp.com",
  projectId: "zero2elite-a7f1a",
  storageBucket: "zero2elite-a7f1a.firebasestorage.app",
  messagingSenderId: "556716629726",
  appId: "1:556716629726:web:bdc03f006054d950c5ec4f",
  measurementId: "G-5NDPNB8VK2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app); 