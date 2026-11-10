import { formatarDataHora } from '../utils/formatadores';
import StatusBadge from './StatusBadge';
import { ROTULO_STATUS } from '../config';

export default function HistoricoRegistro({ eventos }) {
  if (!eventos.length) return <p className="muted">Sem eventos registrados.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Data/Hora</th>
            <th scope="col">Usuário (perfil)</th>
            <th scope="col">Anterior</th>
            <th scope="col">Posterior</th>
            <th scope="col">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map(h => (
            <tr key={h.id}>
              <td>{formatarDataHora(h.data_hora)}</td>
              <td>
                {h.usuario} ({h.perfil})
              </td>
              <td>{ROTULO_STATUS[h.estado_anterior] || h.estado_anterior}</td>
              <td>
                <StatusBadge status={h.estado_posterior} />
              </td>
              <td>{h.detalhes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
