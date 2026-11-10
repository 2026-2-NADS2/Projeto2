export const normalizarTexto = txt => String(txt ?? '').trim().toLowerCase();

export const mesmoTexto = (a, b) => normalizarTexto(a) === normalizarTexto(b);

export const separarLista = txt =>
  String(txt ?? '')
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean);

export const estaAtivo = item => item.ativo === undefined || item.ativo === null || Boolean(Number(item.ativo));

export const formatarMedia = valor => {
  const n = Number(valor);
  return Number.isNaN(n) ? '—' : n.toFixed(1).replace('.', ',');
};

export const calcularMedia = lista =>
  lista.length ? lista.reduce((acc, x) => acc + Number(x.media || 0), 0) / lista.length : null;

export function paraInputDataHora(valor) {
  if (!valor) return '';
  const data = new Date(String(valor).includes('T') ? valor : String(valor).replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) return '';
  const p = n => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}T${p(data.getHours())}:${p(data.getMinutes())}`;
}

export const paraDataHoraMysql = valorInput => `${String(valorInput).replace('T', ' ')}:00`;

export function formatarDataHora(valor) {
  if (!valor) return '—';
  const data = new Date(String(valor).includes('T') ? valor : String(valor).replace(' ', 'T'));
  return Number.isNaN(data.getTime()) ? String(valor) : data.toLocaleString('pt-BR');
}

export function bimestreAbertoAgora(bimestre) {
  if (!bimestre || !Number(bimestre.aberto)) return false;
  const agora = new Date();
  const inicio = new Date(paraInputDataHora(bimestre.data_abertura));
  const fim = new Date(paraInputDataHora(bimestre.data_encerramento));
  return agora >= inicio && agora <= fim;
}
