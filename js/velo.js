import { initSiteNavigation } from './modules/site-navigation.js';
import { products } from './data/velo-products.js';
import { initSiteChrome } from './modules/site-chrome.js';

await initSiteChrome();
initSiteNavigation();
import('./modules/notice-auth.js')
  .then(({ setupNoticeAuthControls }) => setupNoticeAuthControls(() => {}))
  .catch(() => {
    document.querySelectorAll('[data-js="auth-error"]').forEach((status) => {
      status.hidden = false;
      status.textContent = '로그인 기능을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
    });
  });
const CART_KEY = 'draftx.velo.cart.v1';
const WISH_KEY = 'draftx.velo.wishlist.v1';
const byId = new Map(products.map(product => [product.id, product]));
const money = value => `${value.toLocaleString('ko-KR')}원`;
const icon = name => `<svg class="notice-icon" aria-hidden="true"><use href="#${name}"></use></svg>`;
const arrow = icon('notice-arrow');
const find = selector => document.querySelector(selector);
const quantity = value => Math.min(99, Math.max(1, Math.trunc(Number(value)) || 1));
const itemKey = item => `${item.id}:${item.option}`;
function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    const merged = new Map();
    for (const entry of value) {
      const product = byId.get(entry?.id);
      if (!product || !product.options.includes(entry.option)) continue;
      const key = itemKey(entry);
      const count = quantity(entry.quantity);
      merged.set(key, { id: product.id, option: entry.option, quantity: quantity((merged.get(key)?.quantity || 0) + count) });
    }
    return [...merged.values()];
  } catch { return []; }
}
let cart = readCart();
function writeCart(next) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    cart = next;
    updateCount();
    return true;
  } catch {
    const message = '장바구니를 저장할 수 없습니다. 브라우저의 저장 공간 설정을 확인해 주세요.';
    const error = find('[data-storage-error]') || find('[data-cart-error]');
    if (error) { error.hidden = false; error.textContent = message; }
    return false;
  }
}
function updateCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-bag-count]').forEach(el => { el.textContent = String(count); });
}
updateCount();

const options = find('#velo-options');
const confirmation = find('#velo-confirm');
let currentProduct = null;
let currentOption = '';
let returnFocus = null;
function dismissOptions() { options?.close(); returnFocus?.focus(); }
function dismissConfirmation() { confirmation?.close(); dismissOptions(); }
function backdropClose(dialog, close) {
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  });
}
backdropClose(options, dismissOptions);
backdropClose(confirmation, dismissConfirmation);
find('[data-close-options]')?.addEventListener('click', dismissOptions);
document.querySelectorAll('[data-close-confirm]').forEach(button => button.addEventListener('click', dismissConfirmation));
function renderOption() {
  const qty = quantity(find('#velo-quantity').value);
  find('#velo-quantity').value = String(qty);
  find('[data-selected]').hidden = !currentOption;
  find('[data-option-placeholder]').hidden = Boolean(currentOption);
  find('[data-option-item-count]').textContent = `TOTAL / ${currentOption ? qty : 0} ITEM${qty > 1 && currentOption ? 'S' : ''}`;
  find('[data-option-total]').textContent = money(currentOption ? currentProduct.price * qty : 0);
  find('[data-selected-name]').textContent = `${currentOption} / 기본 구성`;
  find('[data-selected-subtitle]').textContent = currentProduct.subtitle;
  find('[data-add]').disabled = !currentOption;
  find('[data-buy]').disabled = !currentOption;
  find('[data-minus]').disabled = qty <= 1;
  find('[data-plus]').disabled = qty >= 99;
  options.querySelectorAll('[data-color]').forEach(button => {
    const selected = button.dataset.color === currentOption;
    button.setAttribute('aria-pressed', String(selected));
    button.innerHTML = `${selected ? icon('velo-check') : ''}<span>${button.dataset.color}</span>`;
  });
}
function openOptions(id, trigger) {
  currentProduct = byId.get(id);
  if (!currentProduct || !options) return;
  returnFocus = trigger;
  currentOption = '';
  find('#velo-quantity').value = '1';
  const image = find('[data-option-image]');
  image.src = `../curr-task/010/${currentProduct.image}`;
  image.alt = currentProduct.subtitle;
  find('[data-option-name]').textContent = `VELO / ${currentProduct.name}`;
  find('[data-option-subtitle]').textContent = currentProduct.subtitle;
  find('[data-option-price]').textContent = money(currentProduct.price);
  find('[data-option-choices]').innerHTML = currentProduct.options.map(color => `<button class="notice-button" type="button" data-color="${color}" aria-pressed="false">${color}</button>`).join('');
  find('[data-storage-error]').hidden = true;
  renderOption();
  options.showModal();
  options.scrollTop = 0;
}
options?.addEventListener('click', event => {
  const color = event.target.closest('[data-color]');
  if (color) { currentOption = color.dataset.color; renderOption(); }
  if (event.target.closest('[data-minus]')) { find('#velo-quantity').value = quantity(Number(find('#velo-quantity').value) - 1); renderOption(); }
  if (event.target.closest('[data-plus]')) { find('#velo-quantity').value = quantity(Number(find('#velo-quantity').value) + 1); renderOption(); }
});
find('#velo-quantity')?.addEventListener('change', renderOption);
function addItem(goToBag = false) {
  if (!currentProduct || !currentOption) return;
  const qty = quantity(find('#velo-quantity').value);
  const next = readCart();
  const existing = next.find(entry => entry.id === currentProduct.id && entry.option === currentOption);
  if (existing && existing.quantity + qty > 99) {
    const error = find('[data-storage-error]');
    error.hidden = false;
    error.textContent = '같은 옵션은 최대 99개까지 담을 수 있습니다. 장바구니 수량을 확인해 주세요.';
    return;
  }
  if (existing) existing.quantity += qty;
  else next.push({ id: currentProduct.id, option: currentOption, quantity: qty });
  if (!writeCart(next)) return;
  if (goToBag) { window.location.href = 'velo-cart.html'; return; }
  const image = find('[data-confirm-image]');
  image.src = `../curr-task/010/${currentProduct.image}`;
  image.alt = currentProduct.subtitle;
  find('[data-confirm-name]').textContent = `VELO / ${currentProduct.name}`;
  find('[data-confirm-option]').textContent = `${currentOption} / 기본 구성`;
  find('[data-confirm-quantity]').textContent = `수량 ${qty}개`;
  find('[data-confirm-total]').textContent = money(currentProduct.price * qty);
  find('[data-confirm-count]').textContent = `${String(qty).padStart(2, '0')} ITEM${qty > 1 ? 'S' : ''} / YOUR SHOPPING BAG`;
  confirmation.showModal();
}
find('[data-add]')?.addEventListener('click', () => addItem());
find('[data-buy]')?.addEventListener('click', () => addItem(true));
document.querySelectorAll('[data-open]').forEach(trigger => trigger.addEventListener('click', event => { event.preventDefault(); openOptions(trigger.dataset.open, trigger); }));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  document.querySelectorAll('.velo-card').forEach(card => { card.hidden = button.dataset.filter !== '전체 컬렉션' && card.dataset.category !== button.dataset.filter; });
}));
let wishes = new Set();
try { const saved = JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); if (Array.isArray(saved)) wishes = new Set(saved.filter(id => byId.has(id))); } catch { /* Empty wishlist remains usable. */ }
document.querySelectorAll('[data-wish]').forEach(button => {
  button.setAttribute('aria-pressed', String(wishes.has(button.dataset.wish)));
  button.addEventListener('click', () => {
    const id = button.dataset.wish;
    wishes.has(id) ? wishes.delete(id) : wishes.add(id);
    button.setAttribute('aria-pressed', String(wishes.has(id)));
    try { localStorage.setItem(WISH_KEY, JSON.stringify([...wishes])); } catch { /* The current-page wishlist still works. */ }
  });
});

const cartRoot = find('[data-cart-root]');
let selectedKeys = new Set(cart.map(itemKey));
const checkout = find('#checkout-info');
backdropClose(checkout, () => checkout.close());
document.querySelectorAll('[data-close-checkout]').forEach(button => button.addEventListener('click', () => checkout.close()));
function selectedItems() { return cart.filter(item => selectedKeys.has(itemKey(item))); }
function selectedTotal() { return selectedItems().reduce((sum, item) => sum + byId.get(item.id).price * item.quantity, 0); }
function renderCart() {
  if (!cartRoot) return;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  find('[data-heading-count]').textContent = `[${String(count).padStart(2, '0')}]`;
  if (!cart.length) {
    cartRoot.innerHTML = `<div class="velo-cart-empty">${icon('velo-bag')}<h2>당신의 첫 번째 여정을 기다립니다.</h2><p class="velo-muted">장바구니가 비어 있습니다. 나에게 맞는 VELO를 만나보세요.</p><a class="notice-button" href="velo.html">컬렉션 둘러보기${arrow}</a></div>`;
    return;
  }
  const total = selectedTotal();
  const rows = cart.map((item, index) => {
    const p = byId.get(item.id);
    return `<article class="velo-cart-item" data-cart-index="${index}"><input type="checkbox" data-select="${index}" aria-label="${p.name} ${item.option} 선택" ${selectedKeys.has(itemKey(item)) ? 'checked' : ''}><img src="../curr-task/010/${p.image}" alt="${p.subtitle}" width="172" height="224"><div><h2>VELO / ${p.name}</h2><p>${p.subtitle}</p><p class="velo-muted">${item.option} / 기본 구성</p><div class="velo-quantity"><button type="button" class="notice-button" data-cart-minus="${index}" aria-label="${p.name} 수량 줄이기" ${item.quantity <= 1 ? 'disabled' : ''}>${icon('velo-minus')}</button><label class="visually-hidden" for="cart-qty-${index}">${p.name} 수량</label><input id="cart-qty-${index}" type="number" min="1" max="99" step="1" inputmode="numeric" value="${item.quantity}" data-cart-quantity="${index}"><button type="button" class="notice-button" data-cart-plus="${index}" aria-label="${p.name} 수량 늘리기" ${item.quantity >= 99 ? 'disabled' : ''}>${icon('notice-plus')}</button><button type="button" class="notice-button velo-change" data-cart-change="${index}">변경</button></div></div><div class="velo-cart-item__end"><button class="velo-close" type="button" data-remove="${index}" aria-label="${p.name} ${item.option} 삭제">${icon('notice-close')}</button><div><strong>${money(p.price * item.quantity)}</strong><p class="velo-muted">무료 배송</p></div></div></article>`;
  }).join('');
  cartRoot.innerHTML = `<p class="velo-storage-error" role="alert" data-cart-error hidden></p><div class="velo-cart-layout"><div><div class="velo-cart-heading"><label><input type="checkbox" data-select-all ${selectedKeys.size === cart.length ? 'checked' : ''}>전체 선택 (${selectedKeys.size}/${cart.length})</label><span>${String(count).padStart(2, '0')} ITEM${count > 1 ? 'S' : ''}</span></div>${rows}<div class="velo-cart-delivery"><span>기본 배송</span><div><span class="velo-muted">상품 구매금액 ${money(total)} + 배송비 0원</span><strong>${money(total)}</strong></div></div><div class="velo-cart-tools"><button class="notice-button" type="button" data-print>견적서 출력${arrow}</button><button class="notice-button" type="button" data-select-every>전체 선택</button><button class="notice-button" type="button" data-delete-selected ${!selectedKeys.size ? 'disabled' : ''}>선택 삭제</button></div></div><aside class="velo-cart-summary" aria-label="주문 요약"><h2>ORDER SUMMARY</h2><dl><div><dt>총 상품금액</dt><dd>${money(total)}</dd></div><div><dt>배송비</dt><dd>0원</dd></div><div class="velo-cart-grand"><dt>결제 예정 금액</dt><dd>${money(total)}</dd></div></dl><p class="velo-muted">선택 상품 ${selectedItems().reduce((sum,item) => sum + item.quantity, 0)}개 · KRW</p><div class="velo-cart-checkout"><button class="notice-button" type="button" data-checkout ${!selectedKeys.size ? 'disabled' : ''}>주문하기${arrow}</button></div><div class="velo-cart-note"><p class="velo-muted">PRECISION IN EVERY DETAIL.</p><p class="velo-muted">당신의 소중한 일상을 위한,<br>세심하게 큐레이션한 선택.</p></div></aside></div><div class="velo-cart-continue"><p>계속 이어지는 아름다운 여정.</p><a class="notice-button" href="velo.html">컬렉션 둘러보기${arrow}</a></div>`;
  const selectAll = find('[data-select-all]');
  selectAll.indeterminate = selectedKeys.size > 0 && selectedKeys.size < cart.length;
}
function changeQuantity(index, value, focusSelector) {
  const next = cart.map((item, i) => i === index ? { ...item, quantity: quantity(value) } : item);
  if (!writeCart(next)) return;
  renderCart();
  if (focusSelector) cartRoot.querySelector(focusSelector)?.focus({ preventScroll: true });
}
cartRoot?.addEventListener('change', event => {
  if (event.target.matches('[data-select-all]')) selectedKeys = new Set(event.target.checked ? cart.map(itemKey) : []);
  else if (event.target.matches('[data-select]')) {
    const key = itemKey(cart[Number(event.target.dataset.select)]);
    event.target.checked ? selectedKeys.add(key) : selectedKeys.delete(key);
  } else if (event.target.matches('[data-cart-quantity]')) {
    const index = Number(event.target.dataset.cartQuantity);
    changeQuantity(index, event.target.value, `[data-cart-quantity="${index}"]`);
    return;
  } else return;
  const selector = event.target.matches('[data-select-all]') ? '[data-select-all]' : `[data-select="${event.target.dataset.select}"]`;
  renderCart(); cartRoot.querySelector(selector)?.focus({ preventScroll: true });
});
cartRoot?.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  for (const [attribute, delta] of [['data-cart-minus', -1], ['data-cart-plus', 1]]) {
    if (button.hasAttribute(attribute)) {
      const index = Number(button.getAttribute(attribute));
      changeQuantity(index, cart[index].quantity + delta, `[${attribute}="${index}"]`); return;
    }
  }
  if (button.hasAttribute('data-cart-change')) {
    const index = Number(button.dataset.cartChange);
    changeQuantity(index, find(`#cart-qty-${index}`).value, `[data-cart-change="${index}"]`); return;
  }
  if (button.hasAttribute('data-remove')) {
    const index = Number(button.dataset.remove);
    if (writeCart(cart.filter((_, i) => i !== index))) { selectedKeys = new Set([...selectedKeys].filter(key => cart.some(item => itemKey(item) === key))); renderCart(); }
  }
  if (button.hasAttribute('data-select-every')) { selectedKeys = new Set(cart.map(itemKey)); renderCart(); }
  if (button.hasAttribute('data-delete-selected')) { if (writeCart(cart.filter(item => !selectedKeys.has(itemKey(item))))) { selectedKeys.clear(); renderCart(); } }
  if (button.hasAttribute('data-print')) window.print();
  if (button.hasAttribute('data-checkout') && selectedItems().length) checkout.showModal();
});
window.addEventListener('storage', event => {
  if (event.key !== CART_KEY && event.key !== null) return;
  cart = readCart(); selectedKeys = new Set(cart.map(itemKey)); updateCount(); renderCart();
});
renderCart();
