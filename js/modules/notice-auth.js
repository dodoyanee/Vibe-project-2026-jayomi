import { auth, firestore } from '../firebase.js';
import {
  createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut,
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
  });
}

export async function registerNoticeUser({ name, username, email, password }) {
  const cleanName = name.trim();
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName || cleanName.length > 40) throw new Error('이름을 1~40자로 입력해 주세요.');
  const normalizedUsername = cleanUsername;
  if (!USERNAME_PATTERN.test(cleanUsername)) {
    throw new Error('아이디는 영문, 숫자, 점, 밑줄, 하이픈으로 3~20자 입력해 주세요.');
  }
  if (cleanUsername === RESERVED_USERNAME || cleanEmail === RESERVED_EMAIL) {
    throw new Error('해당 관리자 계정 정보는 회원가입에 사용할 수 없습니다.');
  }
  if (password.length < 6) throw new Error('비밀번호는 6자 이상 입력해 주세요.');
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
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

export async function loginNoticeUser(email, password) {
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

export function setupNoticeAuthControls(onStateChanged) {
  const controls = [...document.querySelectorAll('[data-js="auth-control"]')];
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const pagePrefix = location.pathname.includes('/pages/') ? '' : 'pages/';
  const loginUrl = `${pagePrefix}notice-auth.html?return=${encodeURIComponent(returnTo)}`;
  controls.forEach((control) => {
    const login = control.querySelector('[data-js="auth-login"]');
    if (login) login.href = loginUrl;
  });
  const showError = (error) => {
    const message = error?.message || '인증 상태를 확인하지 못했습니다.';
    controls.forEach((control) => {
      const status = control.querySelector('[data-js="auth-error"]');
      if (status) {
        status.hidden = false;
        status.textContent = message;
      }
    });
  };
  controls.forEach((control) => {
    control.querySelector('[data-js="auth-logout"]')?.addEventListener('click', async () => {
      try {
        await logoutNoticeUser();
        location.assign(`${pagePrefix}notice.html`);
      } catch (error) {
        showError(error);
      }
    });
  });
  return watchNoticeAuth((state) => {
    controls.forEach((control) => {
      const greeting = control.querySelector('[data-js="auth-greeting"]');
      const login = control.querySelector('[data-js="auth-login"]');
      const logout = control.querySelector('[data-js="auth-logout"]');
      const status = control.querySelector('[data-js="auth-error"]');
      const isSignedIn = Boolean(state.user && state.profile);
      const hasAuthUser = Boolean(state.user);
      if (greeting) {
        greeting.hidden = !isSignedIn;
        greeting.textContent = isSignedIn ? `${state.profile.name}님 환영합니다` : '';
      }
      if (login) login.hidden = hasAuthUser;
      if (logout) logout.hidden = !hasAuthUser;
      if (status) {
        status.hidden = !state.error;
        status.textContent = state.error ? `로그인 정보를 확인할 수 없습니다. ${state.error.message}` : '';
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
    'permission-denied': 'Firebase Firestore 보안 규칙이 가입 요청을 허용하지 않습니다.',
  };
  return messages[error?.code] ?? error?.message ?? '요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}
