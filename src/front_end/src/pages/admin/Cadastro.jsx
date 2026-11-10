import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Carregando from '../../components/Carregando';
import ErroCarregamento from '../../components/ErroCarregamento';
import TabelaCrud from '../../components/TabelaCrud';
import useAviso from '../../hooks/useAviso';
import { estaAtivo } from '../../utils/formatadores';
import { CADASTROS } from './cadastrosConfig';

const EXTRAS_VAZIOS = { turmas: [], alunos: [], disciplinas: [], responsaveis: [] };

export default function Cadastro() {
  const { entidade } = useParams();
  const cfg = CADASTROS[entidade];

  if (!cfg) return <Navigate to="/administrador" replace />;
  return <TelaCadastro key={entidade} entidade={entidade} cfg={cfg} />;
}

function TelaCadastro({ entidade, cfg }) {
  const o = cfg.feminino ? 'a' : 'o';
  const { aviso, mostrarAviso, limparAviso } = useAviso();
  const formRef = useRef(null);

  const [itens, setItens] = useState([]);
  const [extras, setExtras] = useState(EXTRAS_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');

  const [dados, setDados] = useState(cfg.vazio);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroLista('');
    try {
      const [lista, turmas, alunos, disciplinas, responsaveis] = await Promise.all([
        api.listar(entidade),
        api.listar('turmas'),
        api.listar('alunos'),
        api.listar('disciplinas'),
        api.listar('responsaveis')
      ]);
      setItens(lista);
      setExtras({ turmas, alunos, disciplinas, responsaveis });
    } catch (err) {
      setErroLista(err.message);
    } finally {
      setCarregando(false);
    }
  }, [entidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const setCampo = (campo, valor) => setDados(atual => ({ ...atual, [campo]: valor }));

  function limparFormulario() {
    setDados(cfg.vazio);
    setEditandoId(null);
  }

  async function editar(id) {
    try {
      const item = await api.buscarPorId(entidade, id);
      setDados({ ...cfg.vazio, ...cfg.paraFormulario(item) });
      setEditandoId(item.id);
      limparAviso();
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  async function alternarAtivo(id, ativo) {
    try {
      await api.atualizar(entidade, id, { ativo: ativo ? 0 : 1 });
      await carregar();
      mostrarAviso(`${cfg.singular} ${ativo ? 'inativad' : 'ativad'}${o} com sucesso.`);
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  async function excluir(id) {
    const item = itens.find(i => i.id === id);
    if (!window.confirm(`Tem certeza que deseja excluir ${cfg.singular.toLowerCase()} "${item?.nome ?? id}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await api.remover(entidade, id);
      if (editandoId === id) limparFormulario();
      await carregar();
      mostrarAviso(`${cfg.singular} excluíd${o} com sucesso.`);
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  async function salvar(e) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;

    const erro = cfg.validar(dados, extras, editandoId);
    if (erro) {
      mostrarAviso(erro, 'error');
      return;
    }

    const payload = cfg.paraEnvio(dados);
    setSalvando(true);
    try {
      if (editandoId) {
        await api.atualizar(entidade, editandoId, payload);
        mostrarAviso(`${cfg.singular} atualizad${o} com sucesso!`);
      } else {
        await api.criar(entidade, payload);
        mostrarAviso(cfg.mensagemCriacao ? cfg.mensagemCriacao(payload) : `${cfg.singular} cadastrad${o} com sucesso!`);
      }
      limparFormulario();
      await carregar();
    } catch (err) {
      mostrarAviso(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  const linhas = itens.map(x => ({
    id: x.id,
    ativo: estaAtivo(x),
    valores: cfg.valores(x, extras)
  }));

  const Campos = cfg.campos;

  return (
    <Layout titulo={cfg.titulo} aviso={aviso} onFecharAviso={limparAviso}>
      <h2 className="section-title section-title-topo" ref={formRef}>
        {editandoId ? `Editando ${cfg.singular} #${editandoId} (${dados.nome})` : `Cadastrar ${cfg.singular}`}
      </h2>

      <form className="panel" onSubmit={salvar}>
        <div className="form-grid">
          <Campos dados={dados} setCampo={setCampo} extras={extras} editandoId={editandoId} />
        </div>
        <div className="form-actions">
          <button className="primary" type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : `${editandoId ? 'Atualizar' : 'Salvar'} ${cfg.singular}`}
          </button>
          {editandoId && (
            <button className="small-button secondary" type="button" onClick={limparFormulario}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <h2 className="section-title">
        {cfg.plural} cadastrad{o}s
      </h2>
      {carregando && !itens.length ? (
        <Carregando />
      ) : erroLista ? (
        <ErroCarregamento mensagem={erroLista} onTentarNovamente={carregar} />
      ) : (
        <TabelaCrud
          colunas={cfg.colunas}
          linhas={linhas}
          onEditar={editar}
          onAlternarAtivo={alternarAtivo}
          onExcluir={excluir}
        />
      )}
    </Layout>
  );
}
