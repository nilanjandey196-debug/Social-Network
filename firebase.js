import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/*
 * Firebase configuration.  Sensitive keys are pulled from environment
 * variables prefixed with VITE_ so they are injected at build time.  Create
 * a `.env` or `.env.local` file in the project root and define the
 * following variables with your Firebase project credentials:
 *
 * VITE_FIREBASE_API_KEY=your_api_key
 * VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=your_project_id
 * VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
 * VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
 * VITE_FIREBASE_APP_ID=your_app_id
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase and export commonly used services.  Splitting the
// initialization into its own file keeps Firebase concerns separate from
// component code.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };