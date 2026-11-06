import { initSiteNavigation } from './modules/site-navigation.js';
import {
  getAuthErrorMessage, loginNoticeUser, registerNoticeUser,
} from './modules/notice-auth.js';

initSiteNavigation();

const params = new URLSearchParams(location.search);
const requestedReturn = params.get('return') || 'notice.html';
function getSafeReturn(value) {
  try {
    const url = new URL(value, location.href);
    const projectRoot = new URL('../', location.href).pathname;
    const relativePath = url.pathname.startsWith(projectRoot) ? url.pathname.slice(projectRoot.length) : '';
    const allowedPath = relativePath === 'index.html'
      || /^pages\/(?:notice(?:-view|-write|-edit)?|velo(?:-cart)?)\.html$/.test(relativePath);
    return url.origin === location.origin && allowedPath
      ? `${url.pathname}${url.search}${url.hash}`
      : 'notice.html';
  } catch {
    return 'notice.html';
  }
}
const safeReturn = getSafeReturn(requestedReturn);

function showFormMessage(form, message, isError = true) {
  const status = form.querySelector('[data-js="auth-message"]');
  status.hidden = !message;
  status.dataset.state = isError ? 'error' : 'success';
  status.textContent = message;
}

function setBusy(form, busy) {
  form.querySelectorAll('button[type="submit"]').forEach((button) => { button.disabled = busy; });
  form.setAttribute('aria-busy', String(busy));
}

const loginForm = document.querySelector('[data-js="login-form"]');
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  setBusy(loginForm, true);
  showFormMessage(loginForm, '');
  try {
    await loginNoticeUser(
      loginForm.elements.email.value,
      loginForm.elements.password.value,
    );
    location.assign(safeReturn);
  } catch (error) {
    showFormMessage(loginForm, getAuthErrorMessage(error));
    setBusy(loginForm, false);
  }
});

const registerForm = document.querySelector('[data-js="register-form"]');
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!registerForm.reportValidity()) return;
  setBusy(registerForm, true);
  showFormMessage(registerForm, '');
  try {
    await registerNoticeUser({
      name: registerForm.elements.name.value,
      username: registerForm.elements.username.value,
      email: registerForm.elements.email.value,
      password: registerForm.elements.password.value,
    });
    location.assign(safeReturn);
  } catch (error) {
    showFormMessage(registerForm, getAuthErrorMessage(error));
    setBusy(registerForm, false);
  }
});
