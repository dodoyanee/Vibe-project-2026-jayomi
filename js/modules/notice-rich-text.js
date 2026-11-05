const ALLOWED = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A']);

export function getSafeLink(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function cleanNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
  if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
  if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH'].includes(node.tagName)) return document.createDocumentFragment();
  const safe = ALLOWED.has(node.tagName) ? document.createElement(node.tagName.toLowerCase()) : document.createDocumentFragment();
  if (node.tagName === 'A' && safe instanceof Element) {
    const href = getSafeLink(node.getAttribute('href'));
    if (href) { safe.setAttribute('href', href); safe.setAttribute('rel', 'noopener noreferrer'); }
  }
  node.childNodes.forEach((child) => safe.append(cleanNode(child)));
  return safe;
}

export function getSafeContent(post) {
  const fragment = document.createDocumentFragment();
  if (post.richContent) {
    const parsed = new DOMParser().parseFromString(post.richContent, 'text/html');
    parsed.body.childNodes.forEach((node) => fragment.append(cleanNode(node)));
    return fragment;
  }
  post.content.split('\n\n').forEach((text) => {
    const paragraph = document.createElement('p');
    text.split('\n').forEach((line, index) => {
      if (index) paragraph.append(document.createElement('br'));
      paragraph.append(document.createTextNode(line));
    });
    fragment.append(paragraph);
  });
  return fragment;
}

export function insertText(editor, text) {
  const selection = window.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (!range || !editor.contains(range.commonAncestorContainer)) return;
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}

export function formatSelection(editor, format) {
  const selection = window.getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return false;
  const tag = { bold: 'strong', italic: 'em', underline: 'u', list: 'ul' }[format];
  if (!tag) return false;
  const element = document.createElement(tag);
  const content = range.extractContents();
  if (format === 'list') {
    const item = document.createElement('li');
    item.append(content);
    element.append(item);
  } else { element.append(content); }
  range.insertNode(element);
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}
