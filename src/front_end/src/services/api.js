import { API_BASE_URL } from '../config';

async function requisicao(endpoint, opcoes = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes
  };

  let resposta;
  try {
    resposta = await fetch(url, config);
  } catch {
    throw new Error(
      `Não foi possível conectar à API (${API_BASE_URL}). Verifique se o back-end está rodando com "npm start".`
    );
  }

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro HTTP ${resposta.status}`);
  }
  return dados;
}

function montarQuery(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') params.append(chave, valor);
  });
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

const api = {
  login(credenciais) {
    return requisicao('/login', { method: 'POST', body: JSON.stringify(credenciais) });
  },

  definirSenha(identificador, novaSenha) {
    return requisicao('/definir-senha', {
      method: 'POST',
      body: JSON.stringify({ identificador, novaSenha })
    });
  },

  recuperarSenha(identificador) {
    return requisicao('/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify({ identificador })
    });
  },

  listar(rota, filtros = {}) {
    return requisicao(`/${rota}${montarQuery(filtros)}`);
  },

  buscarPorId(rota, id) {
    return requisicao(`/${rota}/${id}`);
  },

  criar(rota, dados) {
    return requisicao(`/${rota}`, { method: 'POST', body: JSON.stringify(dados) });
  },

  atualizar(rota, id, dados) {
    return requisicao(`/${rota}/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
  },

  remover(rota, id) {
    return requisicao(`/${rota}/${id}`, { method: 'DELETE' });
  },

  listarHistorico() {
    return requisicao('/historico');
  }
};

export default api;
