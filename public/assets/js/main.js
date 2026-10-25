/** main.js - ponto de entrada: menu mobile, abas, FAQ e inicializacao dos demais modulos. */
import { initConsent } from './consent.js';
import { initAnalytics, track } from './analytics.js';
import { initForm } from './form.js';
import { initGallery } from './gallery.js';

document.documentElement.classList.add('js');

/* ---------- Menu mobile ---------- */
function initMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  const desktop = window.matchMedia('(min-width: 960px)');

  const setOpen = (open, returnFocus) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) { const first = nav.querySelector('a'); if (first) first.focus(); }
    else if (returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  desktop.addEventListener('change', () => setOpen(false));
}

/* ---------- Abas (secao "Telas do sistema") ---------- */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const list = root.querySelector('[data-tabs-list]');
    const tabs = Array.from(list.querySelectorAll('button'));
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    list.hidden = false;
    list.setAttribute('role', 'tablist');
    const select = (i, focus) => {
      tabs.forEach((t, n) => {
        const on = n === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[n].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.setAttribute('role', 'tab');
      panels[i].setAttribute('role', 'tabpanel');
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        if (k === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
        else if (k === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
        else if (k === 'Home') { e.preventDefault(); select(0, true); }
        else if (k === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    select(0);
  });
}

/* ---------- Acordeao (FAQ) ---------- */
function initAccordion() {
  document.querySelectorAll('[data-accordion]').forEach((root) => {
    root.querySelectorAll('.accordion__trigger').forEach((btn) => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const set = (open) => { btn.setAttribute('aria-expanded', String(open)); panel.hidden = !open; };
      set(false);
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        set(open);
        if (open) track('faq_open', { question: btn.textContent.trim().slice(0, 100) });
      });
      const closeOnEsc = (e) => {
        if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
      };
      btn.addEventListener('keydown', closeOnEsc);
      panel.addEventListener('keydown', closeOnEsc);
    });
  });
}

initConsent();
initAnalytics();
initMenu();
initTabs();
initAccordion();
initForm();
initGallery();
