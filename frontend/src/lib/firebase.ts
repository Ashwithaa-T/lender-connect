import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Only initialize Firebase when real credentials are present.
// Using demo/missing values causes Firebase Auth to trigger a browser
// permission popup ("Access other apps and services on this device").
const isConfigured =
  apiKey && !apiKey.startsWith("demo") &&
  projectId && !projectId.startsWith("demo");

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, "lender-connect");
} else {
  console.warn(
    "[Firebase] Missing or invalid environment variables. " +
    "Firebase will not be initialized. " +
    "Set VITE_FIREBASE_* variables in your Vercel project settings."
  );
}

export { app, auth, db };
