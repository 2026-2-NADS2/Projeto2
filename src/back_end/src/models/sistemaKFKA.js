const crypto = require('crypto');
const pool = require('../config/db');

const SENHA_PADRAO = '123456';

function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(senha), salt, 32).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function senhaConfere(senhaDigitada, senhaSalva) {
  const salva = String(senhaSalva || '');
  if (!salva.startsWith('scrypt$')) {
    return salva === String(senhaDigitada);
  }
  const [, salt, hash] = salva.split('$');
  const calculado = crypto.scryptSync(String(senhaDigitada), salt, 32);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}

const STATUS_VALIDOS = ['Rascunho', 'Pendente', 'Em revisão', 'Devolvido', 'Publicado', 'Cancelado'];
const STATUS_EDITAVEIS_PROFESSOR = ['Rascunho', 'Pendente', 'Devolvido'];

class EntidadeBase {
  constructor(tabela) {
    this.tabela = tabela;
  }

  async listarTodos(ordem = 'id DESC') {
    const [rows] = await pool.query(`SELECT * FROM ${this.tabela} ORDER BY ${ordem}`);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(`SELECT * FROM ${this.tabela} WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  async remover(id) {
    const [res] = await pool.query(`DELETE FROM ${this.tabela} WHERE id = ?`, [id]);
    return res.affectedRows > 0;
  }
}

class SistemaKFKA {
  constructor() {
    this.turmas = new EntidadeBase('turmas');
    this.disciplinas = new EntidadeBase('disciplinas');
    this.professores = new EntidadeBase('professores');
    this.responsaveis = new EntidadeBase('responsaveis');
    this.alunos = new EntidadeBase('alunos');
    this.tags = new EntidadeBase('tags');
    this.bimestres = new EntidadeBase('bimestres');
  }

  async autenticar(identificador, senha, perfil) {
    const idLimpo = String(identificador || '').trim();
    const senhaLimpa = String(senha || '').trim();

    let [rows] = await pool.query(
      `SELECT id, nome, identificador, email, perfil, ativo, senha
       FROM usuarios
       WHERE (identificador = ? OR email = ?) AND perfil = ?`,
      [idLimpo, idLimpo, perfil]
    );

    if (!rows.length && perfil === 'responsavel') {
      const [respRows] = await pool.query(
        `SELECT r.* FROM responsaveis r
         LEFT JOIN alunos a ON (a.responsavel = r.nome OR a.nome = r.aluno)
         WHERE r.cpf = ? OR r.email = ? OR a.matricula = ?
         LIMIT 1`,
        [idLimpo, idLimpo, idLimpo]
      );

      if (respRows.length) {
        const resp = respRows[0];
        const [uRows] = await pool.query(
          `SELECT * FROM usuarios WHERE identificador = ? AND perfil = 'responsavel'`,
          [resp.cpf]
        );

        if (uRows.length) {
          rows = uRows;
        } else {
          const [ins] = await pool.query(
            `INSERT INTO usuarios (nome, identificador, email, senha, perfil, ativo)
             VALUES (?, ?, ?, ?, 'responsavel', 1)`,
            [resp.nome, resp.cpf, resp.email, gerarHashSenha(SENHA_PADRAO)]
          );
          rows = [
            {
              id: ins.insertId,
              nome: resp.nome,
              identificador: resp.cpf,
              email: resp.email,
              perfil: 'responsavel',
              ativo: 1,
              senha: gerarHashSenha(SENHA_PADRAO)
            }
          ];
        }
      }
    }

    if (!rows.length && perfil === 'professor') {
      const [profRows] = await pool.query(
        `SELECT * FROM professores WHERE ra = ? OR email = ? LIMIT 1`,
        [idLimpo, idLimpo]
      );
      if (profRows.length) {
        const prof = profRows[0];
        const [ins] = await pool.query(
          `INSERT IGNORE INTO usuarios (nome, identificador, email, senha, perfil, ativo)
           VALUES (?, ?, ?, ?, 'professor', 1)`,
          [prof.nome, prof.ra, prof.email, gerarHashSenha(SENHA_PADRAO)]
        );
        const [uRows] = await pool.query(
          `SELECT * FROM usuarios WHERE identificador = ? AND perfil = 'professor'`,
          [prof.ra]
        );
        rows = uRows;
      }
    }

    if (!rows.length) {
      throw new Error('Usuário ou matrícula não encontrados para este perfil.');
    }

    const usuario = rows[0];
    if (!senhaConfere(senhaLimpa, usuario.senha)) {
      throw new Error('Senha incorreta. Se for seu primeiro acesso, clique em "Criar / Definir Senha".');
    }

    if (!String(usuario.senha).startsWith('scrypt$')) {
      await pool.query(`UPDATE usuarios SET senha = ? WHERE id = ?`, [gerarHashSenha(senhaLimpa), usuario.id]);
    }

    if (!usuario.ativo) {
      throw new Error('Esta conta está inativa. Contate a coordenação.');
    }

    delete usuario.senha;
    return usuario;
  }

  async definirSenhaResponsavel(identificador, novaSenha) {
    const idLimpo = String(identificador || '').trim();
    const senhaLimpa = String(novaSenha || '').trim();

    if (!idLimpo || senhaLimpa.length < 4) {
      throw new Error('Informe o CPF ou Matrícula do aluno e uma senha de pelo menos 4 dígitos.');
    }

    const [respRows] = await pool.query(
      `SELECT r.* FROM responsaveis r
       LEFT JOIN alunos a ON (a.responsavel = r.nome OR a.nome = r.aluno)
       WHERE r.cpf = ? OR r.email = ? OR a.matricula = ?
       LIMIT 1`,
      [idLimpo, idLimpo, idLimpo]
    );

    if (!respRows.length) {
      throw new Error(
        'Responsável ou matrícula não encontrados! Peça ao Administrador para cadastrar o responsável primeiro.'
      );
    }

    const resp = respRows[0];

    const [existentes] = await pool.query(
      `SELECT id FROM usuarios WHERE identificador = ? AND perfil = 'responsavel'`,
      [resp.cpf]
    );

    if (existentes.length) {
      await pool.query(`UPDATE usuarios SET senha = ?, nome = ?, email = ? WHERE id = ?`, [
        gerarHashSenha(senhaLimpa),
        resp.nome,
        resp.email,
        existentes[0].id
      ]);
    } else {
      await pool.query(
        `INSERT INTO usuarios (nome, identificador, email, senha, perfil, ativo)
         VALUES (?, ?, ?, ?, 'responsavel', 1)`,
        [resp.nome, resp.cpf, resp.email, gerarHashSenha(senhaLimpa)]
      );
    }

    return {
      mensagem: `Senha criada com sucesso para ${resp.nome}! Agora você pode entrar usando seu CPF (${resp.cpf}) ou a matrícula do aluno.`
    };
  }

  async recuperarSenha(identificador) {
    const idLimpo = String(identificador || '').trim();
    const [rows] = await pool.query(
      `SELECT id, email, nome FROM usuarios WHERE identificador = ? OR email = ?`,
      [idLimpo, idLimpo]
    );
    if (!rows.length) {
      throw new Error('Identificador não localizado na base de usuários.');
    }
    const temporaria = String(crypto.randomInt(100000, 999999));
    await pool.query(`UPDATE usuarios SET senha = ? WHERE id = ?`, [gerarHashSenha(temporaria), rows[0].id]);
    return {
      mensagem: `Olá ${rows[0].nome}, uma senha temporária foi enviada para ${rows[0].email}. (Simulação do e-mail no MVP: senha temporária ${temporaria})`
    };
  }

  async listarEntidade(rota) {
    if (!this[rota]) throw new Error('Entidade inválida.');
    return await this[rota].listarTodos();
  }

  async buscarEntidadePorId(rota, id) {
    if (!this[rota]) throw new Error('Entidade inválida.');
    const item = await this[rota].buscarPorId(id);
    if (!item) throw new Error('Registro não encontrado.');
    return item;
  }

  async criarEntidade(rota, dados) {
    if (rota === 'turmas') {
      const { ano = '2026', nome, turno, capacidade, disciplinas } = dados;
      const [res] = await pool.query(
        `INSERT INTO turmas (ano, nome, turno, capacidade, disciplinas) VALUES (?, ?, ?, ?, ?)`,
        [ano, nome, turno, Number(capacidade), disciplinas]
      );
      return await this.turmas.buscarPorId(res.insertId);
    }

    if (rota === 'disciplinas') {
      const { nome, area } = dados;
      const [res] = await pool.query(
        `INSERT INTO disciplinas (nome, area) VALUES (?, ?)`,
        [nome, area]
      );
      return await this.disciplinas.buscarPorId(res.insertId);
    }

    if (rota === 'professores') {
      const { nome, ra, email, turma, disciplina, senha } = dados;
      const aulas = `${turma} • ${disciplina}`;
      const [res] = await pool.query(
        `INSERT INTO professores (nome, ra, email, turma, disciplina, aulas) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, ra, email, turma, disciplina, aulas]
      );

      const senhaInicial = senha && String(senha).trim() ? String(senha).trim() : SENHA_PADRAO;
      await pool.query(
        `INSERT INTO usuarios (nome, identificador, email, senha, perfil, ativo)
         VALUES (?, ?, ?, ?, 'professor', 1)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha = VALUES(senha)`,
        [nome, ra, email, gerarHashSenha(senhaInicial)]
      );

      return await this.professores.buscarPorId(res.insertId);
    }

    if (rota === 'responsaveis') {
      const { nome, email, telefone, cpf, parentesco, aluno, senha } = dados;
      const [res] = await pool.query(
        `INSERT INTO responsaveis (nome, email, telefone, cpf, parentesco, aluno) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, email, telefone, cpf, parentesco, aluno]
      );

      const senhaInicial = senha && String(senha).trim() ? String(senha).trim() : SENHA_PADRAO;
      await pool.query(
        `INSERT INTO usuarios (nome, identificador, email, senha, perfil, ativo)
         VALUES (?, ?, ?, ?, 'responsavel', 1)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha = VALUES(senha)`,
        [nome, cpf, email, gerarHashSenha(senhaInicial)]
      );

      return await this.responsaveis.buscarPorId(res.insertId);
    }

    if (rota === 'alunos') {
      const { nome, matricula, serie, responsavel } = dados;
      const [res] = await pool.query(
        `INSERT INTO alunos (nome, matricula, serie, responsavel) VALUES (?, ?, ?, ?)`,
        [nome, matricula, serie, responsavel]
      );
      return await this.alunos.buscarPorId(res.insertId);
    }

    if (rota === 'tags') {
      const { nome, categoria = 'Desempenho' } = dados;
      const [res] = await pool.query(
        `INSERT INTO tags (nome, categoria) VALUES (?, ?)`,
        [nome, categoria]
      );
      return await this.tags.buscarPorId(res.insertId);
    }

    throw new Error('Rota de criação inválida.');
  }

  async atualizarEntidade(rota, id, dados) {
    const atual = await this.buscarEntidadePorId(rota, id);

    if (Object.keys(dados).length === 1 && dados.ativo !== undefined) {
      await pool.query(`UPDATE ${rota} SET ativo = ? WHERE id = ?`, [Number(dados.ativo), id]);
      return await this.buscarEntidadePorId(rota, id);
    }

    if (rota === 'turmas') {
      const {
        ano = atual.ano,
        nome = atual.nome,
        turno = atual.turno,
        capacidade = atual.capacidade,
        disciplinas = atual.disciplinas
      } = dados;
      await pool.query(
        `UPDATE turmas SET ano = ?, nome = ?, turno = ?, capacidade = ?, disciplinas = ? WHERE id = ?`,
        [ano, nome, turno, Number(capacidade), disciplinas, id]
      );
    } else if (rota === 'disciplinas') {
      const { nome = atual.nome, area = atual.area } = dados;
      await pool.query(`UPDATE disciplinas SET nome = ?, area = ? WHERE id = ?`, [nome, area, id]);
    } else if (rota === 'professores') {
      const {
        nome = atual.nome,
        ra = atual.ra,
        email = atual.email,
        turma = atual.turma,
        disciplina = atual.disciplina
      } = dados;
      const aulas = `${turma} • ${disciplina}`;
      await pool.query(
        `UPDATE professores SET nome = ?, ra = ?, email = ?, turma = ?, disciplina = ?, aulas = ? WHERE id = ?`,
        [nome, ra, email, turma, disciplina, aulas, id]
      );
    } else if (rota === 'responsaveis') {
      const {
        nome = atual.nome,
        email = atual.email,
        telefone = atual.telefone,
        cpf = atual.cpf,
        parentesco = atual.parentesco,
        aluno = atual.aluno,
        senha
      } = dados;
      await pool.query(
        `UPDATE responsaveis SET nome = ?, email = ?, telefone = ?, cpf = ?, parentesco = ?, aluno = ? WHERE id = ?`,
        [nome, email, telefone, cpf, parentesco, aluno, id]
      );

      if (senha && String(senha).trim()) {
        await pool.query(
          `INSERT INTO usuarios (nome, identificador, email, senha, perfil, ativo)
           VALUES (?, ?, ?, ?, 'responsavel', 1)
           ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha = VALUES(senha)`,
          [nome, cpf, email, gerarHashSenha(String(senha).trim())]
        );
      } else {
        await pool.query(
          `UPDATE usuarios SET nome = ?, email = ?, identificador = ? WHERE identificador = ? AND perfil = 'responsavel'`,
          [nome, email, cpf, atual.cpf]
        );
      }
    } else if (rota === 'alunos') {
      const {
        nome = atual.nome,
        matricula = atual.matricula,
        serie = atual.serie,
        responsavel = atual.responsavel
      } = dados;
      await pool.query(
        `UPDATE alunos SET nome = ?, matricula = ?, serie = ?, responsavel = ? WHERE id = ?`,
        [nome, matricula, serie, responsavel, id]
      );
    } else if (rota === 'tags') {
      const { nome = atual.nome, categoria = atual.categoria } = dados;
      await pool.query(`UPDATE tags SET nome = ?, categoria = ? WHERE id = ?`, [
        nome,
        categoria,
        id
      ]);
    } else if (rota === 'bimestres') {
      const {
        data_abertura = atual.data_abertura,
        data_encerramento = atual.data_encerramento,
        aberto = atual.aberto
      } = dados;
      await pool.query(
        `UPDATE bimestres SET data_abertura = ?, data_encerramento = ?, aberto = ? WHERE id = ?`,
        [data_abertura, data_encerramento, Number(aberto), id]
      );
    }

    return await this.buscarEntidadePorId(rota, id);
  }

  async removerEntidade(rota, id) {
    if (!this[rota]) throw new Error('Entidade inválida.');
    const ok = await this[rota].remover(id);
    if (!ok) throw new Error('Registro não encontrado para exclusão.');
    return { mensagem: 'Registro removido com sucesso.' };
  }

  _formatarAcompanhamento(row) {
    if (!row) return null;
    let tagsArray = [];
    try {
      tagsArray = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [];
    } catch {
      tagsArray = String(row.tags || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    return { ...row, tags: tagsArray };
  }

  async listarAcompanhamentos(filtros = {}) {
    let sql = `SELECT * FROM acompanhamentos WHERE 1=1`;
    const params = [];

    if (filtros.status) {
      sql += ` AND status = ?`;
      params.push(filtros.status);
    }
    if (filtros.bimestre) {
      sql += ` AND bimestre = ?`;
      params.push(filtros.bimestre);
    }
    if (filtros.aluno) {
      sql += ` AND aluno = ?`;
      params.push(filtros.aluno);
    }
    if (filtros.turma) {
      sql += ` AND turma = ?`;
      params.push(filtros.turma);
    }

    sql += ` ORDER BY id DESC`;
    const [rows] = await pool.query(sql, params);
    return rows.map(r => this._formatarAcompanhamento(r));
  }

  async buscarAcompanhamentoPorId(id) {
    const [rows] = await pool.query(`SELECT * FROM acompanhamentos WHERE id = ?`, [id]);
    if (!rows.length) throw new Error('Acompanhamento não encontrado.');
    return this._formatarAcompanhamento(rows[0]);
  }

  async _validarAcompanhamento({ aluno, disciplina, bimestre, media, descricao, status }, perfil) {
    if (!aluno || !disciplina || !bimestre || !String(descricao || '').trim()) {
      throw new Error('Campos obrigatórios: aluno, disciplina, bimestre e descrição.');
    }
    const nota = Number(media);
    if (media === '' || media === null || media === undefined || Number.isNaN(nota) || nota < 0 || nota > 10) {
      throw new Error('A média deve ser um número entre 0 e 10.');
    }
    if (status && !STATUS_VALIDOS.includes(status)) {
      throw new Error('Status inválido para o acompanhamento.');
    }
    if (perfil === 'professor') {
      const [bims] = await pool.query(`SELECT * FROM bimestres WHERE nome = ? LIMIT 1`, [bimestre]);
      const bim = bims[0];
      const agora = new Date();
      if (
        !bim ||
        !Number(bim.aberto) ||
        agora < new Date(bim.data_abertura) ||
        agora > new Date(bim.data_encerramento)
      ) {
        throw new Error(`O período de digitação do ${bimestre} está fechado. Fale com a coordenação.`);
      }
    }
  }

  async criarAcompanhamento(dados) {
    const {
      aluno,
      disciplina,
      turma = '6º Ano B',
      bimestre,
      ano = '2026',
      professor = 'Julio Cesar',
      media,
      tags = [],
      descricao,
      status = 'Rascunho',
      usuario_acao = professor,
      perfil = 'professor'
    } = dados;

    await this._validarAcompanhamento({ aluno, disciplina, bimestre, media, descricao, status }, perfil);

    const [duplicados] = await pool.query(
      `SELECT id FROM acompanhamentos
       WHERE aluno = ? AND disciplina = ? AND bimestre = ? AND ano = ? AND status <> 'Cancelado'`,
      [aluno, disciplina, bimestre, ano]
    );
    if (duplicados.length) {
      throw new Error(
        `Já existe um acompanhamento de ${disciplina} para ${aluno} no ${bimestre}/${ano} (registro #${duplicados[0].id}). Edite o registro existente.`
      );
    }

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : [tags]);

    const [res] = await pool.query(
      `INSERT INTO acompanhamentos
       (aluno, disciplina, turma, bimestre, ano, professor, media, tags, descricao, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [aluno, disciplina, turma, bimestre, ano, professor, Number(media), tagsJson, descricao, status]
    );

    await this.registrarAuditoria(
      res.insertId,
      usuario_acao,
      perfil,
      'Novo',
      status,
      `Registro criado pelo professor na turma ${turma}`
    );

    return await this.buscarAcompanhamentoPorId(res.insertId);
  }

  async atualizarAcompanhamento(id, dados) {
    const atual = await this.buscarAcompanhamentoPorId(id);

    if (dados.acao_responsavel) {
      const ciencia = dados.ciencia_data !== undefined ? dados.ciencia_data : atual.ciencia_data;
      const obs =
        dados.observacao_responsavel !== undefined
          ? dados.observacao_responsavel
          : atual.observacao_responsavel;

      await pool.query(
        `UPDATE acompanhamentos SET ciencia_data = ?, observacao_responsavel = ? WHERE id = ?`,
        [ciencia, obs, id]
      );

      await this.registrarAuditoria(
        id,
        'Responsável da Família',
        'responsavel',
        atual.status,
        atual.status,
        dados.ciencia_data ? 'Responsável confirmou ciência do boletim' : 'Responsável enviou observação'
      );

      return await this.buscarAcompanhamentoPorId(id);
    }

    const {
      aluno = atual.aluno,
      disciplina = atual.disciplina,
      turma = atual.turma,
      bimestre = atual.bimestre,
      media = atual.media,
      tags = atual.tags,
      descricao = atual.descricao,
      status = atual.status,
      feedback_admin = atual.feedback_admin,
      usuario_acao = 'Usuário do Sistema',
      perfil = 'professor',
      detalhes_auditoria
    } = dados;

    if (perfil === 'professor' && !STATUS_EDITAVEIS_PROFESSOR.includes(atual.status)) {
      throw new Error(`Este acompanhamento está "${atual.status}" e não pode mais ser alterado pelo professor.`);
    }
    await this._validarAcompanhamento({ aluno, disciplina, bimestre, media, descricao, status }, perfil);

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : [tags]);

    await pool.query(
      `UPDATE acompanhamentos
       SET aluno = ?, disciplina = ?, turma = ?, bimestre = ?, media = ?, tags = ?, descricao = ?, status = ?, feedback_admin = ?
       WHERE id = ?`,
      [
        aluno,
        disciplina,
        turma,
        bimestre,
        Number(media),
        tagsJson,
        descricao,
        status,
        feedback_admin,
        id
      ]
    );

    await this.registrarAuditoria(
      id,
      usuario_acao,
      perfil,
      atual.status,
      status,
      detalhes_auditoria || `Atualização do acompanhamento (${atual.status} -> ${status})`
    );

    return await this.buscarAcompanhamentoPorId(id);
  }

  async removerAcompanhamento(id) {
    const [res] = await pool.query(`DELETE FROM acompanhamentos WHERE id = ?`, [id]);
    if (!res.affectedRows) throw new Error('Acompanhamento não encontrado.');
    return { mensagem: 'Acompanhamento excluído com sucesso.' };
  }

  async registrarAuditoria(acompanhamentoId, usuario, perfil, estadoAnterior, estadoPosterior, detalhes) {
    await pool.query(
      `INSERT INTO historico_auditoria
       (acompanhamento_id, usuario, perfil, estado_anterior, estado_posterior, detalhes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [acompanhamentoId, usuario, perfil, estadoAnterior, estadoPosterior, detalhes]
    );
  }

  async listarHistorico() {
    const [rows] = await pool.query(
      `SELECT h.*, a.aluno, a.disciplina
       FROM historico_auditoria h
       LEFT JOIN acompanhamentos a ON a.id = h.acompanhamento_id
       ORDER BY h.id DESC`
    );
    return rows;
  }
}

module.exports = new SistemaKFKA();
