import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../../services/api';
import { obterSessao } from '../../services/sessao';
import { ANO_LETIVO_PADRAO, BIMESTRES, ROTULO_STATUS } from '../../config';
import Layout from '../../components/Layout';
import Carregando from '../../components/Carregando';
import ErroCarregamento from '../../components/ErroCarregamento';
import GrupoCheckbox from '../../components/GrupoCheckbox';
import Paginacao from '../../components/Paginacao';
import useAviso from '../../hooks/useAviso';
import usePaginacao from '../../hooks/usePaginacao';
import {
  bimestreAbertoAgora,
  estaAtivo,
  formatarDataHora,
  mesmoTexto,
  separarLista
} from '../../utils/formatadores';
import FichaAcompanhamento from './FichaAcompanhamento';

const STATUS_EDITAVEIS = ['Rascunho', 'Pendente', 'Devolvido'];
const FORM_VAZIO = { aluno: '', disciplina: '', bimestre: '', media: '', tags: [], descricao: '' };

export default function PortalProfessor() {
  const { aviso, mostrarAviso, limparAviso } = useAviso();
  const sessao = obterSessao();
  const formRef = useRef(null);

  const [base, setBase] = useState(null);
  const [erroBase, setErroBase] = useState('');
  const [turma, setTurma] = useState('');
  const [registros, setRegistros] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [erroLista, setErroLista] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregarBase = useCallback(async () => {
    setErroBase('');
    try {
      const [alunos, tags, bimestres, turmas, professores] = await Promise.all([
        api.listar('alunos'),
        api.listar('tags'),
        api.listar('bimestres'),
        api.listar('turmas'),
        api.listar('professores')
      ]);

      const meusCadastros = professores.filter(
        p =>
          estaAtivo(p) &&
          (mesmoTexto(p.ra, sessao?.identificador) || mesmoTexto(p.email, sessao?.email) || mesmoTexto(p.nome, sessao?.nome))
      );
      const turmasAtivas = turmas.filter(estaAtivo).map(t => t.nome);
      const minhasTurmas = [...new Set(meusCadastros.flatMap(p => separarLista(p.turma)))].filter(t =>
        turmasAtivas.some(a => mesmoTexto(a, t))
      );
      const minhasDisciplinas = [...new Set(meusCadastros.flatMap(p => separarLista(p.disciplina)))];

      setBase({
        alunos: alunos.filter(estaAtivo),
        tags: tags.filter(estaAtivo).map(t => t.nome),
        bimestres: [...bimestres].sort((a, b) => a.id - b.id),
        minhasTurmas,
        minhasDisciplinas,
        nomeProfessor: meusCadastros[0]?.nome || sessao?.nome
      });
      setTurma(atual => atual || minhasTurmas[0] || '');
    } catch (err) {
      setErroBase(err.message);
    }
  }, [sessao?.identificador, sessao?.email, sessao?.nome]);

  useEffect(() => {
    carregarBase();
  }, [carregarBase]);

  const carregarRegistros = useCallback(async () => {
    if (!turma || !base) return;
    setCarregandoLista(true);
    setErroLista('');
    try {
      const lista = await api.listar('acompanhamentos', { turma });
      setRegistros(lista.filter(i => base.minhasDisciplinas.some(d => mesmoTexto(d, i.disciplina))));
    } catch (err) {
      setErroLista(err.message);
    } finally {
      setCarregandoLista(false);
    }
  }, [turma, base]);

  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const alunosDaTurma = useMemo(
    () => (base ? base.alunos.filter(a => mesmoTexto(a.serie, turma)) : []),
    [base, turma]
  );

  const bimestrePorNome = nome => base?.bimestres.find(b => b.nome === nome);
  const bimestresAbertos = base ? base.bimestres.filter(bimestreAbertoAgora).map(b => b.nome) : [];

  useEffect(() => {
    if (!base || editandoId) return;
    setForm(f => ({
      ...f,
      aluno: alunosDaTurma.some(a => a.nome === f.aluno) ? f.aluno : alunosDaTurma[0]?.nome || '',
      disciplina: f.disciplina || base.minhasDisciplinas[0] || '',
      bimestre: f.bimestre || bimestresAbertos[0] || BIMESTRES[0]
    }));
  }, [base, alunosDaTurma, editandoId]);

  const visiveis = useMemo(
    () =>
      registros.filter(r =>
        !filtroStatus ? true : filtroStatus === 'retorno' ? r.ciencia_data || r.observacao_responsavel : r.status === filtroStatus
      ),
    [registros, filtroStatus]
  );
  const { pagina, setPagina, totalPaginas, itensPagina } = usePaginacao(visiveis, 5);

  const resumo = useMemo(
    () => ({
      total: registros.length,
      publicados: registros.filter(r => r.status === 'Publicado').length,
      devolvidos: registros.filter(r => r.status === 'Devolvido').length
    }),
    [registros]
  );

  const setCampo = campo => e => setForm(f => ({ ...f, [campo]: e.target.value }));
  const periodoSelecionadoAberto = bimestreAbertoAgora(bimestrePorNome(form.bimestre));

  function trocarTurma(nova) {
    setTurma(nova);
    setEditandoId(null);
    setForm(f => ({ ...FORM_VAZIO, disciplina: f.disciplina, bimestre: f.bimestre }));
    setPagina(1);
  }

  function limparFormulario() {
    setEditandoId(null);
    setForm(f => ({ ...FORM_VAZIO, aluno: alunosDaTurma[0]?.nome || '', disciplina: f.disciplina, bimestre: f.bimestre }));
  }

  async function editar(id) {
    try {
      const x = await api.buscarPorId('acompanhamentos', id);
      setTurma(x.turma);
      setForm({
        aluno: x.aluno,
        disciplina: x.disciplina,
        bimestre: x.bimestre,
        media: String(Number(x.media)),
        tags: x.tags || [],
        descricao: x.descricao
      });
      setEditandoId(x.id);
      limparAviso();
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  async function excluir(item) {
    if (!window.confirm(`Excluir o rascunho de ${item.aluno} (${item.disciplina})?`)) return;
    try {
      await api.remover('acompanhamentos', item.id);
      if (editandoId === item.id) limparFormulario();
      await carregarRegistros();
      mostrarAviso('Rascunho removido com sucesso.');
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  async function salvar(e) {
    e.preventDefault();
    const status = e.nativeEvent.submitter?.value || 'Rascunho';
    if (!e.currentTarget.reportValidity()) return;
    if (!form.aluno) return mostrarAviso('Não há aluno matriculado nesta sala. Peça à coordenação para matricular.', 'error');
    const media = Number(form.media);
    if (Number.isNaN(media) || media < 0 || media > 10) return mostrarAviso('A média deve estar entre 0 e 10.', 'error');
    if (!form.tags.length) return mostrarAviso('Selecione ao menos uma tag de acompanhamento.', 'error');
    if (!periodoSelecionadoAberto) {
      return mostrarAviso(`O período de digitação do ${form.bimestre} está fechado.`, 'error');
    }

    const payload = {
      turma,
      aluno: form.aluno,
      disciplina: form.disciplina,
      bimestre: form.bimestre,
      ano: ANO_LETIVO_PADRAO,
      media: media.toFixed(1),
      descricao: form.descricao.trim(),
      tags: form.tags,
      status,
      professor: base.nomeProfessor,
      usuario_acao: sessao?.nome || base.nomeProfessor,
      perfil: 'professor',
      detalhes_auditoria:
        status === 'Pendente' ? 'Professor enviou o acompanhamento para revisão' : 'Professor salvou o rascunho'
    };

    setSalvando(true);
    try {
      if (editandoId) await api.atualizar('acompanhamentos', editandoId, payload);
      else await api.criar('acompanhamentos', payload);
      limparFormulario();
      await carregarRegistros();
      mostrarAviso(status === 'Rascunho' ? 'Rascunho salvo com sucesso.' : 'Acompanhamento enviado para revisão da coordenação!');
    } catch (err) {
      mostrarAviso(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  if (erroBase) {
    return (
      <Layout titulo="Portal do Professor">
        <ErroCarregamento mensagem={erroBase} onTentarNovamente={carregarBase} />
      </Layout>
    );
  }
  if (!base) {
    return (
      <Layout titulo="Portal do Professor">
        <Carregando texto="Carregando suas turmas e disciplinas..." />
      </Layout>
    );
  }
  if (!base.minhasTurmas.length) {
    return (
      <Layout titulo="Portal do Professor">
        <div className="panel">
          Seu usuário ({sessao?.nome}) ainda não está vinculado a nenhuma turma ativa. Peça à coordenação para vincular suas
          salas e disciplinas em <b>Professores</b>.
        </div>
      </Layout>
    );
  }

  return (
    <Layout titulo="Portal do Professor" aviso={aviso} onFecharAviso={limparAviso}>
      <div className="panel">
        <strong>JANELAS DE DIGITAÇÃO {ANO_LETIVO_PADRAO}</strong>
        <div className="abas" style={{ marginTop: 10 }}>
          {base.bimestres.map(b => {
            const aberto = bimestreAbertoAgora(b);
            return (
              <span key={b.id} className={`badge ${aberto ? 'Publicado' : 'Devolvido'}`} title={`${formatarDataHora(b.data_abertura)} até ${formatarDataHora(b.data_encerramento)}`}>
                {b.nome}: {aberto ? `aberto até ${formatarDataHora(b.data_encerramento)}` : 'fechado'}
              </span>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <strong>MINHAS SALAS DE AULA</strong>
        <div className="abas" style={{ marginTop: 10 }} role="group" aria-label="Selecionar sala">
          {base.minhasTurmas.map(sala => {
            const qtd = base.alunos.filter(a => mesmoTexto(a.serie, sala)).length;
            const ativa = mesmoTexto(sala, turma);
            return (
              <button
                key={sala}
                type="button"
                className={`small-button ${ativa ? 'active-tab' : 'secondary'}`}
                aria-pressed={ativa}
                onClick={() => trocarTurma(sala)}
              >
                {sala} ({qtd} aluno{qtd === 1 ? '' : 's'})
              </button>
            );
          })}
        </div>
        <p className="muted">
          Disciplinas que você leciona: <b>{base.minhasDisciplinas.join(', ')}</b>
          {alunosDaTurma.length
            ? ` · Alunos de ${turma}: ${alunosDaTurma.map(a => a.nome).join(', ')}.`
            : ` · A sala ${turma} ainda não possui alunos matriculados.`}
        </p>
      </div>

      <div className="panel" ref={formRef}>
        <h2>{editandoId ? `Editando acompanhamento #${editandoId} (${form.aluno})` : 'Lançar acompanhamento da turma'}</h2>
        <form onSubmit={salvar}>
          <div className="form-grid">
            <label className="field">
              Sala / turma
              <input value={turma} readOnly />
            </label>
            <label className="field">
              Aluno (matriculado nesta sala)
              <select value={form.aluno} onChange={setCampo('aluno')} required disabled={!!editandoId}>
                {!alunosDaTurma.length && <option value="">Nenhum aluno matriculado</option>}
                {alunosDaTurma.map(a => (
                  <option key={a.id} value={a.nome}>
                    {a.nome} (Matrícula: {a.matricula})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Disciplina (lecionada por você)
              <select value={form.disciplina} onChange={setCampo('disciplina')} required disabled={!!editandoId}>
                {base.minhasDisciplinas.map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Bimestre
              <select value={form.bimestre} onChange={setCampo('bimestre')} required disabled={!!editandoId}>
                {BIMESTRES.map(b => (
                  <option key={b} value={b}>
                    {b} {bimestresAbertos.includes(b) ? '(aberto)' : '(fechado)'}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Média bimestral (0 a 10)
              <input type="number" step="0.1" min="0" max="10" value={form.media} onChange={setCampo('media')} required />
            </label>
            <GrupoCheckbox
              legenda="Tags de acompanhamento (pode marcar várias)"
              nome="tags"
              opcoes={base.tags}
              selecionados={form.tags}
              onChange={v => setForm(f => ({ ...f, tags: v }))}
            />
            <label className="field wide">
              Avaliação / descrição do professor
              <textarea value={form.descricao} onChange={setCampo('descricao')} minLength={10} required placeholder="Descreva o desenvolvimento do aluno no bimestre (mínimo 10 caracteres)." />
            </label>
          </div>

          {!periodoSelecionadoAberto && (
            <div className="message error" role="alert">
              <span>O período de digitação do {form.bimestre} está fechado. Não é possível salvar nem enviar.</span>
            </div>
          )}

          <div className="record-actions">
            <button className="primary secondary" type="submit" value="Rascunho" disabled={salvando || !periodoSelecionadoAberto}>
              Salvar rascunho
            </button>
            <button className="primary" type="submit" value="Pendente" disabled={salvando || !periodoSelecionadoAberto}>
              Enviar para revisão
            </button>
            {editandoId && (
              <button className="small-button secondary" type="button" onClick={limparFormulario}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="section-title">ACOMPANHAMENTOS DA SALA: {turma.toUpperCase()}</h2>
      <div className="stats duas-colunas">
        <div className="panel">
          <strong>Registros da sala</strong>
          <p>Total: <b>{resumo.total}</b> · Publicados: <b>{resumo.publicados}</b></p>
        </div>
        <div className="panel">
          <strong>Pendências</strong>
          <p>Devolvidos para ajuste: <b>{resumo.devolvidos}</b></p>
        </div>
      </div>

      <div className="panel">
        <label className="field" style={{ maxWidth: 320 }}>
          Filtrar registros
          <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPagina(1); }}>
            <option value="">Todos os status</option>
            {Object.entries(ROTULO_STATUS).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
            <option value="retorno">Com retorno do responsável</option>
          </select>
        </label>
      </div>

      {carregandoLista && !registros.length ? (
        <Carregando texto="Carregando acompanhamentos da turma..." />
      ) : erroLista ? (
        <ErroCarregamento mensagem={erroLista} onTentarNovamente={carregarRegistros} />
      ) : !visiveis.length ? (
        <div className="panel">
          Nenhum acompanhamento encontrado para suas disciplinas ({base.minhasDisciplinas.join(', ')}) na sala <b>{turma}</b>
          {filtroStatus ? ' com este filtro' : ''}.
        </div>
      ) : (
        <>
          <div className="cards">
            {itensPagina.map(item => {
              const aberto = bimestreAbertoAgora(bimestrePorNome(item.bimestre));
              return (
                <FichaAcompanhamento
                  key={item.id}
                  item={item}
                  podeEditar={aberto && STATUS_EDITAVEIS.includes(item.status)}
                  podeExcluir={item.status === 'Rascunho'}
                  onEditar={editar}
                  onExcluir={excluir}
                />
              );
            })}
          </div>
          <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} total={visiveis.length} />
        </>
      )}
    </Layout>
  );
}
