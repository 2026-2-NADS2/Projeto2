export default function Chips({ itens = [] }) {
  if (!itens.length) return null;
  return (
    <div className="chips">
      {itens.map(t => (
        <span key={t} className="chip">
          {t}
        </span>
      ))}
    </div>
  );
}
