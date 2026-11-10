import GrupoCheckbox from '../../components/GrupoCheckbox';
import { estaAtivo, mesmoTexto, separarLista } from '../../utils/formatadores';

function Campo({ nome, rotulo, dados, setCampo, tipo = 'text', obrigatorio = true, ...resto }) {
  return (
    <label className="field">
      {rotulo}
      <input
        name={nome}
        type={tipo}
        value={dados[nome] ?? ''}
        onChange={e => setCampo(nome, e.target.value)}
        required={obrigatorio}
        {...resto}
      />
    </label>
  );
}

function CampoSelect({ nome, rotulo, dados, setCampo, opcoes, vazio = 'Selecione...' }) {
  return (
    <label className="field">
      {rotulo}
      <select name={nome} value={dados[nome] ?? ''} onChange={e => setCampo(nome, e.target.value)} required>
        <option value="">{vazio}</option>
        {opcoes.map(o => {
          const valor = typeof o === 'string' ? o : o.valor;
          const texto = typeof o === 'string' ? o : o.texto;
          return (
            <option key={valor} value={valor}>
              {texto}
            </option>
          );
        })}
      </select>
    </label>
  );
}

const nomesAtivos = lista => lista.filter(estaAtivo).map(x => String(x.nome).trim());

function alunosNaTurma(alunos, nomeTurma, ignorarId) {
  return alunos.filter(a => estaAtivo(a) && mesmoTexto(a.serie, nomeTurma) && a.id !== ignorarId).length;
}

const AREAS = ['Ciências Exatas', 'Linguagens e Códigos', 'Ciências da Natureza', 'Ciências Humanas'];

export const CADASTROS = {
  turmas: {
    titulo: 'Cadastro e Vínculos de Turmas',
    singular: 'Turma',
    feminino: true,
    plural: 'Turmas',
    vazio: { ano: '2026', nome: '', turno: '', capacidade: '', disciplinas: [] },
    campos: ({ dados, setCampo, extras }) => (
      <>
        <CampoSelect nome="ano" rotulo="Ano letivo" dados={dados} setCampo={setCampo} opcoes={['2026', '2027']} />
        <Campo nome="nome" rotulo="Nome da sala / turma" dados={dados} setCampo={setCampo} placeholder="Ex.: 7º Ano A" />
        <CampoSelect nome="turno" rotulo="Turno" dados={dados} setCampo={setCampo} opcoes={['Manhã', 'Tarde', 'Integral']} />
        <Campo
          nome="capacidade"
          rotulo="Capacidade máxima de alunos"
          tipo="number"
          min="1"
          dados={dados}
          setCampo={setCampo}
          placeholder="Ex.: 30"
        />
        <GrupoCheckbox
          legenda="Disciplinas desta turma"
          nome="disciplinas"
          opcoes={nomesAtivos(extras.disciplinas)}
          selecionados={dados.disciplinas}
          onChange={v => setCampo('disciplinas', v)}
          vazio="Cadastre disciplinas primeiro em Áreas e Disciplinas."
        />
      </>
    ),
    paraFormulario: item => ({ ...item, ano: String(item.ano || '2026'), disciplinas: separarLista(item.disciplinas) }),
    validar: (dados, extras, editandoId) => {
      if (!dados.disciplinas.length) return 'Escolha ao menos uma disciplina para a turma.';
      if (Number(dados.capacidade) < 1) return 'A capacidade da turma deve ser maior que zero.';
      const duplicada = extras.turmas.find(
        t => t.id !== editandoId && mesmoTexto(t.nome, dados.nome) && String(t.ano) === String(dados.ano)
      );
      if (duplicada) return `Já existe a turma "${dados.nome}" no ano ${dados.ano}.`;
      if (editandoId) {
        const ocupacao = alunosNaTurma(extras.alunos, dados.nome);
        if (Number(dados.capacidade) < ocupacao) {
          return `A turma já tem ${ocupacao} ${ocupacao === 1 ? 'aluno matriculado' : 'alunos matriculados'}, então a capacidade não pode ser menor que isso.`;
        }
      }
      return null;
    },
    paraEnvio: dados => ({
      ano: dados.ano,
      nome: String(dados.nome).trim(),
      turno: dados.turno,
      capacidade: Number(dados.capacidade),
      disciplinas: dados.disciplinas.join(', ')
    }),
    colunas: ['Ano', 'Sala / Turma', 'Turno', 'Disciplinas associadas', 'Ocupação / Capacidade'],
    valores: (x, extras) => {
      const matriculados = alunosNaTurma(extras.alunos, x.nome);
      const cap = Number(x.capacidade) || 0;
      const lotada = cap > 0 && matriculados >= cap ? ' (LOTADA)' : '';
      return [x.ano || '2026', x.nome, x.turno, x.disciplinas, `${matriculados} / ${cap} alunos${lotada}`];
    },
    mensagemCriacao: d => `Sala "${d.nome}" criada! Agora você já pode vinculá-la aos professores e matricular alunos.`
  },

  disciplinas: {
    titulo: 'Cadastro de Áreas e Disciplinas',
    singular: 'Disciplina',
    feminino: true,
    plural: 'Disciplinas',
    vazio: { nome: '', area: '' },
    campos: ({ dados, setCampo, extras }) => {
      const areas = [...new Set([...AREAS, ...extras.disciplinas.map(d => d.area).filter(Boolean)])];
      return (
        <>
          <Campo nome="nome" rotulo="Nome da disciplina" dados={dados} setCampo={setCampo} placeholder="Ex.: Geografia" />
          <CampoSelect nome="area" rotulo="Área do conhecimento" dados={dados} setCampo={setCampo} opcoes={areas} />
        </>
      );
    },
    paraFormulario: item => ({ ...item }),
    validar: () => null,
    paraEnvio: d => ({ nome: String(d.nome).trim(), area: d.area }),
    colunas: ['Disciplina', 'Área do conhecimento'],
    valores: x => [x.nome, x.area]
  },

  professores: {
    titulo: 'Cadastro de Professores',
    singular: 'Professor',
    plural: 'Professores',
    vazio: { nome: '', ra: '', email: '', senha: '', turma: [], disciplina: [] },
    campos: ({ dados, setCampo, extras, editandoId }) => (
      <>
        <Campo nome="nome" rotulo="Nome do professor" dados={dados} setCampo={setCampo} placeholder="Ex.: Julio Cesar" />
        <Campo nome="ra" rotulo="Registro Acadêmico (RA - usado no login)" dados={dados} setCampo={setCampo} placeholder="Ex.: 102030" />
        <Campo nome="email" rotulo="E-mail do professor" tipo="email" dados={dados} setCampo={setCampo} placeholder="professor@kfka.com" />
        {!editandoId && (
          <Campo
            nome="senha"
            rotulo="Senha inicial (opcional - padrão 123456)"
            tipo="password"
            obrigatorio={false}
            dados={dados}
            setCampo={setCampo}
            autoComplete="new-password"
          />
        )}
        <GrupoCheckbox
          legenda="Salas / turmas em que o professor dá aula"
          nome="turma"
          opcoes={nomesAtivos(extras.turmas)}
          selecionados={dados.turma}
          onChange={v => setCampo('turma', v)}
          vazio="Nenhuma turma cadastrada. Crie as salas em Turmas primeiro."
        />
        <GrupoCheckbox
          legenda="Disciplinas lecionadas"
          nome="disciplina"
          opcoes={nomesAtivos(extras.disciplinas)}
          selecionados={dados.disciplina}
          onChange={v => setCampo('disciplina', v)}
        />
      </>
    ),
    paraFormulario: item => ({ ...item, senha: '', turma: separarLista(item.turma), disciplina: separarLista(item.disciplina) }),
    validar: (dados, extras) => {
      if (!dados.turma.length) return 'Marque ao menos uma sala de aula para o professor.';
      if (!dados.disciplina.length) return 'Marque ao menos uma disciplina lecionada.';
      const turmasSelecionadas = extras.turmas.filter(t => dados.turma.some(n => mesmoTexto(n, t.nome)));
      const ofertadas = turmasSelecionadas.flatMap(t => separarLista(t.disciplinas));
      const incompativeis = dados.disciplina.filter(d => !ofertadas.some(o => mesmoTexto(o, d)));
      if (incompativeis.length) {
        return `Vínculo incompatível: ${incompativeis.join(', ')} não é oferecida em nenhuma das turmas marcadas (${dados.turma.join(', ')}). Ajuste as disciplinas da turma ou do professor.`;
      }
      const texto = dados.turma.join(', ');
      if (texto.length > 80) return 'Muitas turmas selecionadas para um único cadastro (limite do campo).';
      return null;
    },
    paraEnvio: d => {
      const payload = {
        nome: String(d.nome).trim(),
        ra: String(d.ra).trim(),
        email: String(d.email).trim(),
        turma: d.turma.join(', '),
        disciplina: d.disciplina.join(', ')
      };
      if (d.senha) payload.senha = d.senha;
      return payload;
    },
    colunas: ['Professor', 'RA (login)', 'E-mail', 'Salas de aula', 'Disciplinas lecionadas'],
    valores: x => [x.nome, x.ra, x.email, x.turma || x.aulas, x.disciplina || '—'],
    mensagemCriacao: d => `Professor cadastrado! Ele já pode entrar com o RA ${d.ra}.`
  },

  alunos: {
    titulo: 'Cadastro de Alunos e Matrícula na Turma',
    singular: 'Aluno',
    plural: 'Alunos',
    vazio: { nome: '', matricula: '', serie: '', responsavel: '' },
    campos: ({ dados, setCampo, extras, editandoId }) => {
      const opcoesTurmas = extras.turmas.filter(estaAtivo).map(t => {
        const qtd = alunosNaTurma(extras.alunos, t.nome, editandoId);
        const cap = Number(t.capacidade) || 0;
        const lotada = cap > 0 && qtd >= cap ? ' - LOTADA' : '';
        return { valor: t.nome, texto: `${t.nome} (${qtd}/${cap} alunos${lotada})` };
      });
      return (
        <>
          <Campo nome="nome" rotulo="Nome do aluno" dados={dados} setCampo={setCampo} />
          <Campo nome="matricula" rotulo="Número de matrícula" dados={dados} setCampo={setCampo} />
          <CampoSelect
            nome="serie"
            rotulo="Sala / turma do aluno"
            dados={dados}
            setCampo={setCampo}
            opcoes={opcoesTurmas}
            vazio={opcoesTurmas.length ? 'Selecione a turma...' : 'Cadastre turmas primeiro'}
          />
          <label className="field">
            Responsável vinculado
            <input
              name="responsavel"
              list="lista-responsaveis"
              value={dados.responsavel ?? ''}
              onChange={e => setCampo('responsavel', e.target.value)}
              placeholder="Nome do responsável"
              required
            />
            <datalist id="lista-responsaveis">
              {extras.responsaveis.map(r => (
                <option key={r.id} value={r.nome} />
              ))}
            </datalist>
            <small>Pode ser cadastrado antes ou depois em Responsáveis.</small>
          </label>
        </>
      );
    },
    paraFormulario: item => ({ ...item }),
    validar: (dados, extras, editandoId) => {
      const turma = extras.turmas.find(t => mesmoTexto(t.nome, dados.serie));
      if (!turma) return 'Selecione uma turma cadastrada.';
      const cap = Number(turma.capacidade) || 0;
      const ocupacao = alunosNaTurma(extras.alunos, turma.nome, editandoId);
      if (cap > 0 && ocupacao >= cap) {
        return `A turma ${turma.nome} está lotada (${ocupacao}/${cap}). Aumente a capacidade ou escolha outra turma.`;
      }
      return null;
    },
    paraEnvio: d => ({
      nome: String(d.nome).trim(),
      matricula: String(d.matricula).trim(),
      serie: d.serie,
      responsavel: String(d.responsavel).trim()
    }),
    colunas: ['Nome do aluno', 'Matrícula', 'Sala / turma', 'Responsável vinculado'],
    valores: x => [x.nome, x.matricula, x.serie, x.responsavel]
  },

  responsaveis: {
    titulo: 'Cadastro de Responsáveis e Acesso',
    singular: 'Responsável',
    plural: 'Responsáveis',
    vazio: { nome: '', email: '', telefone: '', cpf: '', parentesco: '', aluno: [], senha: '' },
    campos: ({ dados, setCampo, extras, editandoId }) => (
      <>
        <Campo nome="nome" rotulo="Nome do responsável" dados={dados} setCampo={setCampo} />
        <Campo nome="email" rotulo="E-mail" tipo="email" dados={dados} setCampo={setCampo} />
        <Campo nome="telefone" rotulo="Telefone" tipo="tel" dados={dados} setCampo={setCampo} placeholder="(11) 90000-0000" />
        <Campo
          nome="cpf"
          rotulo="CPF (usado no login)"
          dados={dados}
          setCampo={setCampo}
          placeholder="000.000.000-00"
          pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
          title="Informe um CPF com 11 dígitos (ex.: 123.456.789-00)"
        />
        <CampoSelect
          nome="parentesco"
          rotulo="Grau de parentesco"
          dados={dados}
          setCampo={setCampo}
          opcoes={['Pai', 'Mãe', 'Avô/Avó', 'Responsável Legal']}
        />
        <Campo
          nome="senha"
          rotulo={editandoId ? 'Nova senha (opcional)' : 'Senha inicial (opcional - padrão 123456)'}
          tipo="password"
          obrigatorio={false}
          dados={dados}
          setCampo={setCampo}
          autoComplete="new-password"
        />
        <GrupoCheckbox
          legenda="Dependentes (alunos) vinculados - um responsável pode ter mais de um aluno"
          nome="aluno"
          opcoes={nomesAtivos(extras.alunos)}
          selecionados={dados.aluno}
          onChange={v => setCampo('aluno', v)}
          vazio="Cadastre os alunos primeiro."
        />
      </>
    ),
    paraFormulario: item => ({ ...item, senha: '', aluno: separarLista(item.aluno) }),
    validar: dados => {
      if (!dados.aluno.length) return 'Vincule ao menos um aluno ao responsável.';
      if (dados.aluno.join(', ').length > 120) return 'Muitos alunos vinculados para um único cadastro (limite do campo).';
      if (dados.senha && dados.senha.length < 4) return 'A senha deve ter pelo menos 4 caracteres.';
      return null;
    },
    paraEnvio: d => {
      const payload = {
        nome: String(d.nome).trim(),
        email: String(d.email).trim(),
        telefone: String(d.telefone).trim(),
        cpf: String(d.cpf).trim(),
        parentesco: d.parentesco,
        aluno: d.aluno.join(', ')
      };
      if (d.senha) payload.senha = d.senha;
      return payload;
    },
    colunas: ['Responsável', 'CPF (login)', 'E-mail', 'Telefone', 'Parentesco', 'Dependentes'],
    valores: x => [x.nome, x.cpf, x.email, x.telefone, x.parentesco, x.aluno],
    mensagemCriacao: d => `Responsável cadastrado! Ele já pode acessar o portal com o CPF ${d.cpf}.`
  },

  tags: {
    titulo: 'Cadastro de Tags de Acompanhamento',
    singular: 'Tag',
    feminino: true,
    plural: 'Tags',
    vazio: { nome: '', categoria: '' },
    campos: ({ dados, setCampo }) => (
      <>
        <Campo nome="nome" rotulo="Nome da tag" dados={dados} setCampo={setCampo} placeholder="Ex.: Participação ativa" />
        <CampoSelect
          nome="categoria"
          rotulo="Categoria"
          dados={dados}
          setCampo={setCampo}
          opcoes={['Positiva', 'Atenção', 'Desempenho']}
        />
      </>
    ),
    paraFormulario: item => ({ ...item }),
    validar: () => null,
    paraEnvio: d => ({ nome: String(d.nome).trim(), categoria: d.categoria }),
    colunas: ['Tag', 'Categoria'],
    valores: x => [x.nome, x.categoria || 'Desempenho']
  }
};
