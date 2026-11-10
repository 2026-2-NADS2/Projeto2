import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { salvarSessao } from '../services/sessao';
import { HOME_DO_PERFIL } from '../config';
import Logo from '../components/Logo';
import Aviso from '../components/Aviso';
import useAviso from '../hooks/useAviso';

const CONFIG_PERFIL = {
  responsavel: { titulo: 'RESPONSÁVEL', label: 'CPF ou Matrícula do Aluno', exemplo: '987.654.321-00' },
  professor: { titulo: 'PROFESSOR', label: 'RA ou E-mail', exemplo: '102030' },
  administrador: { titulo: 'ADMINISTRADOR', label: 'Usuário', exemplo: 'admin' }
};

export default function Acesso() {
  const { perfil } = useParams();
  const navigate = useNavigate();
  const { aviso, mostrarAviso } = useAviso();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  const [mostrarCriarSenha, setMostrarCriarSenha] = useState(false);
  const [idAtivacao, setIdAtivacao] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const cfg = CONFIG_PERFIL[perfil];
  if (!cfg) return <Navigate to="/login" replace />;

  async function entrar(e) {
    e.preventDefault();
    if (!usuario.trim() || !senha.trim()) {
      mostrarAviso('Preencha usuário e senha.', 'error');
      return;
    }
    setEntrando(true);
    try {
      const resposta = await api.login({ usuario: usuario.trim(), senha, perfil });
      salvarSessao(resposta.usuario);
      navigate(HOME_DO_PERFIL[perfil]);
    } catch (err) {
      mostrarAviso(err.message, 'error');
      setEntrando(false);
    }
  }

  async function recuperar() {
    if (!usuario.trim()) {
      mostrarAviso(`Preencha o campo "${cfg.label}" para solicitar a recuperação de senha.`, 'error');
      return;
    }
    try {
      const resposta = await api.recuperarSenha(usuario.trim());
      mostrarAviso(resposta.mensagem, 'success');
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  function abrirCriarSenha() {
    setMostrarCriarSenha(v => !v);
    if (usuario.trim()) setIdAtivacao(usuario.trim());
  }

  async function salvarNovaSenha(e) {
    e.preventDefault();
    if (novaSenha.trim().length < 4) {
      mostrarAviso('A senha deve ter pelo menos 4 caracteres.', 'error');
      return;
    }
    setSalvandoSenha(true);
    try {
      const resposta = await api.definirSenha(idAtivacao.trim(), novaSenha.trim());
      mostrarAviso(resposta.mensagem, 'success');
      setUsuario(idAtivacao.trim());
      setSenha(novaSenha.trim());
      setNovaSenha('');
      setMostrarCriarSenha(false);
    } catch (err) {
      mostrarAviso(err.message, 'error');
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <main className="login">
      <section className="login-box">
        <h1 className="login-logo">
          <Logo />
        </h1>

        <form className="login-form" onSubmit={entrar} noValidate>
          <h2>Acesso {cfg.titulo}</h2>
          <Aviso aviso={aviso} />

          <label htmlFor="usuario">{cfg.label}</label>
          <input
            className="login-input"
            id="usuario"
            autoComplete="username"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            placeholder={`Ex.: ${cfg.exemplo}`}
            required
          />

          <label htmlFor="senha">Senha</label>
          <input
            className="login-input"
            id="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            required
          />

          <button className="primary" type="submit" disabled={entrando}>
            {entrando ? 'Autenticando...' : 'Confirmar'}
          </button>

          <div className="login-links">
            <Link to="/login">← Voltar</Link>
            {perfil === 'responsavel' && (
              <button type="button" className="back destaque" onClick={abrirCriarSenha} aria-expanded={mostrarCriarSenha}>
                Primeiro acesso / Criar senha
              </button>
            )}
            <button type="button" className="back" onClick={recuperar}>
              Esqueci minha senha
            </button>
          </div>
        </form>

        {perfil === 'responsavel' && mostrarCriarSenha && (
          <form className="login-form login-form-extra" onSubmit={salvarNovaSenha}>
            <h3>Criar / Definir Senha do Responsável</h3>
            <p className="login-ajuda">
              Digite o CPF cadastrado pela escola ou o número de matrícula do aluno para definir sua senha.
            </p>
            <label htmlFor="id-ativacao">Seu CPF ou Matrícula do Aluno</label>
            <input
              className="login-input"
              id="id-ativacao"
              value={idAtivacao}
              onChange={e => setIdAtivacao(e.target.value)}
              placeholder="Ex.: 123.456.789-00 ou matrícula"
              required
            />
            <label htmlFor="nova-senha">Crie sua senha</label>
            <input
              className="login-input"
              id="nova-senha"
              type="password"
              minLength={4}
              autoComplete="new-password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              required
            />
            <button className="primary" type="submit" disabled={salvandoSenha}>
              {salvandoSenha ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        <p className="login-ajuda">
          Seus dados são usados apenas para o acompanhamento escolar, conforme a LGPD.
        </p>
      </section>
    </main>
  );
}
