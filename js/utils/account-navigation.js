export function getSafeAccountReturn(value, currentHref = location.href) {
  const current = new URL(currentHref);
  const root = new URL('../', current).pathname;
  const fallback = `${root}index.html`;
  if (!value) return fallback;
  try {
    const target = new URL(value, current);
    const relative = target.pathname.startsWith(root) ? target.pathname.slice(root.length) : '';
    const allowed = relative === '' || relative === 'index.html'
      || /^pages\/(?:notice(?:-view|-write|-edit)?|velo(?:-cart)?|contact(?:-view|-write)?)\.html$/.test(relative);
    return target.origin === current.origin && target.pathname.startsWith(root) && allowed
      ? `${target.pathname}${target.search}${target.hash}` : fallback;
  } catch {
    return fallback;
  }
}
