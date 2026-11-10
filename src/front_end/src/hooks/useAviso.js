import { useCallback, useState } from 'react';

export default function useAviso() {
  const [aviso, setAviso] = useState(null);

  const mostrarAviso = useCallback((mensagem, tipo = 'success') => {
    setAviso({ mensagem, tipo, chave: Date.now() });
  }, []);

  const limparAviso = useCallback(() => setAviso(null), []);

  return { aviso, mostrarAviso, limparAviso };
}
