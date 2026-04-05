import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAV6bPCH1lrWVUEstyApsO2wvwCCwvS2Ek",
  authDomain: "careeragent-ext.firebaseapp.com",
  projectId: "careeragent-ext",
  storageBucket: "careeragent-ext.firebasestorage.app",
  messagingSenderId: "451122841279",
  appId: "1:451122841279:web:59ac23d54e6ae36ee1680a",
  measurementId: "G-WRGH13Q4LL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics may require special handling in Chrome Extension environment, check for support first
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
