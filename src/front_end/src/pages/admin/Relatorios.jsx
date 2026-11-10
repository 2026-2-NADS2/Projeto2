import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { BIMESTRES, ROTULO_STATUS } from '../../config';
import Layout from '../../components/Layout';
import Carregando from '../../components/Carregando';
import ErroCarregamento from '../../components/ErroCarregamento';
import StatusBadge from '../../components/StatusBadge';
import Paginacao from '../../components/Paginacao';
import useAviso from '../../hooks/useAviso';
import usePaginacao from '../../hooks/usePaginacao';
import { calcularMedia, formatarDataHora, formatarMedia, mesmoTexto } from '../../utils/formatadores';
import { exportarCsv } from '../../utils/exportarCsv';

const FILTROS_VAZIOS = { turma: '', disciplina: '', professor: '', bimestre: '', aluno: '', tag: '', status: '' };

const AGRUPAMENTOS = {
  turma: 'Turma',
  disciplina: 'Disciplina',
  professor: 'Professor',
  bimestre: 'Bimestre',
  aluno: 'Aluno',
  tag: 'Tag'
};

const hoje = () => new Date().toISOString().slice(0, 10);

export default function Relatorios() {
  const { aviso, mostrarAviso, limparAviso } = useAviso();
  const [acompanhamentos, setAcompanhamentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [agruparPor, setAgruparPor] = useState('turma');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [lista, hist] = await Promise.all([api.listar('acompanhamentos'), api.listarHistorico()]);
      setAcompanhamentos(lista);
      setHistorico(hist);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const opcoes = useMemo(() => {
    const unicos = campo => [...new Set(acompanhamentos.map(a => a[campo]).filter(Boolean))].sort();
    return {
      turma: unicos('turma'),
      disciplina: unicos('disciplina'),
      professor: unicos('professor'),
      aluno: unicos('aluno'),
      tag: [...new Set(acompanhamentos.flatMap(a => a.tags || []))].sort()
    };
  }, [acompanhamentos]);

  const filtrados = useMemo(
    () =>
      acompanhamentos.filter(
        a =>
          (!filtros.turma || mesmoTexto(a.turma, filtros.turma)) &&
          (!filtros.disciplina || mesmoTexto(a.disciplina, filtros.disciplina)) &&
          (!filtros.professor || mesmoTexto(a.professor, filtros.professor)) &&
          (!filtros.bimestre || a.bimestre === filtros.bimestre) &&
          (!filtros.aluno || mesmoTexto(a.aluno, filtros.aluno)) &&
          (!filtros.tag || (a.tags || []).includes(filtros.tag)) &&
          (!filtros.status || a.status === filtros.status)
      ),
    [acompanhamentos, filtros]
  );

  const indicadores = useMemo(() => {
    const conta = status => filtrados.filter(a => a.status === status).length;
    return {
      total: filtrados.length,
      publicados: conta('Publicado'),
      aguardando: conta('Pendente') + conta('Em revisão'),
      devolvidos: conta('Devolvido'),
      rascunhos: conta('Rascunho')
    };
  }, [filtrados]);

  const grupos = useMemo(() => {
    const mapa = new Map();
    filtrados.forEach(a => {
      const chaves = agruparPor === 'tag' ? (a.tags?.length ? a.tags : ['(sem tag)']) : [a[agruparPor] || '—'];
      chaves.forEach(chave => {
        if (!mapa.has(chave)) mapa.set(chave, []);
        mapa.get(chave).push(a);
      });
    });
    const maiorQtd = Math.max(1, ...[...mapa.values()].map(l => l.length));
    return [...mapa.entries()]
      .map(([chave, lista]) => ({
        chave,
        qtd: lista.length,
        media: calcularMedia(lista),
        publicados: lista.filter(a => a.status === 'Publicado').length,
        pct: Math.round((lista.length / maiorQtd) * 100)
      }))
      .sort((a, b) => b.qtd - a.qtd || String(a.chave).localeCompare(String(b.chave)));
  }, [filtrados, agruparPor]);

  const lista = usePaginacao(filtrados, 8);
  const auditoria = usePaginacao(historico, 10);

  const setFiltro = campo => e => {
    setFiltros(f => ({ ...f, [campo]: e.target.value }));
    lista.setPagina(1);
  };

  function exportarAcompanhamentos() {
    if (!filtrados.length) return mostrarAviso('Não há registros para exportar com os filtros atuais.', 'error');
    exportarCsv(
      `kfka_acompanhamentos_${hoje()}.csv`,
      ['ID', 'Ano', 'Bimestre', 'Turma', 'Aluno', 'Disciplina', 'Professor', 'Média', 'Status', 'Tags', 'Descrição',
        'Parecer coordenação', 'Ciência responsável', 'Observação responsável', 'Atualizado em'],
      filtrados.map(a => [
        a.id, a.ano, a.bimestre, a.turma, a.aluno, a.disciplina, a.professor, formatarMedia(a.media),
        ROTULO_STATUS[a.status] || a.status, (a.tags || []).join(' | '), a.descricao, a.feedback_admin || '',
        a.ciencia_data || 'Pendente', a.observacao_responsavel || '', formatarDataHora(a.atualizado_em)
      ])
    );
    mostrarAviso(`Arquivo gerado com ${filtrados.length} ${filtrados.length === 1 ? 'acompanhamento' : 'acompanhamentos'}. Pode abrir no Excel.`);
  }

  function exportarIndicadores() {
    exportarCsv(
      `kfka_indicadores_por_${agruparPor}_${hoje()}.csv`,
      [AGRUPAMENTOS[agruparPor], 'Qtd. registros', 'Média', 'Publicados'],
      grupos.map(g => [g.chave, g.qtd, g.media === null ? '' : formatarMedia(g.media), g.publicados])
    );
    mostrarAviso(`Indicadores por ${AGRUPAMENTOS[agruparPor].toLowerCase()} exportados em .CSV.`);
  }

  function exportarAuditoria() {
    exportarCsv(
      `kfka_auditoria_${hoje()}.csv`,
      ['Data/Hora', 'Usuário', 'Perfil', 'Registro', 'Aluno', 'Disciplina', 'Estado anterior', 'Estado posterior', 'Detalhes'],
      historico.map(h => [
        formatarDataHora(h.data_hora), h.usuario, h.perfil, h.acompanhamento_id, h.aluno || '', h.disciplina || '',
        h.estado_anterior, h.estado_posterior, h.detalhes
      ])
    );
    mostrarAviso('Trilha de auditoria exportada em .CSV.');
  }

  const temFiltro = Object.values(filtros).some(Boolean);

  return (
    <Layout titulo="Relatórios Gerenciais, Auditoria e Exportação" aviso={aviso} onFecharAviso={limparAviso}>
      {carregando && !acompanhamentos.length ? (
        <Carregando texto="Carregando indicadores..." />
      ) : erro ? (
        <ErroCarregamento mensagem={erro} onTentarNovamente={carregar} />
      ) : (
        <>
          <div className="panel">
            <strong>FILTROS DOS INDICADORES</strong>
            <div className="filter">
              {['turma', 'disciplina', 'professor'].map(campo => (
                <SelectFiltro key={campo} rotulo={AGRUPAMENTOS[campo]} valor={filtros[campo]} opcoes={opcoes[campo]} onChange={setFiltro(campo)} />
              ))}
              <SelectFiltro rotulo="Bimestre" valor={filtros.bimestre} opcoes={BIMESTRES} onChange={setFiltro('bimestre')} />
              <SelectFiltro rotulo="Aluno" valor={filtros.aluno} opcoes={opcoes.aluno} onChange={setFiltro('aluno')} />
              <SelectFiltro rotulo="Tag" valor={filtros.tag} opcoes={opcoes.tag} onChange={setFiltro('tag')} />
              <label className="field">
                Status
                <select value={filtros.status} onChange={setFiltro('status')}>
                  <option value="">Todos</option>
                  {Object.entries(ROTULO_STATUS).map(([v, r]) => (
                    <option key={v} value={v}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              {temFiltro && (
                <button type="button" className="small-button secondary" onClick={() => setFiltros(FILTROS_VAZIOS)}>
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          <div className="stats duas-colunas">
            <div className="panel">
              <strong>Total de acompanhamentos</strong>
              <p>Registros: <b>{indicadores.total}</b></p>
              <p>Publicados aos pais: <b>{indicadores.publicados}</b></p>
              <p>Rascunhos: <b>{indicadores.rascunhos}</b></p>
            </div>
            <div className="panel">
              <strong>Fluxo editorial</strong>
              <p>Aguardando revisão: <b>{indicadores.aguardando}</b></p>
              <p>Devolvidos para ajuste: <b>{indicadores.devolvidos}</b></p>
            </div>
          </div>

          <h2 className="section-title">INDICADORES AGRUPADOS</h2>
          <div className="table-box">
            <div className="table-toolbar">
              <div className="abas" role="group" aria-label="Agrupar indicadores por">
                {Object.entries(AGRUPAMENTOS).map(([chave, rotulo]) => (
                  <button
                    key={chave}
                    type="button"
                    className={`small-button ${agruparPor === chave ? 'active-tab' : 'secondary'}`}
                    aria-pressed={agruparPor === chave}
                    onClick={() => setAgruparPor(chave)}
                  >
                    Por {rotulo.toLowerCase()}
                  </button>
                ))}
              </div>
              <button type="button" className="small-button" onClick={exportarIndicadores}>
                Exportar indicadores (.CSV)
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">{AGRUPAMENTOS[agruparPor]}</th>
                    <th scope="col">Registros</th>
                    <th scope="col">Média</th>
                    <th scope="col">Publicados</th>
                    <th scope="col">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.map(g => (
                    <tr key={g.chave}>
                      <td>{g.chave}</td>
                      <td>{g.qtd}</td>
                      <td>{g.media === null ? '—' : formatarMedia(g.media)}</td>
                      <td>{g.publicados}</td>
                      <td>
                        <div className="barra" aria-hidden="true">
                          <span style={{ width: `${g.pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!grupos.length && (
                    <tr>
                      <td colSpan={5}>Nenhum registro para os filtros selecionados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <h2 className="section-title">ACOMPANHAMENTOS FILTRADOS ({filtrados.length})</h2>
          <div className="table-box">
            <div className="table-toolbar">
              <span className="muted">Exporta exatamente os registros filtrados acima.</span>
              <button type="button" className="primary" onClick={exportarAcompanhamentos}>
                Exportar para Excel (.CSV)
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Bimestre</th>
                    <th scope="col">Turma</th>
                    <th scope="col">Aluno</th>
                    <th scope="col">Disciplina</th>
                    <th scope="col">Professor</th>
                    <th scope="col">Média</th>
                    <th scope="col">Tags</th>
                    <th scope="col">Status</th>
                    <th scope="col">Retorno da família</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.itensPagina.map(a => (
                    <tr key={a.id}>
                      <td>{a.bimestre}</td>
                      <td>{a.turma}</td>
                      <td>{a.aluno}</td>
                      <td>{a.disciplina}</td>
                      <td>{a.professor}</td>
                      <td>{formatarMedia(a.media)}</td>
                      <td>{(a.tags || []).join(', ')}</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td>
                        {a.ciencia_data ? `Ciente em ${a.ciencia_data}` : '—'}
                        {a.observacao_responsavel && <div className="muted">"{a.observacao_responsavel}"</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao pagina={lista.pagina} totalPaginas={lista.totalPaginas} onMudar={lista.setPagina} />
          </div>

          <h2 className="section-title">HISTÓRICO DE AUDITORIA E RASTREABILIDADE (RF07)</h2>
          <div className="table-box">
            <div className="table-toolbar">
              <span className="muted">
                {historico.length} {historico.length === 1 ? 'evento registrado' : 'eventos registrados'}
              </span>
              <button type="button" className="small-button" onClick={exportarAuditoria}>
                Exportar auditoria (.CSV)
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Data/Hora</th>
                    <th scope="col">Usuário (perfil)</th>
                    <th scope="col">Aluno / Disciplina</th>
                    <th scope="col">Estado anterior</th>
                    <th scope="col">Estado posterior</th>
                    <th scope="col">Detalhes da ação</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.itensPagina.map(h => (
                    <tr key={h.id}>
                      <td>{formatarDataHora(h.data_hora)}</td>
                      <td>
                        {h.usuario} ({h.perfil})
                      </td>
                      <td>
                        {h.aluno || `#${h.acompanhamento_id}`} · {h.disciplina || ''}
                      </td>
                      <td>{ROTULO_STATUS[h.estado_anterior] || h.estado_anterior}</td>
                      <td>
                        <StatusBadge status={h.estado_posterior} />
                      </td>
                      <td>{h.detalhes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao pagina={auditoria.pagina} totalPaginas={auditoria.totalPaginas} onMudar={auditoria.setPagina} />
          </div>
        </>
      )}
    </Layout>
  );
}

function SelectFiltro({ rotulo, valor, opcoes, onChange }) {
  return (
    <label className="field">
      {rotulo}
      <select value={valor} onChange={onChange}>
        <option value="">Todos</option>
        {opcoes.map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
