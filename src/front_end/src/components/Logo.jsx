export default function Logo({ variante = 'texto', className = '' }) {
  if (variante === 'simbolo') {
    return (
      <span className={`logo-simbolo ${className}`} aria-label="KFKA">
        <span className="colchete">[</span>K<span className="destaque">&lt;</span>
        <span className="colchete">]</span>
      </span>
    );
  }
  return (
    <span className={`logo-texto ${className}`} aria-label="KFKA">
      K F K <span className="destaque">Λ</span>
    </span>
  );
}
