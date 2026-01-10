import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, terminate } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyARqc45dDgW-nhxqHYgIm0BCw78mAvyfaA",
  authDomain: "refoodify-test.firebaseapp.com",
  projectId: "refoodify-test",
  storageBucket: "refoodify-test.appspot.com",
  messagingSenderId: "805897556328",
  appId: "1:805897556328:web:30492ea1f994cb6f0846dd"
};

// 1. Initialize Firebase App (if not already done)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore (Singleton approach to avoid already called error)
let db;
if (getApps().length > 0) {
  try {
    // Agar app pehle se hai, toh standard way se db lo
    db = getFirestore(app);
  } catch (e) {
    // Agar options mismatch ho rahe hain, toh HTTP mode force karo
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
} else {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
}

export { db };
export const auth = getAuth(app);
export const storage = getStorage(app);