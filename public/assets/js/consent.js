/**
 * consent.js - banner de cookies e registro do consentimento (LGPD, Anexo A).
 * - Antes de qualquer escolha, so existe o cookie essencial `cookie_consent` (criado apos a escolha).
 * - Analise e marketing ficam DESLIGADOS por padrao.
 * - Recusar e tao facil quanto aceitar (tres botoes no mesmo nivel).
 * - O registro guarda versao da politica, data/hora e escolhas.
 */
import { SITE } from './site.config.js';

const listeners = new Set();

export function getConsent() {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${SITE.CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const data = JSON.parse(decodeURIComponent(match.slice(SITE.CONSENT_COOKIE.length + 1)));
    if (data && data.versao === SITE.POLITICA_VERSAO) return data;
  } catch (_) { /* cookie invalido: trata como sem escolha */ }
  return null;
}

export function onConsentChange(fn) {
  listeners.add(fn);
}

function saveConsent({ analytics, marketing }) {
  const data = {
    versao: SITE.POLITICA_VERSAO,
    data: new Date().toISOString(),
    essenciais: true,
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
  };
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SITE.CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(data))}; Max-Age=${SITE.CONSENT_DIAS * 86400}; Path=/; SameSite=Lax${secure}`;
  listeners.forEach((fn) => fn(data));
  return data;
}

export function initConsent() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  const prefs = banner.querySelector('[data-consent-prefs]');
  const btnAccept = banner.querySelector('[data-consent="accept"]');
  const btnReject = banner.querySelector('[data-consent="reject"]');
  const btnConfigure = banner.querySelector('[data-consent="configure"]');
  const btnSave = banner.querySelector('[data-consent="save"]');
  const chkAnalytics = banner.querySelector('[name="consent-analytics"]');
  const chkMarketing = banner.querySelector('[name="consent-marketing"]');
  const title = banner.querySelector('[data-consent-title]');

  const close = () => { banner.hidden = true; };
  const open = (focus) => {
    const current = getConsent();
    chkAnalytics.checked = Boolean(current && current.analytics);
    chkMarketing.checked = Boolean(current && current.marketing);
    banner.hidden = false;
    if (focus) title.focus();
  };

  btnAccept.addEventListener('click', () => { saveConsent({ analytics: true, marketing: true }); close(); });
  btnReject.addEventListener('click', () => { saveConsent({ analytics: false, marketing: false }); close(); });
  btnConfigure.addEventListener('click', () => {
    prefs.hidden = !prefs.hidden;
    btnConfigure.setAttribute('aria-expanded', String(!prefs.hidden));
    btnSave.hidden = prefs.hidden;
    if (!prefs.hidden) chkAnalytics.focus();
  });
  btnSave.addEventListener('click', () => {
    saveConsent({ analytics: chkAnalytics.checked, marketing: chkMarketing.checked });
    close();
  });
  banner.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && getConsent()) close(); // so fecha com Esc quando ja existe escolha registrada
  });
  document.querySelectorAll('[data-consent-open]').forEach((el) =>
    el.addEventListener('click', () => open(true)));

  if (!getConsent()) open(false);
}
