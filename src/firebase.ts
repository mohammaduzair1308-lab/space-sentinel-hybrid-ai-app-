import { initializeApp } from 'firebase/app';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import {
  CustomProvider,
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
  (firebaseConfig.recaptchaSiteKey || '').trim() ||
  (typeof import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY === 'string'
    ? import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY.trim()
    : '');

let appCheckActive = false;

if (typeof window !== 'undefined') {
  if (import.meta.env.DEV) {
    // Enable Firebase App Check Debug Provider strictly in development/testing builds.
    // Vite compiles `import.meta.env.DEV` to `false` in production builds so this branch is dead-code eliminated.
    const envDebugToken =
      typeof import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN === 'string'
        ? import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN.trim()
        : '';
    (
      globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = envDebugToken || true;

    try {
      initializeAppCheck(app, {
        provider: recaptchaSiteKey
          ? new ReCaptchaEnterpriseProvider(recaptchaSiteKey)
          : new CustomProvider({
              getToken: () =>
                Promise.reject(
                  new Error('App Check dev debug mode requires a registered debug token.')
                ),
            }),
        isTokenAutoRefreshEnabled: true,
      });
      appCheckActive = true;
    } catch {
      appCheckActive = false;
    }
  } else if (recaptchaSiteKey) {
    // Production websites always use reCAPTCHA Enterprise attestation.
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
  debugMode: Boolean(import.meta.env.DEV),
  active: appCheckActive,
};

export const firebaseAi = getAI(app, {
  backend: new GoogleAIBackend(),
  useLimitedUseAppCheckTokens: appCheckActive,
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
