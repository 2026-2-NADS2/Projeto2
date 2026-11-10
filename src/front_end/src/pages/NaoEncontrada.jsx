import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NaoEncontrada() {
  return (
    <main className="login">
      <section className="login-box">
        <h1 className="login-logo">
          <Logo />
        </h1>
        <h2>404 · Página não encontrada</h2>
        <p>Este endereço não existe.</p>
        <Link className="primary" to="/">
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
