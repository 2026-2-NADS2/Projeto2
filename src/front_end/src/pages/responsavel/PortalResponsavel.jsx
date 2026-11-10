import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { obterSessao } from '../../services/sessao';
import { ANO_LETIVO_PADRAO, BIMESTRES } from '../../config';
import Layout from '../../components/Layout';
import Carregando from '../../components/Carregando';
import ErroCarregamento from '../../components/ErroCarregamento';
import Chips from '../../components/Chips';
import Logo from '../../components/Logo';
import useAviso from '../../hooks/useAviso';
import { calcularMedia, estaAtivo, formatarMedia, mesmoTexto, separarLista } from '../../utils/formatadores';

export default function PortalResponsavel() {
  const { aviso, mostrarAviso, limparAviso } = useAviso();
  const sessao = obterSessao();
  const [params, setParams] = useSearchParams();

  const [vinculo, setVinculo] = useState(null);
  const [erroVinculo, setErroVinculo] = useState('');
  const [publicados, setPublicados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [destinoMensagem, setDestinoMensagem] = useState('todas');
  const [enviando, setEnviando] = useState(false);

  const numBimestre = ['1', '2', '3', '4'].includes(params.get('bimestre')) ? params.get('bimestre') : '2';
  const nomeBimestre = `${numBimestre}º Bimestre`;

  const carregarVinculo = useCallback(async () => {
    setErroVinculo('');
    try {
      const [alunos, responsaveis, turmas, disciplinas] = await Promise.all([
        api.listar('alunos'),
        api.listar('responsaveis'),
        api.listar('turmas'),
        api.listar('disciplinas')
      ]);
      const meusCadastros = responsaveis.filter(
        r => String(r.cpf).trim() === String(sessao?.identificador || '').trim() || mesmoTexto(r.email, sessao?.email)
      );
      const nomesVinculados = meusCadastros.flatMap(r => separarLista(r.aluno));
      const nomeResp = meusCadastros[0]?.nome || sessao?.nome;
      const dependentes = alunos.filter(
        a => nomesVinculados.some(n => mesmoTexto(n, a.nome)) || mesmoTexto(a.responsavel, nomeResp)
      );
      setVinculo({
        responsavel: meusCadastros[0] || null,
        dependentes,
        turmas,
        disciplinas: disciplinas.filter(estaAtivo).map(d => d.nome)
      });
    } catch (err) {
      setErroVinculo(err.message);
    }
  }, [sessao?.identificador, sessao?.email, sessao?.nome]);

  useEffect(() => {
    carregarVinculo();
  }, [carregarVinculo]);

  const alunoAtual = useMemo(() => {
    if (!vinculo?.dependentes.length) return null;
    return vinculo.dependentes.find(d => d.nome === params.get('aluno')) || vinculo.dependentes[0];
  }, [vinculo, params]);

  const disciplinasCadastradas = useMemo(() => {
    if (!vinculo || !alunoAtual) return [];
    const turma = vinculo.turmas.find(t => mesmoTexto(t.nome, alunoAtual.serie));
    const daTurma = turma ? separarLista(turma.disciplinas) : [];
    return daTurma.length ? daTurma : vinculo.disciplinas;
  }, [vinculo, alunoAtual]);

  const carregarPublicados = useCallback(async () => {
    if (!alunoAtual) return;
    setCarregando(true);
    setErro('');
    try {
      const lista = await api.listar('acompanhamentos', {
        aluno: alunoAtual.nome,
        bimestre: nomeBimestre,
        status: 'Publicado'
      });
      setPublicados(lista);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [alunoAtual, nomeBimestre]);

  useEffect(() => {
    carregarPublicados();
  }, [carregarPublicados]);

  const media = calcularMedia(publicados);
  const pendentesCiencia = publicados.filter(p => !p.ciencia_data);

  function mudarParametros(novos) {
    const atual = { bimestre: numBimestre, aluno: alunoAtual?.nome || '' };
    setParams({ ...atual, ...novos });
    setDestinoMensagem('todas');
  }

  async function confirmarCiencia() {
    if (!publicados.length) return mostrarAviso('Não há relatórios publicados neste bimestre para confirmar ciência.', 'error');
    if (!pendentesCiencia.length) return mostrarAviso('A ciência deste bimestre já foi registrada.', 'error');
    const agora = new Date().toLocaleString('pt-BR');
    try {
      await Promise.all(
        pendentesCiencia.map(p => api.atualizar('acompanhamentos', p.id, { acao_responsavel: true, ciencia_data: agora }))
      );
      await carregarPublicados();
      mostrarAviso('Confirmação de ciência registrada com sucesso!');
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  async function enviarObservacao(e) {
    e.preventDefault();
    if (mensagem.trim().length < 5) return mostrarAviso('Escreva uma observação com pelo menos 5 caracteres.', 'error');

    const alvo =
      destinoMensagem === 'todas' ? publicados : publicados.filter(p => mesmoTexto(p.disciplina, destinoMensagem));
    if (!alvo.length) {
      return mostrarAviso(
        destinoMensagem === 'todas'
          ? `Ainda não há relatórios publicados no ${nomeBimestre} para receber a sua observação.`
          : `Ainda não há relatório publicado de ${destinoMensagem} no ${nomeBimestre}. A observação fica registrada junto ao relatório publicado da disciplina.`,
        'error'
      );
    }

    setEnviando(true);
    try {
      await Promise.all(
        alvo.map(p => api.atualizar('acompanhamentos', p.id, { acao_responsavel: true, observacao_responsavel: mensagem.trim() }))
      );
      setMensagem('');
      await carregarPublicados();
      mostrarAviso('Observação enviada! Ela ficará visível ao professor e à coordenação.');
    } catch (err) {
      mostrarAviso(err.message, 'error');
    } finally {
      setEnviando(false);
    }
  }

  if (erroVinculo) {
    return (
      <Layout titulo="Portal do Responsável">
        <ErroCarregamento mensagem={erroVinculo} onTentarNovamente={carregarVinculo} />
      </Layout>
    );
  }
  if (!vinculo) {
    return (
      <Layout titulo="Portal do Responsável">
        <Carregando texto="Carregando alunos vinculados..." />
      </Layout>
    );
  }
  if (!alunoAtual) {
    return (
      <Layout titulo="Portal do Responsável">
        <div className="panel">
          Nenhum aluno está vinculado ao seu cadastro. Entre em contato com a secretaria da escola para fazer o vínculo.
        </div>
      </Layout>
    );
  }

  const nomeResponsavel = vinculo.responsavel?.nome || sessao?.nome;
  const parentesco = vinculo.responsavel?.parentesco;
  const jaCiente = publicados.length > 0 && !pendentesCiencia.length;

  return (
    <Layout titulo="Portal do Responsável" aviso={aviso} onFecharAviso={limparAviso}>
      <div className="somente-impressao panel">
        <h2 style={{ margin: 0 }}>
          <Logo /> · Relatório de Acompanhamento Escolar
        </h2>
        <p>
          Aluno: <b>{alunoAtual.nome}</b> · Matrícula: {alunoAtual.matricula} · Turma: {alunoAtual.serie}
        </p>
        <p>
          {nomeBimestre} / {ANO_LETIVO_PADRAO} · Responsável: {nomeResponsavel} · Gerado em{' '}
          {new Date().toLocaleString('pt-BR')}
        </p>
      </div>

      <div className="panel nao-imprimir">
        <div className="filtro-responsavel">
          <div className="field">
            Responsável
            <div className="campo-leitura">
              {nomeResponsavel}
              {parentesco && ` (${parentesco})`}
            </div>
          </div>
          <label className="field">
            Aluno vinculado
            <select value={alunoAtual.nome} onChange={e => mudarParametros({ aluno: e.target.value })}>
              {vinculo.dependentes.map(d => (
                <option key={d.id} value={d.nome}>
                  {d.nome} ({d.serie} - Mat: {d.matricula})
                </option>
              ))}
            </select>
          </label>
        </div>
        <nav className="abas" aria-label="Bimestres">
          {BIMESTRES.map((b, i) => {
            const n = String(i + 1);
            return (
              <button
                key={b}
                type="button"
                className={`small-button ${n === numBimestre ? 'active-tab' : ''}`}
                aria-pressed={n === numBimestre}
                onClick={() => mudarParametros({ bimestre: n })}
              >
                {b}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="stats">
        <div className="panel resumo-bimestre">
          <strong>Resumo do {nomeBimestre}</strong>
          <p>
            Status:{' '}
            {publicados.length
              ? `Publicado (${publicados.length} disciplina${publicados.length === 1 ? '' : 's'})`
              : 'Aguardando publicação pela coordenação'}
          </p>
          <p>
            Média geral do bimestre: <b>{media === null ? '—' : formatarMedia(media)}</b>
          </p>
          <p>
            Sala / Turma do Aluno: <b>{alunoAtual.serie}</b>
          </p>
        </div>

        <form className="panel cartao-acao nao-imprimir" onSubmit={enviarObservacao}>
          <strong>Comunicação com a escola</strong>
          <label className="field">
            Sobre qual disciplina?
            <select value={destinoMensagem} onChange={e => setDestinoMensagem(e.target.value)}>
              <option value="todas">Todas as disciplinas publicadas</option>
              {disciplinasCadastradas.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Sua observação
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              minLength={5}
              required
              placeholder="Ficará visível ao professor e à coordenação"
            />
          </label>
          <button className="small-button" type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar observação'}
          </button>
        </form>

        <div className="panel cartao-acao nao-imprimir">
          <strong>Confirmação de ciência</strong>
          <p>
            {jaCiente
              ? `Ciência registrada em ${publicados[0].ciencia_data}.`
              : 'Leia os relatórios publicados e confirme que tomou ciência.'}
          </p>
          <button type="button" className="small-button success-btn" onClick={confirmarCiencia} disabled={!publicados.length || jaCiente}>
            {jaCiente ? 'Ciência confirmada ✓' : 'Confirmar ciência'}
          </button>
        </div>
      </div>

      <h2 className="section-title">
        AVALIAÇÕES PUBLICADAS · {alunoAtual.nome.toUpperCase()} ({nomeBimestre})
      </h2>

      {carregando && !publicados.length ? (
        <Carregando texto="Carregando relatórios publicados..." />
      ) : erro ? (
        <ErroCarregamento mensagem={erro} onTentarNovamente={carregarPublicados} />
      ) : !publicados.length ? (
        <div className="panel">
          Ainda não há relatórios publicados pela coordenação para {alunoAtual.nome} no {nomeBimestre}.
        </div>
      ) : (
        <div className="cards">
          {publicados.map(x => (
            <article key={x.id} className="record">
              <div className="record-head">
                <strong>
                  {x.disciplina.toUpperCase()} (Prof. {x.professor})
                </strong>
                <strong>Média bimestral: {formatarMedia(x.media)}</strong>
              </div>
              <Chips itens={x.tags} />
              <p>
                <strong>Avaliação do professor:</strong> {x.descricao}
              </p>
              {x.observacao_responsavel && (
                <p className="muted">
                  <strong>Sua observação registrada:</strong> "{x.observacao_responsavel}"
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="primary" onClick={() => window.print()} disabled={!publicados.length}>
          Baixar PDF / Imprimir relatório
        </button>
      </div>
      <p className="muted nao-imprimir" style={{ color: '#fff', textAlign: 'center' }}>
        Dica: na janela de impressão, escolha "Salvar como PDF" para baixar o arquivo.
      </p>
    </Layout>
  );
}
