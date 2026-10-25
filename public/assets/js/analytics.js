/**
 * analytics.js - eventos de conversao para window.dataLayer.
 * REGRA LGPD: nada e enviado nem carregado antes do consentimento de "analise".
 * Eventos: cta_click, whatsapp_click, form_start, form_submit, generate_lead,
 * scroll_75, faq_open, gallery_open.
 */
import { SITE, ANALYTICS_ATIVO } from './site.config.js';
import { getConsent, onConsentChange } from './consent.js';

window.dataLayer = window.dataLayer || [];
let enabled = false;
let scrollSent = false;
let gtagLoaded = false;

export function track(name, params = {}) {
  if (!enabled) return;
  window.dataLayer.push({ event: name, ...params });
}

/** UTM: lidos da URL; so persistidos (sessionStorage) se houver consentimento de analise. */
export function getUtm() {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const params = new URLSearchParams(location.search);
  const out = {};
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('utm') || '{}'); } catch (_) { stored = {}; }
  keys.forEach((k) => { const v = params.get(k) || stored[k]; if (v) out[k] = v.slice(0, 200); });
  if (enabled && Object.keys(out).length) {
    try { sessionStorage.setItem('utm', JSON.stringify(out)); } catch (_) { /* ignora */ }
  }
  return out;
}

function loadGtag() {
  if (gtagLoaded || !ANALYTICS_ATIVO) return; // ID fake (G-XXXXXXXXXX): nao carrega script externo
  gtagLoaded = true;
  // Dependencia externa justificada: GA4 (plano, secao 9), carregado so apos consentimento.
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(SITE.ID_ANALYTICS)}`;
  document.head.appendChild(s);
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', SITE.ID_ANALYTICS, { anonymize_ip: true });
}

function expireGaCookies() {
  document.cookie.split('; ').forEach((c) => {
    const name = c.split('=')[0];
    if (name === '_ga' || name.startsWith('_ga_')) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
}

function onClick(e) {
  const el = e.target.closest('a, button');
  if (!el) return;
  const section = el.dataset.section || (el.closest('section[id]') || {}).id || 'pagina';
  if (el.dataset.cta) track('cta_click', { cta_name: el.dataset.cta, location: section });
  if (el.hasAttribute('data-whatsapp') || (el.href && el.href.startsWith('https://wa.me/'))) {
    track('whatsapp_click', { location: section });
  }
}

function onScroll() {
  if (scrollSent) return;
  const doc = document.documentElement;
  const total = doc.scrollHeight - window.innerHeight;
  if (total > 0 && window.scrollY / total >= 0.75) {
    scrollSent = true;
    track('scroll_75', { page_path: location.pathname });
  }
}

function setEnabled(on) {
  if (on === enabled) return;
  enabled = on;
  if (on) {
    window[`ga-disable-${SITE.ID_ANALYTICS}`] = false;
    loadGtag();
  } else {
    window[`ga-disable-${SITE.ID_ANALYTICS}`] = true;
    expireGaCookies();
  }
}

export function initAnalytics() {
  document.addEventListener('click', onClick);
  window.addEventListener('scroll', onScroll, { passive: true });
  const current = getConsent();
  setEnabled(Boolean(current && current.analytics));
  onConsentChange((c) => setEnabled(Boolean(c.analytics)));
}
