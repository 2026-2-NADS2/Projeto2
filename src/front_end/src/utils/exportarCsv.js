function celula(valor) {
  const texto = String(valor ?? '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
  return `"${texto}"`;
}

export function exportarCsv(nomeArquivo, cabecalho, linhas) {
  const conteudo =
    '﻿' + [cabecalho.map(celula).join(';'), ...linhas.map(l => l.map(celula).join(';'))].join('\r\n');

  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
