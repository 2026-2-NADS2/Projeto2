import { Routes, Route } from 'react-router-dom';
import RotaProtegida from './components/RotaProtegida';

import Home from './pages/Home';
import EscolhaPerfil from './pages/EscolhaPerfil';
import Acesso from './pages/Acesso';
import NaoEncontrada from './pages/NaoEncontrada';

import MenuAdmin from './pages/admin/MenuAdmin';
import Cadastro from './pages/admin/Cadastro';
import Bimestres from './pages/admin/Bimestres';
import Revisao from './pages/admin/Revisao';
import Relatorios from './pages/admin/Relatorios';

import PortalProfessor from './pages/professor/PortalProfessor';
import PortalResponsavel from './pages/responsavel/PortalResponsavel';

const somenteAdmin = elemento => <RotaProtegida perfis={['administrador']}>{elemento}</RotaProtegida>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<EscolhaPerfil />} />
      <Route path="/login/:perfil" element={<Acesso />} />

      <Route path="/administrador" element={somenteAdmin(<MenuAdmin />)} />
      <Route path="/administrador/bimestres" element={somenteAdmin(<Bimestres />)} />
      <Route path="/administrador/revisao" element={somenteAdmin(<Revisao />)} />
      <Route path="/administrador/relatorios" element={somenteAdmin(<Relatorios />)} />
      <Route path="/administrador/:entidade" element={somenteAdmin(<Cadastro />)} />

      <Route
        path="/professor"
        element={
          <RotaProtegida perfis={['professor']}>
            <PortalProfessor />
          </RotaProtegida>
        }
      />

      <Route
        path="/responsavel"
        element={
          <RotaProtegida perfis={['responsavel']}>
            <PortalResponsavel />
          </RotaProtegida>
        }
      />

      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  );
}
