import { useMemo, useState } from 'react';
import usePaginacao from '../hooks/usePaginacao';
import { normalizarTexto } from '../utils/formatadores';
import Paginacao from './Paginacao';
import StatusBadge from './StatusBadge';

export default function TabelaCrud({ colunas, linhas, onEditar, onAlternarAtivo, onExcluir }) {
  const [busca, setBusca] = useState('');

  const filtradas = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return linhas;
    return linhas.filter(l => l.valores.some(v => normalizarTexto(v).includes(termo)));
  }, [linhas, busca]);

  const { pagina, setPagina, totalPaginas, itensPagina } = usePaginacao(filtradas, 8);

  if (!linhas.length) {
    return <div className="panel">Nenhum registro cadastrado no banco de dados.</div>;
  }

  return (
    <div className="table-box">
      <div className="table-toolbar">
        <label className="busca">
          <span className="sr-only">Buscar na tabela</span>
          <input
            type="search"
            placeholder="Buscar..."
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
        </label>
        <span className="muted">
          {filtradas.length} {filtradas.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {colunas.map(c => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
              <th scope="col">Status</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {itensPagina.map(l => (
              <tr key={l.id}>
                {l.valores.map((v, i) => (
                  <td key={colunas[i]} data-label={colunas[i]}>
                    {v}
                  </td>
                ))}
                <td data-label="Status">
                  <StatusBadge status={l.ativo ? 'Ativo' : 'Inativo'} />
                </td>
                <td data-label="Ações">
                  <div className="table-actions">
                    <button type="button" className="small-button" onClick={() => onEditar(l.id)}>
                      Editar
                    </button>
                    <button type="button" className="small-button secondary" onClick={() => onAlternarAtivo(l.id, l.ativo)}>
                      {l.ativo ? 'Inativar' : 'Ativar'}
                    </button>
                    <button type="button" className="small-button danger" onClick={() => onExcluir(l.id)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!itensPagina.length && (
              <tr>
                <td colSpan={colunas.length + 2}>Nenhum registro encontrado para "{busca}".</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
    </div>
  );
}
