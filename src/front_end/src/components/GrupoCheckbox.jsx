import { mesmoTexto } from '../utils/formatadores';

export default function GrupoCheckbox({ legenda, nome, opcoes, selecionados, onChange, vazio }) {
  const marcado = opcao => selecionados.some(s => mesmoTexto(s, opcao));

  function alternar(opcao) {
    onChange(marcado(opcao) ? selecionados.filter(s => !mesmoTexto(s, opcao)) : [...selecionados, opcao]);
  }

  return (
    <fieldset className="wide field fieldset">
      <legend>{legenda}</legend>
      <div className="check-row">
        {opcoes.length === 0 && <span className="muted">{vazio || 'Nenhuma opção cadastrada.'}</span>}
        {opcoes.map(opcao => (
          <label key={opcao}>
            <input type="checkbox" name={nome} value={opcao} checked={marcado(opcao)} onChange={() => alternar(opcao)} />
            {opcao}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
