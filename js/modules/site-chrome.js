const headerTemplate = new URL('../../components/site-header.html', import.meta.url);
const footerTemplate = new URL('../../components/site-footer.html', import.meta.url);

async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`공통 페이지 모듈을 불러오지 못했습니다: ${response.status}`);
  return response.text();
}

function configureLinks(header) {
  const isHome = !location.pathname.includes('/pages/');
  const root = isHome ? './' : '../';
  const home = isHome ? '' : `${root}index.html`;
  const links = {
    home: isHome ? '#home' : `${home}#home`,
    works: isHome ? '#works' : `${home}#works`,
    lab: isHome ? '#lab-x' : `${home}#lab-x`,
    contact: `${root}pages/contact.html`,
    velo: `${root}pages/velo.html`,
    notice: `${root}pages/notice.html`,
  };
  header.querySelectorAll('[data-site-link]').forEach((link) => {
    link.href = links[link.dataset.siteLink];
  });
  const page = location.pathname.split('/').pop();
  const activeKey = page === 'index.html' || page === '' ? 'home'
    : /^notice(?:-view|-write|-edit)?\.html$/.test(page) ? 'notice'
      : /^contact(?:-view|-write)?\.html$/.test(page) ? 'contact'
      : /^velo(?:-cart)?\.html$/.test(page) ? 'velo' : '';
  if (activeKey) {
    header.querySelectorAll(`[data-nav-key="${activeKey}"]`).forEach((link) => {
      link.setAttribute('aria-current', 'page');
    });
  }
}

export async function initSiteChrome() {
  const headerMount = document.querySelector('[data-js="site-header-mount"]');
  const footerMount = document.querySelector('[data-js="site-footer-mount"]');
  if (!headerMount || !footerMount) {
    throw new Error('페이지에 공통 헤더와 푸터 마운트가 없습니다.');
  }

  try {
    const [headerMarkup, footerMarkup] = await Promise.all([
      loadTemplate(headerTemplate),
      loadTemplate(footerTemplate),
    ]);
    headerMount.innerHTML = headerMarkup;
    footerMount.innerHTML = footerMarkup;
    configureLinks(headerMount);
  } catch (error) {
    [headerMount, footerMount].forEach((mount) => {
      const message = document.createElement('p');
      message.setAttribute('role', 'alert');
      message.textContent = '공통 페이지 메뉴를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
      mount.replaceChildren(message);
    });
    throw error;
  }
}
