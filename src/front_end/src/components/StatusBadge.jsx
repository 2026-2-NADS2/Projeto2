import { ROTULO_STATUS } from '../config';

const CLASSE = {
  'Em revisão': 'Revisao',
  Pendente: 'Pendente',
  Publicado: 'Publicado',
  Devolvido: 'Devolvido',
  Rascunho: 'Rascunho',
  Cancelado: 'Cancelado',
  Ativo: 'Ativo',
  Inativo: 'Inativo'
};

export default function StatusBadge({ status, prefixo = '' }) {
  return (
    <span className={`badge ${CLASSE[status] || ''}`}>
      {prefixo}
      {ROTULO_STATUS[status] || status}
    </span>
  );
}
