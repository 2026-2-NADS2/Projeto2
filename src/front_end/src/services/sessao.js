import { DURACAO_SESSAO_MS } from '../config';

const CHAVE = 'kfka_usuario';

export function salvarSessao(usuario) {
  const sessao = { ...usuario, expiraEm: Date.now() + DURACAO_SESSAO_MS };
  sessionStorage.setItem(CHAVE, JSON.stringify(sessao));
  return sessao;
}

export function obterSessao() {
  try {
    const sessao = JSON.parse(sessionStorage.getItem(CHAVE));
    if (!sessao) return null;
    if (sessao.expiraEm && Date.now() > sessao.expiraEm) {
      encerrarSessao();
      return null;
    }
    return sessao;
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE);
}
