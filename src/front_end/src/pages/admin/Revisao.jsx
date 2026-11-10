import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { obterSessao } from '../../services/sessao';
import { BIMESTRES, ROTULO_STATUS } from '../../config';
import Layout from '../../components/Layout';
import Carregando from '../../components/Carregando';
import ErroCarregamento from '../../components/ErroCarregamento';
import StatusBadge from '../../components/StatusBadge';
import GrupoCheckbox from '../../components/GrupoCheckbox';
import HistoricoRegistro from '../../components/HistoricoRegistro';
import Paginacao from '../../components/Paginacao';
import useAviso from '../../hooks/useAviso';
import usePaginacao from '../../hooks/usePaginacao';
import { estaAtivo, formatarDataHora, mesmoTexto } from '../../utils/formatadores';

export default function Revisao() {
  const { aviso, mostrarAviso, limparAviso } = useAviso();
  const [itens, setItens] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [tags, setTags] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState({ status: 'Pendente', turma: '', bimestre: '' });

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [lista, hist, listaTags] = await Promise.all([
        api.listar('acompanhamentos', { status: filtros.status }),
        api.listarHistorico(),
        api.listar('tags')
      ]);
      setItens(lista);
      setHistorico(hist);
      setTags(listaTags.filter(estaAtivo).map(t => t.nome));
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [filtros.status]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const turmas = useMemo(() => [...new Set(itens.map(i => i.turma))].sort(), [itens]);

  const filtrados = useMemo(
    () =>
      itens.filter(
        i => (!filtros.turma || mesmoTexto(i.turma, filtros.turma)) && (!filtros.bimestre || i.bimestre === filtros.bimestre)
      ),
    [itens, filtros.turma, filtros.bimestre]
  );

  const { pagina, setPagina, totalPaginas, itensPagina } = usePaginacao(filtrados, 5);

  const setFiltro = campo => e => setFiltros(f => ({ ...f, [campo]: e.target.value }));

  async function aplicarAcao(item, valores, novoStatus) {
    if (novoStatus === 'Devolvido' && !String(valores.feedback_admin || '').trim()) {
      mostrarAviso('Para devolver ao professor, escreva o motivo no campo "Parecer da coordenação".', 'error');
      return false;
    }
    if (novoStatus === 'Cancelado' && !window.confirm('Cancelar este acompanhamento? Ele sairá do fluxo, mas o histórico será mantido.')) {
      return false;
    }
    const sessao = obterSessao();
    const alterouConteudo =
      Number(valores.media) !== Number(item.media) ||
      valores.descricao !== item.descricao ||
      JSON.stringify([...valores.tags].sort()) !== JSON.stringify([...(item.tags || [])].sort());

    try {
      await api.atualizar('acompanhamentos', item.id, {
        media: Number(valores.media),
        descricao: valores.descricao,
        tags: valores.tags,
        feedback_admin: valores.feedback_admin,
        status: novoStatus,
        usuario_acao: sessao?.nome || 'Administrador',
        perfil: 'administrador',
        detalhes_auditoria: `Revisão administrativa: ${ROTULO_STATUS[item.status]} → ${ROTULO_STATUS[novoStatus]}${
          alterouConteudo ? ' (conteúdo alterado pelo revisor)' : ''
        }${novoStatus === 'Devolvido' ? `. Motivo: ${valores.feedback_admin}` : ''}`
      });
      await carregar();
      mostrarAviso(`Acompanhamento de ${item.aluno} atualizado para "${ROTULO_STATUS[novoStatus]}" (registrado na auditoria).`);
      return true;
    } catch (err) {
      mostrarAviso(err.message, 'error');
      return false;
    }
  }

  async function excluir(item) {
    if (!window.confirm(`Excluir definitivamente o acompanhamento de ${item.aluno} (${item.disciplina})?`)) return;
    try {
      await api.remover('acompanhamentos', item.id);
      await carregar();
      mostrarAviso('Acompanhamento excluído com sucesso.');
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  return (
    <Layout titulo="Revisão e Publicação de Acompanhamentos" aviso={aviso} onFecharAviso={limparAviso}>
      <div className="panel">
        <strong>FILTRAR ACOMPANHAMENTOS</strong>
        <div className="filter">
          <label className="field">
            Status
            <select value={filtros.status} onChange={setFiltro('status')}>
              <option value="">Todos</option>
              {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Turma
            <select value={filtros.turma} onChange={setFiltro('turma')}>
              <option value="">Todas</option>
              {turmas.map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Bimestre
            <select value={filtros.bimestre} onChange={setFiltro('bimestre')}>
              <option value="">Todos</option>
              {BIMESTRES.map(b => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {carregando && !itens.length ? (
        <Carregando texto="Buscando registros para revisão..." />
      ) : erro ? (
        <ErroCarregamento mensagem={erro} onTentarNovamente={carregar} />
      ) : !filtrados.length ? (
        <div className="panel">Nenhum acompanhamento encontrado para este filtro.</div>
      ) : (
        <>
          <div className="cards">
            {itensPagina.map(item => (
              <CartaoRevisao
                key={`${item.id}-${item.atualizado_em}`}
                item={item}
                tagsDisponiveis={tags}
                eventos={historico.filter(h => h.acompanhamento_id === item.id)}
                onAcao={aplicarAcao}
                onExcluir={excluir}
              />
            ))}
          </div>
          <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} total={filtrados.length} />
        </>
      )}
    </Layout>
  );
}

function CartaoRevisao({ item, tagsDisponiveis, eventos, onAcao, onExcluir }) {
  const [valores, setValores] = useState({
    media: item.media,
    descricao: item.descricao,
    feedback_admin: item.feedback_admin || '',
    tags: item.tags || []
  });
  const [verHistorico, setVerHistorico] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const finalizado = item.status === 'Cancelado';

  const set = campo => e => setValores(v => ({ ...v, [campo]: e.target.value }));

  async function acao(e) {
    e.preventDefault();
    const novoStatus = e.nativeEvent.submitter?.value;
    if (!novoStatus) return;
    const nota = Number(valores.media);
    if (Number.isNaN(nota) || nota < 0 || nota > 10) return;
    setEnviando(true);
    await onAcao(item, valores, novoStatus);
    setEnviando(false);
  }

  return (
    <article className="record">
      <div className="record-head">
        <strong>
          ALUNO: {item.aluno} · {item.disciplina} ({item.turma} - {item.bimestre}/{item.ano})
        </strong>
        <StatusBadge status={item.status} prefixo="STATUS: " />
      </div>
      <p className="muted">
        Professor: {item.professor} · Última atualização: {formatarDataHora(item.atualizado_em)}
      </p>

      <form onSubmit={acao}>
        <div className="form-grid">
          <label className="field">
            Média bimestral (0 a 10)
            <input type="number" step="0.1" min="0" max="10" value={valores.media} onChange={set('media')} required disabled={finalizado} />
          </label>
          <label className="field wide">
            Parecer / descrição (editável pelo revisor)
            <textarea value={valores.descricao} onChange={set('descricao')} required minLength={10} disabled={finalizado} />
          </label>
          <GrupoCheckbox
            legenda="Tags do acompanhamento"
            nome={`tags-${item.id}`}
            opcoes={[...new Set([...tagsDisponiveis, ...(item.tags || [])])]}
            selecionados={valores.tags}
            onChange={v => setValores(atual => ({ ...atual, tags: v }))}
          />
          <label className="field wide">
            Parecer da coordenação / motivo de devolução (visível ao professor)
            <input
              type="text"
              value={valores.feedback_admin}
              onChange={set('feedback_admin')}
              placeholder="Ex.: Favor detalhar quais atividades não foram entregues."
              disabled={finalizado}
            />
          </label>
        </div>

        {(item.ciencia_data || item.observacao_responsavel) && (
          <div className="message success">
            <span>
              <strong>Retorno da família: </strong>
              {item.ciencia_data && `Ciência confirmada em ${item.ciencia_data}. `}
              {item.observacao_responsavel && `Observação do responsável: "${item.observacao_responsavel}"`}
            </span>
          </div>
        )}

        {!finalizado && (
          <div className="record-actions">
            <button type="submit" value="Em revisão" className="small-button secondary" disabled={enviando}>
              Marcar em revisão
            </button>
            <button type="submit" value="Devolvido" className="small-button warning" disabled={enviando}>
              Devolver para ajustes
            </button>
            <button type="submit" value="Publicado" className="small-button success-btn" disabled={enviando}>
              {item.status === 'Publicado' ? 'Salvar alterações (publicado)' : 'Aprovar e publicar aos pais'}
            </button>
            <button type="submit" value="Cancelado" className="small-button secondary" disabled={enviando} formNoValidate>
              Cancelar registro
            </button>
            <button type="button" className="small-button danger" onClick={() => onExcluir(item)} disabled={enviando}>
              Excluir
            </button>
          </div>
        )}
      </form>

      <div className="record-actions">
        <button type="button" className="small-button secondary" onClick={() => setVerHistorico(v => !v)} aria-expanded={verHistorico}>
          {verHistorico ? 'Ocultar histórico' : `Ver histórico (${eventos.length})`}
        </button>
      </div>
      {verHistorico && <HistoricoRegistro eventos={eventos} />}
    </article>
  );
}
