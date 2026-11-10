import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const recursos = [
  {
    icone: '/img/icone-alunos.png',
    titulo: 'Alunos',
    texto: 'Consulte notas, frequência e avisos.'
  },
  {
    icone: '/img/icone-professores.png',
    titulo: 'Professores',
    texto: 'Acompanhe turmas, avaliações e alunos.'
  },
  {
    icone: '/img/icone-gestao.png',
    titulo: 'Gestão',
    texto: 'Gerencie a escola e aprove boletins.'
  }
];

const estiloHero = { '--hero-imagem': "url('/img/hero-estudantes.jpg')" };

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <Link to="/" aria-label="KFKA - página inicial">
          <Logo variante="simbolo" />
        </Link>
        <Link to="/login" className="home-btn home-btn-topo">
          Entrar
        </Link>
      </header>

      <main>
        <section className="home-hero" style={estiloHero}>
          <div className="home-hero-conteudo">
            <h1>
              Acompanhar a vida escolar ficou <span>mais fácil.</span>
            </h1>
            <p>Uma plataforma feita para aproximar alunos, professores e gestão escolar.</p>
          </div>
        </section>

        <section className="home-recursos" aria-labelledby="titulo-recursos">
          <h2 id="titulo-recursos">
            Tudo que você precisa em <span>um só lugar.</span>
          </h2>
          <div className="home-recursos-grid">
            {recursos.map(r => (
              <article key={r.titulo} className="home-card">
                <img src={r.icone} alt="" width="56" height="56" />
                <h3>{r.titulo}</h3>
                <p>{r.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-sobre" aria-labelledby="titulo-sobre">
          <div className="home-sobre-texto">
            <h2 id="titulo-sobre">
              A tecnologia a favor da <span>educação.</span>
            </h2>
            <p>
              Com o KFKA Tech, você tem acesso rápido e intuitivo às principais informações da sua vida escolar, em
              qualquer lugar.
            </p>
            <Link to="/login" className="home-btn">
              Acesse agora <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="home-sobre-imagem">
            <img src="/img/ilustracao-livro.png" alt="Ilustração de um livro aberto" />
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Logo />
      </footer>
    </div>
  );
}
