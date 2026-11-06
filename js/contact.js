import { initSiteChrome } from './modules/site-chrome.js';
import { initSiteNavigation } from './modules/site-navigation.js';
import { getSafeAccountReturn } from './utils/account-navigation.js';
import { auth, firestore } from './firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { CONTACT_CONFIG as config } from './contact-config.js';
import {
  createQuestion, formatContactDate, readQuestion, readQuestions, removeAnswer,
  removeQuestion, saveAnswer, updateQuestion,
} from './modules/contact-store.js';
import { getUserProfile, setupNoticeAuthControls, waitForAuthReady } from './modules/notice-auth.js';

await initSiteChrome();
initSiteNavigation();
setupNoticeAuthControls();

const root = document.querySelector('[data-js="contact-root"]');
const status = root.querySelector('[data-js="contact-status"]');
const loginHref = (returnTo = `${location.pathname}${location.search}${location.hash}`) => {
  const url = new URL('login.html', location.href);
  url.searchParams.set('return', getSafeAccountReturn(returnTo));
  return url.href;
};

function showStatus(message, isError = false) {
  status.hidden = !message;
  status.textContent = message;
  status.dataset.state = isError ? 'error' : 'success';
}

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function addLink(parent, text, href, className = 'notice-button') {
  const anchor = make('a', className, text);
  anchor.href = href;
  parent.append(anchor);
  return anchor;
}

function setBusy(form, busy) {
  form.setAttribute('aria-busy', String(busy));
  form.querySelectorAll('input, select, textarea, button').forEach((control) => {
    control.disabled = busy;
  });
}

function questionListUrl(page = 1, category = 'all', query = '') {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (category !== 'all') params.set('category', category);
  if (query) params.set('q', query);
  return `${config.listPage}${params.size ? `?${params}` : ''}`;
}

function renderQuestionList(questions) {
  const params = new URLSearchParams(location.search);
  const selectedCategory = config.categories.includes(params.get('category'))
    ? params.get('category') : 'all';
  const search = (params.get('q') ?? '').trim().toLocaleLowerCase();
  const filtered = questions.filter((question) => (selectedCategory === 'all' || question.category === selectedCategory)
    && (!search || `${question.title} ${question.authorName}`.toLocaleLowerCase().includes(search)));
  const pageCount = Math.max(1, Math.ceil(filtered.length / config.pageSize));
  const page = Math.min(pageCount, Math.max(1, Number.parseInt(params.get('page'), 10) || 1));
  const start = (page - 1) * config.pageSize;
  const rows = root.querySelector('[data-js="contact-rows"]');
  const fragment = document.createDocumentFragment();
  filtered.slice(start, start + config.pageSize).forEach((question, index) => {
    const row = make('tr', 'notice-table__row');
    const answerState = make('td', 'notice-table__number');
    if (question.answered) answerState.append(make('span', 'contact-answer-badge', '답변완료'));
    else answerState.textContent = String(filtered.length - start - index).padStart(3, '0');
    const category = make('td', 'notice-table__category', question.category);
    const subject = make('th', 'notice-table__subject');
    subject.scope = 'row';
    const anchor = make('a', 'notice-table__link');
    anchor.href = `${config.viewPage}?id=${encodeURIComponent(question.id)}`;
    anchor.append(make('span', 'notice-table__title', question.title));
    if (question.isPrivate) {
      anchor.append(make('span', 'contact-private-label', '🔒 비공개'));
    }
    subject.append(anchor);
    const date = make('td', 'notice-table__date', formatContactDate(question.createdAt));
    const action = make('td', 'notice-table__action');
    const more = addLink(action, '↗', anchor.href, 'notice-button notice-button--circle');
    more.setAttribute('aria-label', `${question.title} 상세보기`);
    row.append(answerState, category, subject, date, action);
    fragment.append(row);
  });
  rows.replaceChildren(fragment);
  root.querySelector('[data-js="contact-empty"]').hidden = filtered.length !== 0;
  root.querySelector('[data-js="contact-count"]').textContent = `(${questions.length})`;
  root.querySelector('[data-js="contact-result"]').textContent = filtered.length
    ? `SHOWING ${String(start + 1).padStart(2, '0')}—${String(Math.min(start + config.pageSize, filtered.length)).padStart(2, '0')} OF ${filtered.length}`
    : 'SHOWING 00 OF 00';
  root.querySelector('[data-js="contact-search-input"]').value = params.get('q') ?? '';
  root.querySelectorAll('[data-contact-category]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.contactCategory === selectedCategory));
  });
  const writeLink = root.querySelector('[data-js="contact-write-link"]');
  writeLink.href = auth.currentUser
    ? config.writePage
    : loginHref(new URL(config.writePage, location.href).pathname);
  renderPagination(root.querySelector('[data-js="contact-pagination"]'), page, pageCount, selectedCategory, search);
}

function renderPagination(container, page, pageCount, category, search) {
  const fragment = document.createDocumentFragment();
  const addPage = (label, target, disabled = false) => {
    const item = disabled
      ? make('span', 'notice-button notice-button--circle is-disabled', label)
      : make('a', 'notice-button notice-button--circle', label);
    if (!disabled) {
      item.href = questionListUrl(target, category, search);
      if (target === page) item.setAttribute('aria-current', 'page');
    } else item.setAttribute('aria-disabled', 'true');
    fragment.append(item);
  };
  addPage('‹', page - 1, page === 1);
  const first = Math.max(1, Math.min(page - 2, pageCount - 4));
  for (let number = first; number <= Math.min(pageCount, first + 4); number += 1) {
    addPage(String(number).padStart(2, '0'), number);
  }
  addPage('›', page + 1, page === pageCount);
  container.replaceChildren(fragment);
}

async function initList(user) {
  const questions = await readQuestions();
  renderQuestionList(questions);
  root.querySelector('[data-js="contact-filters"]').addEventListener('click', (event) => {
    const button = event.target.closest('[data-contact-category]');
    if (!button) return;
    location.assign(questionListUrl(1, button.dataset.contactCategory, root.querySelector('[data-js="contact-search-input"]').value.trim()));
  });
  root.querySelector('[data-js="contact-search"]').addEventListener('submit', (event) => {
    event.preventDefault();
    const params = new URLSearchParams(location.search);
    location.assign(questionListUrl(1, params.get('category') ?? 'all', root.querySelector('[data-js="contact-search-input"]').value.trim()));
  });
  root.querySelector('[data-js="contact-pagination"]').addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    location.assign(anchor.href);
  });
}

function showDetailActions(question, user, profile) {
  const actions = root.querySelector('[data-js="contact-actions"]');
  actions.replaceChildren();
  addLink(actions, '목록으로 ↗', questionListUrl());
  if (user?.uid === question.uid) {
    addLink(actions, '문의 수정 ↗', `${config.writePage}?id=${encodeURIComponent(question.id)}`);
    const remove = make('button', 'notice-button', '문의 삭제');
    remove.type = 'button';
    remove.addEventListener('click', async () => {
      if (!window.confirm('이 문의를 삭제할까요?')) return;
      remove.disabled = true;
      try {
        await removeQuestion(question.id);
        location.assign(`${config.listPage}?deleted=1`);
      } catch (error) {
        showStatus(`문의 삭제에 실패했습니다. 권한과 Firestore 규칙을 확인해 주세요. ${error.message}`, true);
        remove.disabled = false;
      }
    });
    actions.append(remove);
  }
  root.querySelector('[data-js="contact-answer-area"]').hidden = profile?.role !== 'admin';
}

function renderAnswer(answer) {
  const section = root.querySelector('[data-js="contact-answer-section"]');
  section.hidden = !answer;
  if (!answer) return;
  root.querySelector('[data-js="contact-answer-author"]').textContent = answer.adminName || '관리자';
  root.querySelector('[data-js="contact-answer-date"]').textContent = formatContactDate(answer.updatedAt);
  root.querySelector('[data-js="contact-answer-body"]').textContent = answer.body;
}

async function initDetail(user, profile) {
  const id = new URLSearchParams(location.search).get('id');
  if (!id || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new Error('문의 주소가 올바르지 않습니다.');
  const metadata = await readQuestionMetadata(id);
  if (!metadata) throw new Error('문의를 찾을 수 없습니다.');
  const canRead = !metadata.isPrivate || user?.uid === metadata.uid || profile?.role === 'admin';
  const title = root.querySelector('[data-js="contact-title"]');
  title.textContent = metadata.title;
  root.querySelector('[data-js="contact-category"]').textContent = metadata.category;
  root.querySelector('[data-js="contact-author"]').textContent = metadata.authorName;
  root.querySelector('[data-js="contact-date"]').textContent = formatContactDate(metadata.createdAt);
  root.querySelector('[data-js="contact-private-label"]').hidden = !metadata.isPrivate;
  showDetailActions(metadata, user, profile);
  if (!canRead) {
    root.querySelector('[data-js="contact-question-body"]').hidden = true;
    root.querySelector('[data-js="contact-locked"]').hidden = false;
    root.querySelector('[data-js="contact-answer-area"]').hidden = true;
    return;
  }
  const question = await readQuestion(id);
  root.querySelector('[data-js="contact-question-body"]').textContent = question.body;
  renderAnswer(question.answer);
  if (profile?.role === 'admin') initAnswerForm(id, profile, question.answer);
  document.title = `${metadata.title} | Contact · DRAFT.X`;
}

async function readQuestionMetadata(id) {
  const snapshot = await getDoc(doc(firestore, config.collectionName, id));
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
}

function initAnswerForm(id, profile, existingAnswer) {
  const form = root.querySelector('[data-js="contact-answer-form"]');
  const field = root.querySelector('[data-js="contact-answer-input"]');
  const submit = root.querySelector('[data-js="contact-answer-submit"]');
  const remove = root.querySelector('[data-js="contact-answer-remove"]');
  field.value = existingAnswer?.body ?? '';
  submit.textContent = existingAnswer ? '답변 수정' : '답변 등록';
  remove.hidden = !existingAnswer;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    setBusy(form, true);
    try {
      await saveAnswer(id, field.value, profile);
      location.reload();
    } catch (error) {
      showStatus(`답변 저장에 실패했습니다. ${error.message}`, true);
      setBusy(form, false);
    }
  });
  remove.addEventListener('click', async () => {
    if (!window.confirm('답변을 삭제할까요?')) return;
    remove.disabled = true;
    try {
      await removeAnswer(id, profile);
      location.reload();
    } catch (error) {
      showStatus(`답변 삭제에 실패했습니다. ${error.message}`, true);
      remove.disabled = false;
    }
  });
}

async function initForm(user, profile) {
  if (!user) {
    location.replace(loginHref());
    return;
  }
  if (!profile) throw new Error('회원 정보를 불러오지 못했습니다. 다시 로그인해 주세요.');
  const form = root.querySelector('[data-js="contact-form"]');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  let existing = null;
  if (id) {
    existing = await readQuestion(id);
    if (!existing || existing.uid !== user.uid) {
      throw new Error('본인이 작성한 문의만 수정할 수 있습니다.');
    }
    form.elements.category.value = existing.category;
    form.elements.title.value = existing.title;
    form.elements.body.value = existing.body;
    form.elements.isPrivate.checked = existing.isPrivate;
    root.querySelector('[data-js="contact-form-title"]').textContent = '문의 수정';
    root.querySelector('[data-js="contact-submit-label"]').textContent = '수정하기';
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    showStatus('');
    setBusy(form, true);
    const values = new FormData(form);
    try {
      if (existing) {
        await updateQuestion(id, {
          category: values.get('category'),
          title: values.get('title'),
          body: values.get('body'),
          isPrivate: values.has('isPrivate'),
        });
        location.assign(`${config.viewPage}?id=${encodeURIComponent(id)}&saved=1`);
      } else {
        const newId = await createQuestion({
          category: values.get('category'),
          title: values.get('title'),
          body: values.get('body'),
          isPrivate: values.has('isPrivate'),
          profile,
        });
        location.assign(`${config.viewPage}?id=${encodeURIComponent(newId)}&saved=1`);
      }
    } catch (error) {
      showStatus(`문의 저장에 실패했습니다. 로그인 상태와 Firestore 규칙을 확인해 주세요. ${error.message}`, true);
      setBusy(form, false);
    }
  });
}

async function start() {
  await waitForAuthReady();
  const user = auth.currentUser;
  let profile = null;
  if (user) profile = await getUserProfile(user);
  const view = root.dataset.contactView;
  if (view === 'list') await initList(user);
  else if (view === 'detail') await initDetail(user, profile);
  else if (view === 'form') await initForm(user, profile);
  const params = new URLSearchParams(location.search);
  if (params.has('saved')) showStatus('문의가 저장되었습니다.');
  else if (params.has('deleted')) showStatus('문의를 삭제했습니다.');
}

start().catch((error) => {
  if (error?.code === 'permission-denied') {
    showStatus('비공개 문의는 작성자와 관리자만 조회할 수 있습니다.', true);
  } else {
    showStatus(`Contact를 불러오지 못했습니다. Firebase 연결과 Firestore 규칙을 확인해 주세요. ${error.message}`, true);
  }
});
