import { auth, firestore } from '../firebase.js';
import { CONTACT_CONFIG as config } from '../contact-config.js';
import {
  collection, doc, getDoc, getDocs, orderBy, query, runTransaction,
  serverTimestamp, writeBatch,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const questionRef = (id) => doc(firestore, config.collectionName, id);
const bodyRef = (id) => doc(firestore, config.collectionName, id, 'content', 'question');
const answerRef = (id) => doc(firestore, config.collectionName, id, 'answers', 'response');

export async function readQuestions() {
  const snapshot = await getDocs(query(
    collection(firestore, config.collectionName),
    orderBy('createdAt', 'desc'),
  ));
  return snapshot.docs.map((item) => {
    const data = item.data();
    if (typeof data.uid !== 'string' || typeof data.authorName !== 'string'
      || data.authorName.length > 40
      || !config.categories.includes(data.category)
      || typeof data.title !== 'string' || !data.title.trim()
      || data.title.length > config.titleLimit || typeof data.isPrivate !== 'boolean'
      || typeof data.answered !== 'boolean') {
      throw new Error('문의 목록 데이터 형식이 올바르지 않습니다.');
    }
    return { ...data, id: item.id };
  });
}

export async function readQuestion(id) {
  const snapshot = await getDoc(questionRef(id));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (typeof data.uid !== 'string' || typeof data.authorName !== 'string'
    || data.authorName.length > 40
    || !config.categories.includes(data.category)
    || typeof data.title !== 'string' || !data.title.trim()
    || data.title.length > config.titleLimit || typeof data.isPrivate !== 'boolean'
    || typeof data.answered !== 'boolean') {
    throw new Error('문의 데이터 형식이 올바르지 않습니다.');
  }
  const [bodySnapshot, answerSnapshot] = await Promise.all([
    getDoc(bodyRef(id)),
    getDoc(answerRef(id)),
  ]);
  if (!bodySnapshot.exists()) throw new Error('문의 본문을 찾을 수 없습니다.');
  const body = bodySnapshot.data().body;
  if (typeof body !== 'string') throw new Error('문의 본문 형식이 올바르지 않습니다.');
  return {
    ...data,
    id: snapshot.id,
    body,
    answer: answerSnapshot.exists() ? answerSnapshot.data() : null,
  };
}

function validateQuestion({ category, title, body }) {
  if (!config.categories.includes(category)) throw new Error('질문 유형을 선택해 주세요.');
  if (!title.trim() || title.trim().length > config.titleLimit) throw new Error('제목을 1~100자로 입력해 주세요.');
  if (!body.trim() || body.trim().length > config.bodyLimit) throw new Error('내용을 1~20,000자로 입력해 주세요.');
}

export async function createQuestion({ category, title, body, isPrivate, profile }) {
  validateQuestion({ category, title, body });
  if (!auth.currentUser || !profile) throw new Error('문의 작성은 로그인 후 이용할 수 있습니다.');
  const ref = doc(collection(firestore, config.collectionName));
  const batch = writeBatch(firestore);
  batch.set(ref, {
    uid: auth.currentUser.uid,
    authorName: profile.name,
    category,
    title: title.trim(),
    isPrivate: Boolean(isPrivate),
    answered: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(ref, 'content', 'question'), {
    body: body.trim(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return ref.id;
}

export async function updateQuestion(id, { category, title, body, isPrivate }) {
  validateQuestion({ category, title, body });
  const batch = writeBatch(firestore);
  batch.update(questionRef(id), {
    category,
    title: title.trim(),
    isPrivate: Boolean(isPrivate),
    updatedAt: serverTimestamp(),
  });
  batch.update(bodyRef(id), {
    body: body.trim(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function removeQuestion(id) {
  const [bodySnapshot, answerSnapshot] = await Promise.all([
    getDoc(bodyRef(id)),
    getDoc(answerRef(id)),
  ]);
  const batch = writeBatch(firestore);
  if (bodySnapshot.exists()) batch.delete(bodyRef(id));
  if (answerSnapshot.exists()) batch.delete(answerRef(id));
  batch.delete(questionRef(id));
  await batch.commit();
}

export async function saveAnswer(id, body, profile) {
  const cleanBody = body.trim();
  if (!cleanBody || cleanBody.length > config.bodyLimit) throw new Error('답변을 1~20,000자로 입력해 주세요.');
  if (profile?.role !== 'admin' || !auth.currentUser) throw new Error('관리자만 답변을 등록할 수 있습니다.');
  await runTransaction(firestore, async (transaction) => {
    const parent = questionRef(id);
    const response = answerRef(id);
    const [questionSnapshot, answerSnapshot] = await Promise.all([
      transaction.get(parent),
      transaction.get(response),
    ]);
    if (!questionSnapshot.exists()) throw new Error('문의 글을 찾을 수 없습니다.');
    transaction.set(response, {
      body: cleanBody,
      adminUid: auth.currentUser.uid,
      adminName: profile.name,
      ...(answerSnapshot.exists() ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    });
    transaction.update(parent, { answered: true, updatedAt: serverTimestamp() });
  });
}

export async function removeAnswer(id, profile) {
  if (profile?.role !== 'admin') throw new Error('관리자만 답변을 삭제할 수 있습니다.');
  await runTransaction(firestore, async (transaction) => {
    const parent = questionRef(id);
    const response = answerRef(id);
    const [questionSnapshot, answerSnapshot] = await Promise.all([
      transaction.get(parent),
      transaction.get(response),
    ]);
    if (!questionSnapshot.exists()) throw new Error('문의 글을 찾을 수 없습니다.');
    if (!answerSnapshot.exists()) return;
    transaction.delete(response);
    transaction.update(parent, { answered: false, updatedAt: serverTimestamp() });
  });
}

export function formatContactDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date).replaceAll('-', '.');
}
