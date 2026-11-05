import { NOTICE_CONFIG as config } from '../notice-config.js';
import { NOTICE_POSTS } from '../data/notice-data.js';
import { readPosts, savePost, getListState, getVisiblePosts, getPageUrl, formatDate, formatFileSize, updateFiles, getFile } from './notice-store.js';
import { getSafeContent, formatSelection, getSafeLink, insertText } from './notice-rich-text.js';

const ICON_NAMESPACE = 'http://www.w3.org/2000/svg';
const hook = (name, root = document) => root.querySelector(`[data-js="${name}"]`);
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};
const icon = (name) => {
  const svg = document.createElementNS(ICON_NAMESPACE, 'svg');
  const use = document.createElementNS(ICON_NAMESPACE, 'use');
  use.setAttribute('href', `#notice-${name}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('notice-icon');
  svg.append(use);
  return svg;
};
const link = (text, href, className = 'notice-button') => {
  const element = make('a', className, text);
  element.href = href;
  return element;
};

function showMessage(message, isError = false) {
  const status = hook('notice-status');
  status.hidden = false;
  status.textContent = message;
  status.dataset.state = isError ? 'error' : 'success';
}

function makeRow(post, index, state) {
  const row = make('tr', 'notice-table__row');
  const number = make('td', 'notice-table__number');
  number.append(post.pinned ? make('span', 'notice-badge', 'PINNED') : document.createTextNode(String(index).padStart(3, '0')));
  const category = make('td', 'notice-table__category', post.category);
  const subject = make('th', 'notice-table__subject');
  subject.scope = 'row';
  const href = getPageUrl(config.viewPage, { state, id: post.id });
  const title = link('', href, 'notice-table__link');
  title.append(make('span', 'notice-table__mobile-meta', `${post.category} / ${post.date}`));
  title.append(make('span', 'notice-table__title', post.title));
  if (post.isNew) title.append(make('span', 'notice-table__new', 'N'));
  subject.append(title);
  const date = make('td', 'notice-table__date', post.date);
  const action = make('td', 'notice-table__action');
  const more = link('', href, 'notice-button notice-button--circle');
  more.setAttribute('aria-label', `${post.title} 상세보기`);
  more.append(icon('arrow'));
  action.append(more);
  row.append(number, category, subject, date, action);
  return row;
}

function pageLink(text, number, state, { current = false, disabled = false, label = '' } = {}) {
  const element = disabled ? make('span', 'notice-button notice-button--circle is-disabled', text)
    : link(text, getPageUrl(config.listPage, { state: { ...state, page: number } }), 'notice-button notice-button--circle');
  if (disabled) element.setAttribute('aria-disabled', 'true');
  if (current) element.setAttribute('aria-current', 'page');
  if (label) element.setAttribute('aria-label', label);
  element.dataset.noticePage = String(number);
  return element;
}

function renderPagination(state, pageCount) {
  const pagination = hook('notice-pagination');
  const fragment = document.createDocumentFragment();
  fragment.append(pageLink('‹', state.page - 1, state, { disabled: state.page === 1, label: '이전 페이지' }));
  const start = Math.max(1, Math.min(state.page - 2, pageCount - 4));
  for (let number = start; number <= Math.min(pageCount, start + 4); number += 1) {
    fragment.append(pageLink(String(number).padStart(2, '0'), number, state, { current: number === state.page, label: `${number}페이지` }));
  }
  fragment.append(pageLink('›', state.page + 1, state, { disabled: state.page === pageCount, label: '다음 페이지' }));
  pagination.replaceChildren(fragment);
}

function renderList(posts) {
  const state = getListState();
  const matching = getVisiblePosts(posts, state);
  const pages = Math.max(1, Math.ceil(matching.length / config.pageSize));
  state.page = Math.min(state.page, pages);
  history.replaceState(null, '', getPageUrl(config.listPage, { state }));
  const start = (state.page - 1) * config.pageSize;
  const fragment = document.createDocumentFragment();
  matching.slice(start, start + config.pageSize).forEach((post) => fragment.append(makeRow(post, posts.length - posts.indexOf(post), state)));
  hook('notice-rows').replaceChildren(fragment);
  hook('notice-empty').hidden = matching.length > 0;
  hook('notice-count').textContent = `(${posts.length})`;
  hook('notice-all-count').textContent = String(posts.length);
  hook('notice-result').textContent = matching.length ? `SHOWING ${String(start + 1).padStart(2, '0')}—${String(Math.min(start + config.pageSize, matching.length)).padStart(2, '0')} OF ${matching.length}` : 'SHOWING 00 OF 00';
  hook('notice-search-input').value = state.query;
  hook('notice-search-type').value = state.searchType;
  hook('notice-write-link').href = getPageUrl(config.writePage, { state });
  document.querySelectorAll('[data-notice-category]').forEach((element) => {
    const selected = element.dataset.noticeCategory === state.category;
    element.setAttribute('aria-pressed', String(selected));
  });
  renderPagination(state, pages);
}

function initList(posts, signal) {
  const update = (state) => {
    history.pushState(null, '', getPageUrl(config.listPage, { state }));
    renderList(posts);
    hook('notice-table-heading').focus({ preventScroll: true });
  };
  renderList(posts);
  hook('notice-filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-notice-category]');
    if (button) update({ ...getListState(), category: button.dataset.noticeCategory, page: 1 });
  }, { signal });
  hook('notice-search').addEventListener('submit', (event) => {
    event.preventDefault();
    update({ ...getListState(), query: hook('notice-search-input').value.trim(), searchType: hook('notice-search-type').value, page: 1 });
  }, { signal });
  hook('notice-pagination').addEventListener('click', (event) => {
    const target = event.target.closest('a[data-notice-page]');
    if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    update({ ...getListState(), page: Number(target.dataset.noticePage) });
  }, { signal });
  window.addEventListener('popstate', () => renderList(posts), { signal });
}

function makeAttachment(file, onRemove) {
  const item = make('li', 'notice-file');
  const text = make('span', 'notice-file__name', file.name);
  const size = make('span', 'notice-file__size', formatFileSize(file.size));
  const action = make('button', 'notice-button notice-button--circle');
  action.type = 'button';
  action.setAttribute('aria-label', `${file.name} ${onRemove ? '첨부 취소' : '내려받기'}`);
  action.append(icon(onRemove ? 'close' : 'download'));
  action.dataset[onRemove ? 'removeFile' : 'downloadFile'] = file.id;
  item.append(text, size, action);
  return item;
}

function renderNeighbors(post, posts) {
  const index = posts.findIndex((item) => item.id === post.id);
  const neighbors = [posts[index - 1], posts[index + 1]];
  hook('notice-neighbors').replaceChildren(...neighbors.map((neighbor, itemIndex) => {
    const item = make('div', 'notice-neighbor');
    item.append(make('span', 'notice-neighbor__label', itemIndex === 0 ? 'PREV ↑' : 'NEXT ↓'));
    if (!neighbor) { item.append(make('span', 'notice-neighbor__empty', itemIndex === 0 ? '이전 글이 없습니다.' : '다음 글이 없습니다.')); return item; }
    item.append(link(neighbor.title, getPageUrl(config.viewPage, { id: neighbor.id }), 'notice-neighbor__link'));
    item.append(make('time', 'notice-neighbor__date', neighbor.date));
    return item;
  }));
}

async function downloadFile(id, signal) {
  try {
    const saved = await getFile(id);
    if (signal.aborted) return;
    if (!saved?.blob) throw new Error('이 브라우저에서 첨부파일을 찾을 수 없습니다.');
    const url = URL.createObjectURL(saved.blob);
    const anchor = link('', url);
    anchor.download = saved.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) { showMessage(`${error.message} 다시 시도하거나 작성자에게 문의해 주세요.`, true); }
}

function initDetail(post, posts, signal) {
  hook('notice-article-title').textContent = post.title;
  hook('notice-article-badge').textContent = `${post.category}${post.pinned ? ' · PINNED' : ''}`;
  hook('notice-article-date').textContent = post.date;
  hook('notice-article-date').dateTime = post.date.replaceAll('.', '-');
  hook('notice-article-views').textContent = `조회수 ${post.views}`;
  hook('notice-article-body').replaceChildren(getSafeContent(post));
  hook('notice-edit-link').href = getPageUrl(config.editPage, { id: post.id });
  const files = hook('notice-article-files');
  files.replaceChildren(...post.attachments.map((file) => makeAttachment(file)));
  hook('notice-attachments').hidden = !post.attachments.length;
  files.addEventListener('click', (event) => {
    const target = event.target.closest('[data-download-file]');
    if (target) downloadFile(target.dataset.downloadFile, signal);
  }, { signal });
  document.title = `${post.title} | NOTICE · DRAFT.X`;
  renderNeighbors(post, posts);
}

function setError(name, message) {
  const element = hook(`notice-${name}`);
  const error = hook(`notice-${name}-error`);
  error.textContent = message;
  error.hidden = !message;
  if (element) element.setAttribute('aria-invalid', String(Boolean(message)));
}

function validateEditor(editor) {
  const title = hook('notice-title').value.trim();
  const content = editor.innerText.trim();
  const titleError = !title ? '제목을 입력해 주세요.' : title.length > config.titleLimit ? '제목은 100자 이내로 입력해 주세요.' : '';
  const contentError = !content ? '본문 내용을 입력해 주세요.' : content.length > config.contentLimit ? '본문은 20,000자 이내로 입력해 주세요.' : '';
  setError('title', titleError);
  setError('content', contentError);
  if (titleError) hook('notice-title').focus();
  else if (contentError) editor.focus();
  return !titleError && !contentError;
}

function initLinkDialog(editor, signal) {
  const dialog = hook('notice-link-dialog');
  const form = hook('notice-link-form');
  let range = null;
  const open = () => {
    const selection = window.getSelection();
    range = selection?.rangeCount && editor.contains(selection.getRangeAt(0).commonAncestorContainer) ? selection.getRangeAt(0).cloneRange() : null;
    hook('notice-link-text').value = range?.toString() ?? '';
    hook('notice-link-url').value = '';
    hook('notice-link-error').textContent = '';
    dialog.showModal();
  };
  hook('notice-link-cancel').addEventListener('click', () => dialog.close(), { signal });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const href = getSafeLink(hook('notice-link-url').value.trim());
    const text = hook('notice-link-text').value.trim();
    if (!href || !text) { hook('notice-link-error').textContent = '링크 이름과 http, https 또는 mailto로 시작하는 주소를 입력해 주세요.'; return; }
    editor.focus();
    const target = range ?? document.createRange();
    if (!range) { target.selectNodeContents(editor); target.collapse(false); }
    target.deleteContents();
    target.insertNode(link(text, href, ''));
    dialog.close();
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }, { signal });
  return open;
}

function initRichEditor(editor, signal) {
  const toolbar = hook('notice-toolbar');
  const openLink = initLinkDialog(editor, signal);
  toolbar.addEventListener('mousedown', (event) => { if (event.target.closest('button')) event.preventDefault(); }, { signal });
  toolbar.addEventListener('click', (event) => {
    const target = event.target.closest('[data-format]');
    if (!target) return;
    if (target.dataset.format === 'link') { openLink(); return; }
    if (!formatSelection(editor, target.dataset.format)) showMessage('본문에서 서식을 적용할 내용을 먼저 선택해 주세요.');
  }, { signal });
  editor.addEventListener('paste', (event) => { event.preventDefault(); insertText(editor, event.clipboardData.getData('text/plain')); }, { signal });
  editor.addEventListener('keydown', (event) => {
    const format = { b: 'bold', i: 'italic', u: 'underline' }[event.key.toLowerCase()];
    if (!(event.ctrlKey || event.metaKey) || !format) return;
    event.preventDefault();
    formatSelection(editor, format);
  }, { signal });
}

function initFileInput(existing, signal) {
  const files = existing.map((file) => ({ ...file }));
  const render = () => hook('notice-files').replaceChildren(...files.map((file) => makeAttachment(file, true)));
  hook('notice-file-select').addEventListener('click', () => hook('notice-file-input').click(), { signal });
  hook('notice-file-input').addEventListener('change', (event) => {
    const selected = [...event.target.files];
    if (selected.reduce((size, file) => size + file.size, files.reduce((size, file) => size + file.size, 0)) > config.fileLimit) {
      setError('file', '첨부파일의 전체 용량은 20MB 이하여야 합니다. 파일을 줄여 다시 선택해 주세요.');
    } else {
      selected.forEach((file) => files.push({ id: `file-${crypto.randomUUID()}`, name: file.name.slice(0, 255), size: file.size, type: file.type, blob: file }));
      setError('file', '');
      render();
    }
    event.target.value = '';
  }, { signal });
  hook('notice-files').addEventListener('click', (event) => {
    const target = event.target.closest('[data-remove-file]');
    if (!target) return;
    const index = files.findIndex((file) => file.id === target.dataset.removeFile);
    if (index >= 0) files.splice(index, 1);
    render();
    hook('notice-file-select').focus();
  }, { signal });
  render();
  return files;
}

async function persistEditor({ post, editor, files }) {
  const now = new Date();
  const value = {
    ...post, id: post?.id ?? `post-${crypto.randomUUID()}`, author: config.author,
    title: hook('notice-title').value.trim(), category: hook('notice-category').value,
    content: editor.innerText.trim(), richContent: editor.innerHTML,
    pinned: hook('notice-pin').checked, views: post?.views ?? 0, isNew: !post,
    date: post?.date ?? formatDate(now), createdAt: post?.createdAt ?? now.toISOString(), updatedAt: now.toISOString(),
    attachments: files.map(({ id, name, size, type }) => ({ id, name, size, type })),
  };
  const added = files.filter((file) => file.blob);
  await updateFiles({ add: added });
  try { savePost(value); }
  catch (error) { await updateFiles({ remove: added.map((file) => file.id) }); throw error; }
  const removed = (post?.attachments ?? []).filter((file) => !files.some((item) => item.id === file.id));
  // Metadata is committed first, so a failed cleanup never removes a referenced attachment.
  updateFiles({ remove: removed.map((file) => file.id) }).catch(() => {
    showMessage('글은 저장되었습니다. 사용하지 않는 첨부파일의 정리는 브라우저 저장소 설정을 확인한 뒤 진행해 주세요.');
  });
  return value;
}

function initEditor(post, signal) {
  const editor = hook('notice-content');
  const title = hook('notice-title');
  const form = hook('notice-form');
  const submit = hook('notice-submit');
  if (post) {
    title.value = post.title;
    hook('notice-category').value = post.category;
    hook('notice-pin').checked = post.pinned;
    editor.replaceChildren(getSafeContent(post));
    hook('notice-cancel-link').href = getPageUrl(config.viewPage, { id: post.id });
    hook('notice-edited-date').textContent = `마지막 수정 ${formatDate(new Date(post.updatedAt ?? post.createdAt))}`;
  }
  const updateCounts = () => {
    hook('notice-title-count').textContent = `${title.value.length} / ${config.titleLimit}`;
    hook('notice-content-count').textContent = `${editor.innerText.trim().length.toLocaleString()} / 20,000 CHARACTERS`;
  };
  title.addEventListener('input', updateCounts, { signal });
  editor.addEventListener('input', updateCounts, { signal });
  updateCounts();
  initRichEditor(editor, signal);
  const files = initFileInput(post?.attachments ?? [], signal);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled || !validateEditor(editor)) return;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    hook('notice-submit-label').textContent = '저장 중…';
    try {
      const saved = await persistEditor({ post, editor, files });
      location.assign(getPageUrl(config.viewPage, { id: saved.id, saved: post ? 'edited' : 'created' }));
    } catch {
      showMessage('저장 공간을 사용할 수 없습니다. 브라우저의 저장소 설정과 남은 공간을 확인한 뒤 다시 시도해 주세요.', true);
      submit.disabled = false;
      form.setAttribute('aria-busy', 'false');
      hook('notice-submit-label').textContent = post ? '수정 완료' : '등록하기';
    }
  }, { signal });
}

function showNotFound() {
  hook('notice-page').hidden = true;
  hook('notice-not-found').hidden = false;
  document.title = '글을 찾을 수 없습니다 | NOTICE · DRAFT.X';
}

export function initNoticeBoard() {
  const root = hook('notice-root');
  if (!root) return () => {};
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  let posts;
  try { posts = readPosts(); }
  catch { posts = NOTICE_POSTS; showMessage('저장된 글을 불러오지 못했습니다. 기본 목록을 표시합니다. 브라우저 저장소 설정을 확인해 주세요.', true); }
  const params = new URLSearchParams(location.search);
  const page = root.dataset.noticeView;
  const post = posts.find((item) => item.id === params.get('id'));
  document.querySelectorAll('[data-notice-list-link]').forEach((element) => { element.href = getPageUrl(config.listPage); });
  if (page === 'list') initList(posts, signal);
  else if (page !== 'write' && !post) showNotFound();
  else if (page === 'detail') initDetail(post, posts, signal);
  else initEditor(page === 'edit' ? post : null, signal);
  if (params.has('saved')) {
    showMessage(params.get('saved') === 'edited' ? '수정한 글이 현재 브라우저에 저장되었습니다.' : '새 글이 현재 브라우저에 저장되었습니다.');
    params.delete('saved');
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }
  root.setAttribute('aria-busy', 'false');
  window.addEventListener('pagehide', (event) => { if (!event.persisted) lifecycle.abort(); }, { once: true });
  return () => lifecycle.abort();
}
