/**
 * site.config.js - ARQUIVO UNICO de dados comerciais e de configuracao do site.
 *
 * ATENCAO: todos os valores marcados como FAKE sao PLACEHOLDERS (Bloco de
 * placeholders do plano, secao 9). Nenhum pode ir para producao.
 *
 * Este arquivo e lido de duas formas:
 *  1. No navegador (form.js, analytics.js, consent.js, main.js).
 *  2. Pelo gerador de paginas opcional (tools/build.mjs), que grava os valores
 *     nos HTML estaticos (rodape, politica, JSON-LD, sitemap).
 * Depois de trocar um valor aqui, rode `node tools/build.mjs` para regravar os HTML.
 */
export const SITE = {
  // ---- Bloco de placeholders (FAKES) ----
  WHATSAPP_EXIBICAO: '(11) 90000-0000',
  WHATSAPP_LINK: 'https://wa.me/5511900000000',
  EMAIL_CONTATO: 'contato@exemplo.com.br',
  EMAIL_PRIVACIDADE: 'privacidade@exemplo.com.br',
  DOMINIO_SITE: 'www.exemplo.com.br',
  DESTINO_LEADS: 'leads@exemplo.com.br',
  DESTINO_LEADS_ENDPOINT: 'https://exemplo.com.br/api/leads', // endpoint ficticio
  ID_ANALYTICS: 'G-XXXXXXXXXX',
  RAZAO_SOCIAL: 'Kali Sistemas Ltda',
  CNPJ: '00.000.000/0001-00',
  ENDERECO: 'Rua Exemplo, 000, Cidade/UF',
  ENCARREGADO_NOME: 'Nome do Encarregado',
  SLA_RESPOSTA: '1 dia útil',
  HORARIO_ATENDIMENTO: 'Seg a Sex, 9h às 18h',

  // ---- Complementos de placeholder citados no Anexo A (FAKES) ----
  PRAZO_COOKIE_ANALISE: '14 meses',
  PRAZO_RESPOSTA_TITULAR: '15 dias',
  POLITICA_DATA_ATUALIZACAO: '[DATA]',
  POLITICA_VERSAO: 'rascunho-2026-10-25',

  // ---- Configuracao tecnica ----
  NOME_MARCA: 'Kali ERP',
  WHATSAPP_MENSAGEM: 'Olá! Quero ver uma demonstração do Kali ERP.',
  /** false = o formulario valida mas NAO envia a lugar nenhum (endpoint e ficticio). Mudar para true so com endpoint real. */
  ENVIO_REAL: false,
  /** false = oculta a secao de prova social (nao ha depoimento/numero/logo reais). */
  PROVA_SOCIAL_REAL: false,
  /** false = paginas com noindex e robots.txt bloqueando tudo (previa com dados fakes). Trocar para true na publicacao. */
  INDEXAR: false,
  /** true = mostra faixa "previa com dados ficticios" no topo. Desligar na publicacao. */
  MOSTRAR_FAIXA_PREVIA: true,
  CONSENT_COOKIE: 'cookie_consent',
  CONSENT_DIAS: 180,
};

export const WHATSAPP_URL = `${SITE.WHATSAPP_LINK}?text=${encodeURIComponent(SITE.WHATSAPP_MENSAGEM)}`;
export const ANALYTICS_ATIVO = !/X{4,}/.test(SITE.ID_ANALYTICS);
