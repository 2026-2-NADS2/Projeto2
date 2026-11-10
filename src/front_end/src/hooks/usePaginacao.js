import { useEffect, useMemo, useState } from 'react';

export default function usePaginacao(lista, itensPorPagina = 8) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina));

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  const itensPagina = useMemo(
    () => lista.slice((pagina - 1) * itensPorPagina, pagina * itensPorPagina),
    [lista, pagina, itensPorPagina]
  );

  return { pagina, setPagina, totalPaginas, itensPagina };
}
