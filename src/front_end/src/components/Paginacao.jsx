export default function Paginacao({ pagina, totalPaginas, onMudar, total }) {
  if (totalPaginas <= 1) return null;
  return (
    <nav className="paginacao" aria-label="Paginação">
      <button type="button" className="small-button secondary" disabled={pagina <= 1} onClick={() => onMudar(pagina - 1)}>
        ← Anterior
      </button>
      <span>
        Página {pagina} de {totalPaginas}
        {total !== undefined && ` · ${total} ${total === 1 ? 'registro' : 'registros'}`}
      </span>
      <button
        type="button"
        className="small-button secondary"
        disabled={pagina >= totalPaginas}
        onClick={() => onMudar(pagina + 1)}
      >
        Próxima →
      </button>
    </nav>
  );
}
