import { initializeApp } from 'firebase/app';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const recaptchaSiteKey =
  (typeof import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY === 'string'
    ? import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY.trim()
    : '') || (firebaseConfig.recaptchaSiteKey || '').trim();

const envDebugToken =
  import.meta.env.DEV && typeof import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN === 'string'
    ? import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN.trim()
    : '';

let appCheckActive = false;

if (typeof window !== 'undefined') {
  // Enable App Check Debug Provider ONLY in development AND only when explicitly opted in
  // via VITE_FIREBASE_APPCHECK_DEBUG_TOKEN (never auto-enable `true`, which overrides real reCAPTCHA Enterprise).
  if (import.meta.env.DEV && envDebugToken) {
    (
      globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = envDebugToken === 'true' ? true : envDebugToken;
  }

  if (recaptchaSiteKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
      appCheckActive = true;
    } catch {
      appCheckActive = false;
    }
  }
}

export const appCheckStatus = {
  siteKeyPresent: Boolean(recaptchaSiteKey),
  debugMode: Boolean(import.meta.env.DEV && envDebugToken),
  active: appCheckActive,
};

export const firebaseAi = getAI(app, {
  backend: new GoogleAIBackend(),
  useLimitedUseAppCheckTokens: false,
});

export async function testFirestoreServerConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return false;
    }
    // Permission error or missing test doc still confirms server reachability
    return true;
  }
}
