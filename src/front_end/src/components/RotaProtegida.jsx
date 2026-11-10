import { Navigate, useLocation } from 'react-router-dom';
import { obterSessao } from '../services/sessao';
import { HOME_DO_PERFIL } from '../config';

export default function RotaProtegida({ perfis, children }) {
  const sessao = obterSessao();
  const location = useLocation();

  if (!sessao) {
    return <Navigate to="/login" replace state={{ de: location.pathname, expirou: true }} />;
  }

  if (perfis && !perfis.includes(sessao.perfil)) {
    return <Navigate to={HOME_DO_PERFIL[sessao.perfil] || '/login'} replace />;
  }

  return children;
}
