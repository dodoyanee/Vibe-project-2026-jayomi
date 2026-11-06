import { NOTICE_CONFIG as config } from '../notice-config.js';
import { NOTICE_POSTS } from '../data/notice-data.js';
import { auth, firestore } from '../firebase.js';
import { waitForAuthReady } from './notice-auth.js';
import {
  collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

export function normalizePost(value) {
  if (!value || typeof value !== 'object') return null;
  if (!/^[a-z0-9-]{1,80}$/.test(value.id ?? '')) return null;
  if (!config.categories.includes(value.category)) return null;
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.length > config.titleLimit) return null;
  if (typeof value.content !== 'string' || value.content.length > config.contentLimit) return null;
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(value.date ?? '')) return null;
  if (!Number.isFinite(Date.parse(value.createdAt ?? ''))) return null;
  return {
    ...value, author: config.author, pinned: value.pinned === true,
    views: Number.isSafeInteger(value.views) && value.views >= 0 ? value.views : 0,
    richContent: typeof value.richContent === 'string' ? value.richContent.slice(0, config.contentLimit * 10) : '',
    attachments: Array.isArray(value.attachments) ? value.attachments.filter(isAttachment) : [],
  };
}

function isAttachment(file) {
  return file && /^[a-z0-9-]{1,80}$/.test(file.id ?? '')
    && typeof file.name === 'string' && file.name.length <= 255
    && Number.isFinite(file.size) && file.size >= 0 && file.size <= config.fileLimit;
}

function getLegacyPosts() {
  const raw = window.localStorage.getItem(config.storageKey);
  if (!raw) return [];
  const saved = JSON.parse(raw);
  if (!Array.isArray(saved)) throw new Error('기존 로컬 공지 데이터의 형식을 읽을 수 없습니다.');
  const posts = saved.map(normalizePost);
  if (posts.some((post) => !post)) throw new Error('기존 로컬 공지 데이터 일부가 손상되었습니다.');
  return posts;
}

async function writeMissingPosts(posts, existingIds) {
  const missing = posts.filter((post) => !existingIds.has(post.id));
  for (let offset = 0; offset < missing.length; offset += 400) {
    const batch = writeBatch(firestore);
    missing.slice(offset, offset + 400).forEach((post) => {
      batch.set(doc(firestore, config.collectionName, post.id), post);
    });
    await batch.commit();
  }
}

async function initializePosts() {
  await waitForAuthReady();
  const postsRef = collection(firestore, config.collectionName);
  const snapshot = await getDocs(postsRef);
  const existingIds = new Set(snapshot.docs.map((item) => item.id));
  const user = auth.currentUser;
  const profile = user ? await getDoc(doc(firestore, 'users', user.uid)) : null;
  const isAdmin = profile?.exists() && profile.data().role === 'admin';
  if (!isAdmin) return;
  const legacyPosts = window.localStorage.getItem(config.migrationKey) === 'done' ? [] : getLegacyPosts();
  const seeds = snapshot.empty ? NOTICE_POSTS : [];
  const candidates = new Map([...seeds, ...legacyPosts].map((post) => [post.id, post]));
  await writeMissingPosts([...candidates.values()], existingIds);
  if (window.localStorage.getItem(config.migrationKey) !== 'done') {
    window.localStorage.setItem(config.migrationKey, 'done');
  }
}

export async function readPosts() {
  await initializePosts();
  const snapshot = await getDocs(collection(firestore, config.collectionName));
  if (snapshot.empty) return NOTICE_POSTS.map((post) => ({ ...post }));
  const posts = snapshot.docs.map((item) => normalizePost({ ...item.data(), id: item.id }));
  if (posts.some((post) => !post)) throw new Error('Firestore 공지 데이터 일부가 올바르지 않습니다.');
  return posts.sort((a, b) => Number(b.pinned) - Number(a.pinned)
    || (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
}

export async function savePost(post) {
  const valid = normalizePost(post);
  if (!valid) throw new Error('제목과 본문을 확인한 뒤 다시 저장해 주세요.');
  await setDoc(doc(firestore, config.collectionName, valid.id), valid);
}

export async function removePost(post) {
  await deleteDoc(doc(firestore, config.collectionName, post.id));
}

export function getListState(search = location.search) {
  const params = new URLSearchParams(search);
  return {
    page: Math.max(1, Number.parseInt(params.get('page'), 10) || 1),
    category: config.categories.includes(params.get('category')) ? params.get('category') : 'all',
    query: (params.get('q') ?? '').slice(0, config.titleLimit),
    searchType: params.get('type') === 'all' ? 'all' : 'title',
  };
}

export function getVisiblePosts(posts, state) {
  const query = state.query.trim().toLocaleLowerCase();
  return posts.filter((post) => (state.category === 'all' || state.category === post.category)
    && (!query || `${post.title}${state.searchType === 'all' ? ` ${post.content}` : ''}`.toLocaleLowerCase().includes(query)));
}

export function getPageUrl(page, { state = getListState(), id = '', saved = '' } = {}) {
  const params = new URLSearchParams();
  if (id) params.set('id', id);
  if (state.page > 1) params.set('page', String(state.page));
  if (state.category !== 'all') params.set('category', state.category);
  if (state.query) params.set('q', state.query);
  if (state.searchType === 'all') params.set('type', 'all');
  if (saved) params.set('saved', saved);
  return `${page}${params.size ? `?${params}` : ''}`;
}

export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date).replaceAll('-', '.');
}

export function formatFileSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function openFiles() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(config.fileStore, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('다른 탭을 닫고 첨부파일 저장을 다시 시도해 주세요.'));
  });
}

export async function updateFiles({ add = [], remove = [] }) {
  if (!add.length && !remove.length) return;
  const database = await openFiles();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(config.fileStore, 'readwrite');
      const store = transaction.objectStore(config.fileStore);
      add.forEach((file) => store.put(file));
      remove.forEach((id) => store.delete(id));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new Error('첨부파일 저장이 중단되었습니다.'));
    });
  } finally { database.close(); }
}

export async function getFile(id) {
  const database = await openFiles();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(config.fileStore).objectStore(config.fileStore).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { database.close(); }
}
