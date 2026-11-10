import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const itensMenu = [
  { rota: 'turmas', rotulo: 'Turmas / Salas', descricao: 'Ano, turno, capacidade e disciplinas' },
  { rota: 'disciplinas', rotulo: 'Áreas e Disciplinas', descricao: 'Disciplinas classificadas por área' },
  { rota: 'professores', rotulo: 'Professores', descricao: 'Vínculo professor × turma × disciplina' },
  { rota: 'alunos', rotulo: 'Alunos', descricao: 'Matrícula do aluno na turma' },
  { rota: 'responsaveis', rotulo: 'Responsáveis', descricao: 'Acesso e vínculo com os alunos' },
  { rota: 'tags', rotulo: 'Tags de Acompanhamento', descricao: 'Classificação dos registros' },
  { rota: 'bimestres', rotulo: 'Períodos Bimestrais', descricao: 'Janelas de digitação dos 4 bimestres' },
  { rota: 'revisao', rotulo: 'Revisão e Publicação', descricao: 'Revisar, devolver e publicar' },
  { rota: 'relatorios', rotulo: 'Relatórios, Auditoria e Excel', descricao: 'Indicadores, histórico e exportação' }
];

export default function MenuAdmin() {
  return (
    <Layout titulo="Central de Cadastros e Gestão Escolar">
      <h2 className="title">SELECIONE A ÁREA DE GESTÃO ESCOLAR</h2>
      <nav className="menu" aria-label="Áreas de gestão">
        {itensMenu.map(item => (
          <Link key={item.rota} className="menu-tile" to={`/administrador/${item.rota}`}>
            {item.rotulo}
            <small>{item.descricao}</small>
          </Link>
        ))}
      </nav>
    </Layout>
  );
}
