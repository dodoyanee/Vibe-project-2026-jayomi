import { initSiteNavigation } from './modules/site-navigation.js';
import { getSafeAccountReturn } from './utils/account-navigation.js';

initSiteNavigation();

const form = document.querySelector('[data-js="login-form"], [data-js="register-form"]');
const status = form.querySelector('[data-js="auth-message"]');
const submit = form.querySelector('[type="submit"]');
const isSignup = form.dataset.js === 'register-form';
const params = new URLSearchParams(location.search);
const safeReturn = getSafeAccountReturn(params.get('return'));
const authModule = import('./modules/notice-auth.js');
const consents = [...form.querySelectorAll('[data-js="consent"]')];
const allConsent = form.querySelector('[data-js="consent-all"]');

function showMessage(message, isError = true) {
  status.textContent = message;
  status.hidden = !message;
  status.dataset.state = isError ? 'error' : 'success';
}

function setBusy(busy) {
  form.setAttribute('aria-busy', String(busy));
  submit.disabled = busy;
  form.querySelectorAll('input').forEach((input) => { input.disabled = busy; });
}

authModule.then((api) => api.setupNoticeAuthControls()).catch(() => {
  showMessage('로그인 서비스를 불러오지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.');
});

document.querySelectorAll('[data-js="account-switch"]').forEach((link) => {
  if (params.has('return')) {
    const url = new URL(link.href);
    url.searchParams.set('return', safeReturn);
    link.href = url.href;
  }
});

form.querySelectorAll('[data-js="password-toggle"]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(visible));
    button.setAttribute('aria-label', `${input.name === 'confirmPassword' ? '비밀번호 확인' : '비밀번호'} ${visible ? '숨기기' : '표시'}`);
  });
});

allConsent?.addEventListener('change', () => {
  consents.forEach((input) => { input.checked = allConsent.checked; });
});
consents.forEach((input) => input.addEventListener('change', () => {
  const checkedCount = consents.filter((consent) => consent.checked).length;
  allConsent.checked = checkedCount === consents.length;
  allConsent.indeterminate = checkedCount > 0 && checkedCount < consents.length;
}));

form.addEventListener('input', () => {
  if (isSignup) form.elements.confirmPassword.setCustomValidity('');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  const values = new FormData(form);
  if (isSignup && values.get('password') !== values.get('confirmPassword')) {
    form.elements.confirmPassword.setCustomValidity('비밀번호가 일치하지 않습니다.');
  }
  if (!form.reportValidity()) return;
  showMessage('');
  setBusy(true);
  try {
    const api = await authModule;
    if (isSignup) {
      await api.registerNoticeUser({
        name: values.get('name'), email: values.get('email'), password: values.get('password'),
        agreements: { terms: values.has('terms'), privacy: values.has('privacy'), marketing: values.has('marketing') },
      });
    } else {
      await api.loginNoticeUser(values.get('email'), values.get('password'), values.has('remember'));
    }
    location.assign(safeReturn);
  } catch (error) {
    const api = await authModule.catch(() => null);
    showMessage(api ? api.getAuthErrorMessage(error) : '로그인 서비스에 연결하지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.');
    setBusy(false);
  }
});

const resetButton = form.querySelector('[data-js="password-reset"]');
resetButton?.addEventListener('click', async () => {
  const email = form.elements.email;
  if (!email.reportValidity()) return;
  resetButton.disabled = true;
  try {
    const api = await authModule;
    await api.resetNoticePassword(email.value);
    showMessage('해당 이메일로 가입된 계정이 있다면 비밀번호 재설정 메일이 발송됩니다. 받은 편지함을 확인해 주세요.', false);
  } catch (error) {
    const api = await authModule.catch(() => null);
    showMessage(api ? api.getAuthErrorMessage(error) : '로그인 서비스에 연결하지 못했습니다. 새로고침해 주세요.');
  } finally {
    resetButton.disabled = false;
  }
});

const policyDialog = document.querySelector('[data-js="policy-dialog"]');
const policyTitle = policyDialog.querySelector('[data-js="policy-title"]');
const policyBody = policyDialog.querySelector('[data-js="policy-body"]');
let policyTrigger = null;
document.querySelectorAll('[data-js="policy-open"]').forEach((button) => {
  button.addEventListener('click', () => {
    policyTrigger = button;
    const title = button.dataset.policy === 'privacy' ? '개인정보처리방침' : '서비스 이용약관';
    policyTitle.textContent = title;
    policyBody.textContent = `${title} 문서가 아직 등록되지 않았습니다. 자세한 안내는 아래 이메일로 문의해 주세요.`;
    policyDialog.showModal();
  });
});
policyDialog.querySelector('[data-js="policy-close"]').addEventListener('click', () => policyDialog.close());
policyDialog.addEventListener('close', () => policyTrigger?.focus());
