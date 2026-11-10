export default function ErroCarregamento({ mensagem, onTentarNovamente }) {
  return (
    <div className="message error" role="alert">
      <span>{mensagem}</span>
      {onTentarNovamente && (
        <button type="button" className="small-button" onClick={onTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
