import { auth, firestore } from '../firebase.js';
import {
  browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword,
  deleteUser, onAuthStateChanged, sendPasswordResetEmail, setPersistence,
  signInWithEmailAndPassword, signOut,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
  collection, doc, getDoc, runTransaction, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,20}$/;
const RESERVED_USERNAME = 'admin';
const RESERVED_EMAIL = 'admin.com@company.co.kr';
let resolveAuthReady;
const authReady = new Promise((resolve) => { resolveAuthReady = resolve; });

onAuthStateChanged(auth, (user) => {
  resolveAuthReady(user);
}, (error) => {
  resolveAuthReady(null);
});

export function waitForAuthReady() {
  return authReady;
}

export async function getUserProfile(user) {
  if (!user) return null;
  const profile = await getDoc(doc(firestore, 'users', user.uid));
  return profile.exists() ? profile.data() : null;
}

export function watchNoticeAuth(onChange) {
  let generation = 0;
  return onAuthStateChanged(auth, async (user) => {
    const currentGeneration = ++generation;
    try {
      const profile = await getUserProfile(user);
      if (currentGeneration === generation) onChange({ user, profile, error: null });
    } catch (error) {
      if (currentGeneration === generation) onChange({ user, profile: null, error });
    }
  }, (error) => {
    generation += 1;
    onChange({ user: auth.currentUser, profile: null, error });
  });
}

export async function registerNoticeUser({ name, username = '', email, password, agreements }) {
  const cleanName = name.trim();
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName || cleanName.length > 40) throw new Error('이름을 1~40자로 입력해 주세요.');
  
  if (cleanUsername && !USERNAME_PATTERN.test(cleanUsername)) {
    throw new Error('아이디는 영문, 숫자, 점, 밑줄, 하이픈으로 3~20자 입력해 주세요.');
  }
  if (cleanUsername === RESERVED_USERNAME || cleanEmail === RESERVED_EMAIL) {
    throw new Error('해당 관리자 계정 정보는 회원가입에 사용할 수 없습니다.');
  }
  if (password.length < 6) throw new Error('비밀번호는 6자 이상 입력해 주세요.');
  if (agreements && (!agreements.terms || !agreements.privacy)) {
    throw new Error('필수 약관에 동의해 주세요.');
  }
  await setPersistence(auth, browserSessionPersistence);
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  // The approved email-only form has no public username field. Keep the existing schema.
  const normalizedUsername = cleanUsername || `u_${credential.user.uid.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 18)}`;
  try {
    await runTransaction(firestore, async (transaction) => {
      const usernameRef = doc(collection(firestore, 'usernames'), normalizedUsername);
      const usernameSnapshot = await transaction.get(usernameRef);
      if (usernameSnapshot.exists()) throw new Error('이미 사용 중인 아이디입니다.');
      transaction.set(doc(firestore, 'users', credential.user.uid), {
        name: cleanName,
        username: normalizedUsername,
        usernameKey: normalizedUsername,
        email: cleanEmail,
        role: 'ueser',
        createdAt: serverTimestamp(),
        ...(agreements ? { agreements: {
          terms: true, privacy: true, marketing: Boolean(agreements.marketing),
        } } : {}),
      });
      transaction.set(usernameRef, { uid: credential.user.uid });
    });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], '회원 정보 저장과 계정 정리를 모두 완료하지 못했습니다.');
    }
    throw error;
  }
  return credential.user;
}

export async function loginNoticeUser(email, password, remember = false) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  let profile;
  try {
    profile = await getUserProfile(credential.user);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  if (!profile) {
    await signOut(auth);
    throw new Error('회원 프로필을 찾을 수 없습니다. 가입을 다시 진행하거나 관리자에게 문의해 주세요.');
  }
  return { user: credential.user, profile };
}

export function logoutNoticeUser() {
  return signOut(auth);
}

export async function resetNoticePassword(email) {
  auth.languageCode = 'ko';
  return sendPasswordResetEmail(auth, email.trim());
}

export function setupNoticeAuthControls(onStateChanged = () => {}) {
  const controls = [...document.querySelectorAll('[data-js="auth-control"]')];
  const nodes = controls.map((control) => ({
    greeting: control.querySelector('[data-js="auth-greeting"]'),
    login: control.querySelector('[data-js="auth-login"]'),
    signup: control.querySelector('[data-js="auth-signup"]'),
    logout: control.querySelector('[data-js="auth-logout"]'),
    status: control.querySelector('[data-js="auth-error"]'),
  }));
  const pagePrefix = location.pathname.includes('/pages/') ? '' : 'pages/';
  const isAccount = /\/(?:login|signup|notice-auth)\.html$/.test(location.pathname);
  const returnTo = isAccount ? new URLSearchParams(location.search).get('return')
    : `${location.pathname}${location.search}${location.hash}`;
  nodes.forEach(({ login, signup, logout, status }) => {
    for (const [link, page] of [[login, 'login'], [signup, 'signup']]) {
      if (!link) continue;
      const url = new URL(`${pagePrefix}${page}.html`, location.href);
      if (returnTo) url.searchParams.set('return', returnTo);
      link.href = url.href;
      if (location.pathname === url.pathname) link.setAttribute('aria-current', 'page');
    }
    logout?.addEventListener('click', async () => {
      logout.disabled = true;
      try { await logoutNoticeUser(); }
      catch (error) {
        if (status) { status.hidden = false; status.textContent = getAuthErrorMessage(error); }
      } finally { logout.disabled = false; }
    });
  });
  return watchNoticeAuth((state) => {
    nodes.forEach(({ greeting, login, signup, logout, status }) => {
      const signedIn = Boolean(state.user);
      const name = state.profile?.name || state.user?.displayName || '회원';
      if (greeting) {
        greeting.hidden = !signedIn;
        greeting.textContent = signedIn ? `${name}님 환영합니다` : '';
      }
      if (login) login.hidden = signedIn;
      if (signup) signup.hidden = signedIn;
      if (logout) logout.hidden = !signedIn;
      if (status) {
        status.hidden = !state.error;
        status.textContent = state.error ? '회원 정보를 불러오지 못했습니다. 새로고침해 주세요.' : '';
      }
    });
    onStateChanged(state);
  });
}

export function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': '이미 가입된 이메일입니다.',
    'auth/invalid-email': '이메일 주소를 확인해 주세요.',
    'auth/weak-password': '비밀번호는 6자 이상 입력해 주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/user-disabled': '사용이 중지된 계정입니다. 관리자에게 문의해 주세요.',
    'auth/too-many-requests': '요청이 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
    'permission-denied': '회원 정보를 저장할 수 없습니다. 관리자에게 문의해 주세요.',
  };
  return messages[error?.code] ?? error?.message ?? '요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
