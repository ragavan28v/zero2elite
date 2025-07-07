import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCdqpAakgSkhuB-tiI1oqab_GLckCFJ730",
  authDomain: "zero2elite-a7f1a.firebaseapp.com",
  projectId: "zero2elite-a7f1a",
  storageBucket: "zero2elite-a7f1a.firebasestorage.app",
  messagingSenderId: "556716629726",
  appId: "1:556716629726:web:a5e334c5c9e9de47c5ec4f",
  measurementId: "G-49KWKLXTV2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 