import Chips from '../../components/Chips';
import StatusBadge from '../../components/StatusBadge';
import { formatarDataHora, formatarMedia } from '../../utils/formatadores';

export default function FichaAcompanhamento({ item, podeEditar, podeExcluir, onEditar, onExcluir }) {
  return (
    <article className="record">
      <div className="record-head">
        <strong>
          ALUNO: {item.aluno} · SALA: {item.turma} · {item.disciplina} ({item.bimestre})
        </strong>
        <StatusBadge status={item.status} prefixo="STATUS: " />
      </div>

      <Chips itens={item.tags} />
      <p>
        <strong>Média bimestral:</strong> {formatarMedia(item.media)}
      </p>
      <p>
        <strong>Avaliação:</strong> {item.descricao}
      </p>
      <p className="muted">Última atualização: {formatarDataHora(item.atualizado_em)}</p>

      {item.feedback_admin && (
        <div className={`message ${item.status === 'Devolvido' ? 'error' : 'info'}`}>
          <span>
            <strong>Retorno da coordenação:</strong> {item.feedback_admin}
          </span>
        </div>
      )}

      {(item.ciencia_data || item.observacao_responsavel) && (
        <div className="message success">
          <span>
            <strong>Retorno do responsável: </strong>
            {item.ciencia_data && `Ciência confirmada em ${item.ciencia_data}. `}
            {item.observacao_responsavel && `Mensagem: "${item.observacao_responsavel}"`}
          </span>
        </div>
      )}

      {(podeEditar || podeExcluir) && (
        <div className="record-actions">
          {podeEditar && (
            <button type="button" className="small-button" onClick={() => onEditar(item.id)}>
              {item.status === 'Devolvido' ? 'Ajustar e reenviar' : 'Editar'}
            </button>
          )}
          {podeExcluir && (
            <button type="button" className="small-button danger" onClick={() => onExcluir(item)}>
              Excluir rascunho
            </button>
          )}
        </div>
      )}
    </article>
  );
}
