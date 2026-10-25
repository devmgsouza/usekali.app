/** gallery.js - filtro por modulo e lightbox acessivel (dialog nativo: Esc fecha, foco preso). */
import { track } from './analytics.js';

export function initGallery() {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;
  const items = Array.from(root.querySelectorAll('[data-module]'));
  const filterBar = document.querySelector('[data-gallery-filters]');
  const dialog = document.getElementById('lightbox');
  const media = dialog.querySelector('[data-lightbox-media]');
  const caption = dialog.querySelector('[data-lightbox-caption]');
  let visible = items;
  let index = 0;
  let opener = null;

  if (filterBar) {
    filterBar.hidden = false;
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      filterBar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const f = btn.dataset.filter;
      items.forEach((li) => { li.hidden = f !== 'todos' && li.dataset.module !== f; });
      visible = items.filter((li) => !li.hidden);
      const live = document.getElementById('gallery-count');
      if (live) live.textContent = `${visible.length} telas exibidas.`;
    });
  }

  function show(i) {
    index = (i + visible.length) % visible.length;
    const li = visible[index];
    media.replaceChildren(li.querySelector('.shot__frame').cloneNode(true));
    caption.textContent = li.dataset.caption;
    track('gallery_open', { item_id: li.dataset.id });
  }

  root.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-module]');
    if (!li || !(e.target.closest('.gallery__open') || e.target.closest('.shot__frame'))) return;
    opener = li.querySelector('.gallery__open');
    visible = items.filter((l) => !l.hidden);
    index = visible.indexOf(li);
    show(index);
    dialog.showModal();
  });
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
}
