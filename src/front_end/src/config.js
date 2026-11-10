const urlDoEnv = import.meta.env && import.meta.env.VITE_API_URL;

function urlSalvaNoNavegador() {
  try {
    return localStorage.getItem('kfka_api_url');
  } catch {
    return null;
  }
}

export const API_BASE_URL = urlSalvaNoNavegador() || urlDoEnv || 'http://localhost:3000/api';

export const ANO_LETIVO_PADRAO = '2026';

export const BIMESTRES = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];

export const DURACAO_SESSAO_MS = 2 * 60 * 60 * 1000;

export const ROTULO_STATUS = {
  Rascunho: 'Rascunho',
  Pendente: 'Enviado para revisão',
  'Em revisão': 'Em revisão',
  Devolvido: 'Devolvido para ajustes',
  Publicado: 'Publicado',
  Cancelado: 'Cancelado'
};

export const HOME_DO_PERFIL = {
  administrador: '/administrador',
  professor: '/professor',
  responsavel: '/responsavel'
};
