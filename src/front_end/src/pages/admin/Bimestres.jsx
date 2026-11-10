import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Carregando from '../../components/Carregando';
import ErroCarregamento from '../../components/ErroCarregamento';
import useAviso from '../../hooks/useAviso';
import { bimestreAbertoAgora, formatarDataHora, paraDataHoraMysql, paraInputDataHora } from '../../utils/formatadores';

export default function Bimestres() {
  const { aviso, mostrarAviso, limparAviso } = useAviso();
  const [bimestres, setBimestres] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const lista = await api.listar('bimestres');
      setBimestres([...lista].sort((a, b) => a.id - b.id));
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(id, valores) {
    if (new Date(valores.data_encerramento) <= new Date(valores.data_abertura)) {
      mostrarAviso('O encerramento deve ser depois da abertura.', 'error');
      return;
    }
    try {
      await api.atualizar('bimestres', id, {
        data_abertura: paraDataHoraMysql(valores.data_abertura),
        data_encerramento: paraDataHoraMysql(valores.data_encerramento),
        aberto: Number(valores.aberto)
      });
      await carregar();
      mostrarAviso('Período bimestral atualizado com sucesso!');
    } catch (err) {
      mostrarAviso(err.message, 'error');
    }
  }

  return (
    <Layout titulo="Períodos de Digitação dos Bimestres" aviso={aviso} onFecharAviso={limparAviso}>
      <h2 className="section-title section-title-topo">Configurar as janelas de digitação dos 4 bimestres</h2>

      {carregando && !bimestres.length ? (
        <Carregando texto="Carregando períodos bimestrais..." />
      ) : erro ? (
        <ErroCarregamento mensagem={erro} onTentarNovamente={carregar} />
      ) : (
        <div className="cards">
          {bimestres.map(b => (
            <FormBimestre key={`${b.id}-${b.data_abertura}-${b.data_encerramento}-${b.aberto}`} bimestre={b} onSalvar={salvar} />
          ))}
        </div>
      )}
    </Layout>
  );
}

function FormBimestre({ bimestre, onSalvar }) {
  const [valores, setValores] = useState({
    data_abertura: paraInputDataHora(bimestre.data_abertura),
    data_encerramento: paraInputDataHora(bimestre.data_encerramento),
    aberto: String(Number(bimestre.aberto))
  });
  const [salvando, setSalvando] = useState(false);
  const abertoAgora = bimestreAbertoAgora(bimestre);

  const set = campo => e => setValores(v => ({ ...v, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setSalvando(true);
    await onSalvar(bimestre.id, valores);
    setSalvando(false);
  }

  return (
    <form className="record" onSubmit={enviar}>
      <div className="record-head">
        <strong>
          {bimestre.nome} ({bimestre.ano})
        </strong>
        <span className={`badge ${abertoAgora ? 'Publicado' : 'Devolvido'}`}>
          {abertoAgora ? 'Digitação aberta agora' : 'Digitação fechada'}
        </span>
      </div>
      <p className="muted">
        Período atual: {formatarDataHora(bimestre.data_abertura)} até {formatarDataHora(bimestre.data_encerramento)}
      </p>
      <div className="form-grid">
        <label className="field">
          Abertura da digitação
          <input type="datetime-local" value={valores.data_abertura} onChange={set('data_abertura')} required />
        </label>
        <label className="field">
          Encerramento da digitação
          <input type="datetime-local" value={valores.data_encerramento} onChange={set('data_encerramento')} required />
        </label>
        <label className="field">
          Status do período
          <select value={valores.aberto} onChange={set('aberto')}>
            <option value="1">Liberado para professores</option>
            <option value="0">Bloqueado</option>
          </select>
        </label>
      </div>
      <div className="record-actions">
        <button className="small-button" type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar período'}
        </button>
      </div>
    </form>
  );
}
