import { Link, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';

const perfis = [
  { id: 'responsavel', rotulo: 'RESPONSÁVEL' },
  { id: 'professor', rotulo: 'PROFESSOR' },
  { id: 'administrador', rotulo: 'ADMINISTRADOR' }
];

export default function EscolhaPerfil() {
  const location = useLocation();
  const expirou = location.state?.expirou;

  return (
    <main className="login">
      <section className="login-box">
        <h1 className="login-logo">
          <Logo />
        </h1>
        {expirou && (
          <div className="message error" role="alert">
            Faça login para continuar (sessão inexistente ou expirada).
          </div>
        )}
        <p className="login-subtitulo">Selecione o seu perfil de acesso</p>
        <nav className="role-choice" aria-label="Perfis de acesso">
          {perfis.map(p => (
            <Link key={p.id} className="login-input role-link" to={`/login/${p.id}`}>
              {p.rotulo}
            </Link>
          ))}
        </nav>
        <Link to="/" className="login-voltar">
          ← Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}
