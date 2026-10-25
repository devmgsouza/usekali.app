/**
 * form.js - validacao e envio do formulario de demonstracao.
 * Mensagens em portugues, erros acessiveis (aria-invalid, aria-describedby, aria-live).
 */
import { SITE, WHATSAPP_URL } from './site.config.js';
import { track, getUtm } from './analytics.js';

// ===== CONFIGURACAO DE ENVIO =====
// Endpoint dos leads. Valor ficticio (placeholder). Vazio = abre o WhatsApp com mensagem pre-preenchida.
const FORM_ENDPOINT = SITE.DESTINO_LEADS_ENDPOINT;
// false = apenas simula o envio (nao ha rede). Ver SITE.ENVIO_REAL em site.config.js.
const ENVIO_REAL = SITE.ENVIO_REAL;
const OBRIGADO_URL = '/obrigado/';

const MSG = {
  nome: 'Informe o seu nome.',
  whatsapp: 'Informe um WhatsApp com DDD, por exemplo (11) 90000-0000.',
  email: 'Informe um e-mail válido, por exemplo nome@empresa.com.br.',
  empresa: 'Informe o nome da empresa.',
  ramo: 'Escolha o ramo de atividade.',
  consentimento: 'Para enviar, marque a caixa de concordância com o uso dos seus dados.',
};

function maskPhone(value) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validateField(input) {
  const v = input.value.trim();
  const name = input.name;
  if (name === 'consentimento') return input.checked ? '' : MSG.consentimento;
  if (name === 'nome') return v.length >= 2 ? '' : MSG.nome;
  if (name === 'whatsapp') { const n = v.replace(/\D/g, ''); return n.length === 10 || n.length === 11 ? '' : MSG.whatsapp; }
  if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : MSG.email;
  if (name === 'empresa') return v.length >= 2 ? '' : MSG.empresa;
  if (name === 'ramo') return v ? '' : MSG.ramo;
  return '';
}

function setError(input, message) {
  const err = document.getElementById(`${input.id}-erro`);
  if (!err) return;
  err.textContent = message;
  if (message) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
}

function showStatus(box, kind, text) {
  box.className = `form__status form__status--${kind}`;
  box.textContent = text;
}

export function initForm() {
  const form = document.getElementById('form-demonstracao');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const required = Array.from(form.querySelectorAll('[data-required]'));
  const phone = form.querySelector('[name="whatsapp"]');
  let started = false;

  // Plano pre-selecionado (?plano=Essencial), vindo da pagina de planos.
  const plano = new URLSearchParams(location.search).get('plano');
  const planoField = form.querySelector('[name="plano"]');
  if (plano && planoField && ['Essencial', 'Completo', 'Sob medida'].includes(plano)) planoField.value = plano;

  phone.addEventListener('input', () => { phone.value = maskPhone(phone.value); });

  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    track('form_start', { form_id: form.id });
  });

  required.forEach((input) => {
    const evt = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'blur';
    input.addEventListener(evt, () => setError(input, validateField(input)));
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid')) setError(input, validateField(input)); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    let firstInvalid = null;
    required.forEach((input) => {
      const msg = validateField(input);
      setError(input, msg);
      if (msg && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      showStatus(status, 'error', 'Revise os campos destacados e tente de novo.');
      firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    if (data.get('website')) { location.assign(OBRIGADO_URL); return; } // honeypot: bot

    const consentLabel = form.querySelector('label[for="consentimento"]');
    const payload = {
      nome: data.get('nome').trim(),
      whatsapp: data.get('whatsapp').trim(),
      email: data.get('email').trim(),
      empresa: data.get('empresa').trim(),
      ramo: data.get('ramo'),
      mensagem: (data.get('mensagem') || '').trim(),
      plano: data.get('plano') || '',
      quer_novidades: form.querySelector('[name="novidades"]').checked,
      utm: getUtm(),
      pagina: location.pathname,
      consentimento: {
        aceito: true,
        texto: consentLabel ? consentLabel.textContent.trim() : '',
        politica_versao: SITE.POLITICA_VERSAO,
        registrado_em: new Date().toISOString(),
      },
    };

    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    showStatus(status, 'ok', 'Enviando seu pedido...');

    try {
      if (!FORM_ENDPOINT) {
        // Sem endpoint: abre o WhatsApp com mensagem pre-preenchida.
        const text = `${SITE.WHATSAPP_MENSAGEM} Nome: ${payload.nome}. Empresa: ${payload.empresa}. Ramo: ${payload.ramo}.`;
        track('form_submit', { form_id: form.id, ramo: payload.ramo });
        track('generate_lead', { method: 'whatsapp_fallback', ramo: payload.ramo });
        location.assign(`${SITE.WHATSAPP_LINK}?text=${encodeURIComponent(text)}`);
        return;
      }
      if (ENVIO_REAL) {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } // else: previa com endpoint ficticio, nenhuma requisicao e feita.
      track('form_submit', { form_id: form.id, ramo: payload.ramo, plano: payload.plano });
      track('generate_lead', { method: 'formulario', ramo: payload.ramo, plano: payload.plano });
      location.assign(OBRIGADO_URL);
    } catch (_) {
      button.disabled = false;
      showStatus(status, 'error', 'Não foi possível enviar agora. Tente de novo ou fale conosco pelo WhatsApp.');
      const a = document.createElement('a');
      a.href = WHATSAPP_URL;
      a.textContent = ' Abrir WhatsApp';
      a.setAttribute('data-whatsapp', '');
      status.appendChild(a);
    }
  });
}
