import { Link, useNavigate } from 'react-router-dom';
import { HOME_DO_PERFIL, ANO_LETIVO_PADRAO } from '../config';
import { obterSessao, encerrarSessao } from '../services/sessao';
import Logo from './Logo';
import Aviso from './Aviso';

export default function Layout({ titulo, children, aviso, onFecharAviso }) {
  const navigate = useNavigate();
  const sessao = obterSessao();
  const home = sessao ? HOME_DO_PERFIL[sessao.perfil] : '/';
  const ehResponsavel = sessao?.perfil === 'responsavel';

  function sair() {
    encerrarSessao();
    navigate('/login');
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <Link className="brand" to={home} aria-label="KFKA - início">
            <Logo />
          </Link>
          <div className="contexto-usuario">
            {ehResponsavel ? (
              <span>Ano Letivo: {ANO_LETIVO_PADRAO}</span>
            ) : (
              <span>Usuário: {sessao?.nome || 'Visitante'}</span>
            )}
          </div>
        </div>
        <h1 className="heading">{titulo}</h1>
        <nav className="right" aria-label="Navegação principal">
          <Link className="home-link" to={home}>
            Início
          </Link>
          <button type="button" className="link-sair" onClick={sair}>
            Sair
          </button>
        </nav>
      </header>
      <main className="content">
        <Aviso aviso={aviso} onFechar={onFecharAviso} />
        {children}
      </main>
    </div>
  );
}
