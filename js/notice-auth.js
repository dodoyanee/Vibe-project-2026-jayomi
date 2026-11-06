const destination = location.hash === '#register' ? 'signup.html' : 'login.html';
const url = new URL(destination, location.href);
const requestedReturn = new URLSearchParams(location.search).get('return');
if (requestedReturn) url.searchParams.set('return', requestedReturn);
location.replace(url.href);
