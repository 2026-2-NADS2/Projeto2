import { useEffect, useRef } from 'react';

export default function Aviso({ aviso, onFechar }) {
  const ref = useRef(null);

  useEffect(() => {
    if (aviso && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [aviso]);

  if (!aviso) return null;

  return (
    <div ref={ref} className={`message ${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
      <span>{aviso.mensagem}</span>
      {onFechar && (
        <button type="button" className="message-fechar" onClick={onFechar} aria-label="Fechar mensagem">
          ×
        </button>
      )}
    </div>
  );
}
