import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  AppUser,
  ChatConversation,
  FavoriteSpaceItem,
  HelperMessage,
  LanguageCode,
} from '../types/sentinel';
import { formatTimeForLanguage } from './dateTime';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: Array<{
      providerId?: string | null;
      email?: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function mapFirebaseUser(u: User | null): AppUser | null {
  if (!u) return null;
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    emailVerified: u.emailVerified,
  };
}

export async function signInWithGoogle(): Promise<AppUser | null> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return mapFirebaseUser(cred.user);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

function toIso(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export function subscribeUserConversations(
  userId: string,
  onData: (conversations: ChatConversation[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = `users/${userId}/conversations`;
  const q = query(
    collection(db, path),
    where('ownerId', '==', userId),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const list: ChatConversation[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title ?? ''),
          language: (data.language as LanguageCode) || 'en',
          createdAtIso: toIso(data.createdAt),
          updatedAtIso: toIso(data.updatedAt),
          lastMessageAtIso: toIso(data.lastMessageAt),
          lastMessagePreview: String(data.lastMessagePreview ?? ''),
          messageCount: Number(data.messageCount ?? 0),
          messages: [],
        };
      });
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function fetchConversationMessages(
  userId: string,
  conversationId: string
): Promise<HelperMessage[]> {
  const path = `users/${userId}/conversations/${conversationId}/messages`;
  try {
    const q = query(
      collection(db, path),
      where('ownerId', '==', userId),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const iso = toIso(data.createdAt);
      const lang = (data.language as LanguageCode) || 'en';
      return {
        id: d.id,
        sender: data.sender === 'user' ? 'user' : 'assistant',
        text: String(data.text ?? ''),
        provider: data.provider,
        timestamp: formatTimeForLanguage(iso, lang),
        createdAtIso: iso,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function createFirestoreConversation(
  userId: string,
  conversationId: string,
  title: string,
  language: LanguageCode,
  firstPreview: string
): Promise<void> {
  const path = `users/${userId}/conversations/${conversationId}`;
  try {
    await setDoc(doc(db, path), {
      ownerId: userId,
      title: title.slice(0, 140),
      language,
      lastMessagePreview: firstPreview.slice(0, 240),
      messageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function addFirestoreMessage(
  userId: string,
  conversationId: string,
  message: HelperMessage,
  language: LanguageCode,
  nextCount: number,
  updatedTitle?: string
): Promise<void> {
  const msgPath = `users/${userId}/conversations/${conversationId}/messages/${message.id}`;
  const convPath = `users/${userId}/conversations/${conversationId}`;
  try {
    const payload: Record<string, unknown> = {
      ownerId: userId,
      conversationId,
      sender: message.sender,
      text: message.text.slice(0, 8000),
      language,
      createdAt: serverTimestamp(),
    };
    if (message.provider) {
      payload.provider = String(message.provider).slice(0, 60);
    }
    await setDoc(doc(db, msgPath), payload);

    const convUpdate: Record<string, unknown> = {
      lastMessagePreview: message.text.slice(0, 240),
      messageCount: Math.max(0, Math.min(5000, Math.round(nextCount))),
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (updatedTitle) {
      convUpdate.title = updatedTitle.slice(0, 140);
    }
    await updateDoc(doc(db, convPath), convUpdate);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, msgPath);
  }
}

export async function renameFirestoreConversation(
  userId: string,
  conversationId: string,
  newTitle: string
): Promise<void> {
  const path = `users/${userId}/conversations/${conversationId}`;
  try {
    await updateDoc(doc(db, path), {
      title: newTitle.trim().slice(0, 140),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreConversation(
  userId: string,
  conversationId: string
): Promise<void> {
  const msgsPath = `users/${userId}/conversations/${conversationId}/messages`;
  const convPath = `users/${userId}/conversations/${conversationId}`;
  try {
    const q = query(
      collection(db, msgsPath),
      where('ownerId', '==', userId),
      where('conversationId', '==', conversationId)
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((m) => deleteDoc(doc(db, `${msgsPath}/${m.id}`))));
    await deleteDoc(doc(db, convPath));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, convPath);
  }
}

export function subscribeUserFavorites(
  userId: string,
  onData: (favorites: FavoriteSpaceItem[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = `users/${userId}/favorites`;
  const q = query(
    collection(db, path),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const items: FavoriteSpaceItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          kind: data.kind === 'alert' ? 'alert' : 'telemetry',
          title: String(data.title ?? ''),
          summary: String(data.summary ?? ''),
          source: data.source ?? 'live-noaa',
          sourceUrl: String(data.sourceUrl ?? 'https://www.swpc.noaa.gov/'),
          flareClass: typeof data.flareClass === 'string' ? data.flareClass : undefined,
          kpIndex: typeof data.kpIndex === 'number' ? data.kpIndex : undefined,
          recordedAtLabel: String(data.recordedAtLabel ?? ''),
          createdAtIso: toIso(data.createdAt),
        };
      });
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function addFirestoreFavorite(
  userId: string,
  item: FavoriteSpaceItem
): Promise<void> {
  const path = `users/${userId}/favorites/${item.id}`;
  try {
    const payload: Record<string, unknown> = {
      ownerId: userId,
      kind: item.kind,
      title: item.title.slice(0, 160),
      summary: item.summary.slice(0, 800),
      source: item.source,
      sourceUrl: item.sourceUrl.slice(0, 300),
      recordedAtLabel: item.recordedAtLabel.slice(0, 100),
      createdAt: serverTimestamp(),
    };
    if (item.flareClass) payload.flareClass = item.flareClass.slice(0, 24);
    if (typeof item.kpIndex === 'number') payload.kpIndex = item.kpIndex;
    await setDoc(doc(db, path), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function removeFirestoreFavorite(
  userId: string,
  favoriteId: string
): Promise<void> {
  const path = `users/${userId}/favorites/${favoriteId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
