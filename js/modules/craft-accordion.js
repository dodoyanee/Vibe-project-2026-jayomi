export function initCraftAccordion() {
  const list = document.querySelector('[data-js="craft-accordion"]');
  if (!list || list.dataset.enhanced) return;
  // Descriptions stay readable without JavaScript; enhance to the reference's all-closed state.
  list.querySelectorAll('[data-js="craft-item"]').forEach((item) => {
    const trigger = item.querySelector('[data-js="craft-trigger"]');
    const panel = item.querySelector('[data-js="craft-panel"]');
    if (!trigger || !panel) return;
    const setOpen = (open) => {
      trigger.setAttribute('aria-expanded', String(open));
      item.dataset.open = String(open);
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
    };
    setOpen(false);
    trigger.addEventListener('click', () => setOpen(trigger.getAttribute('aria-expanded') !== 'true'));
  });
  list.dataset.enhanced = 'true';
}
