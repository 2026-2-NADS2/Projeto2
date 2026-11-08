const path = require('path');

let DatabaseSync;

try {
    ({ DatabaseSync } = require('node:sqlite'));
} catch (erro) {
    console.error('Este projeto precisa do Node.js 22.5 ou superior para usar o banco SQLite.');
    process.exit(1);
}

class BancoDados {
    constructor(caminhoBanco = path.join(__dirname, 'kfka.db')) {
        this.tabelasPermitidas = new Set([
            'turmas',
            'professores',
            'responsaveis',
            'alunos',
            'tags',
            'acompanhamentos'
        ]);

        this.db = new DatabaseSync(caminhoBanco);
        this.db.exec('PRAGMA foreign_keys = ON;');

        this.criarTabelas();
        this.inserirDadosIniciais();
    }

    criarTabelas() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS turmas (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL,
                turno TEXT NOT NULL,
                capacidade INTEGER NOT NULL,
                disciplinas TEXT NOT NULL,
                ano TEXT NOT NULL DEFAULT '2026'
            );

            CREATE TABLE IF NOT EXISTS professores (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL,
                email TEXT NOT NULL,
                aulas TEXT NOT NULL,
                turma TEXT DEFAULT '',
                disciplina TEXT DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS responsaveis (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL,
                email TEXT NOT NULL,
                telefone TEXT NOT NULL,
                cpf TEXT NOT NULL,
                parentesco TEXT NOT NULL,
                aluno TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS alunos (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL,
                matricula TEXT NOT NULL UNIQUE,
                serie TEXT NOT NULL,
                responsavel TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY,
                nome TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS acompanhamentos (
                id INTEGER PRIMARY KEY,
                aluno TEXT NOT NULL,
                disciplina TEXT NOT NULL,
                turma TEXT NOT NULL,
                bimestre TEXT NOT NULL,
                media REAL NOT NULL,
                tags TEXT NOT NULL,
                descricao TEXT NOT NULL,
                status TEXT NOT NULL
            );
        `);
    }

    inserirDadosIniciais() {
        const dados = {
            turmas: [
                {
                    id: 1,
                    nome: '6º Ano B',
                    turno: 'Tarde',
                    capacidade: 35,
                    disciplinas: 'Ciências, História, Matemática',
                    ano: '2026'
                },
                {
                    id: 2,
                    nome: '7º Ano B',
                    turno: 'Manhã',
                    capacidade: 21,
                    disciplinas: 'Ciências, História, Matemática',
                    ano: '2026'
                }
            ],
            professores: [
                {
                    id: 1,
                    nome: 'Julio Cesar',
                    email: 'julio.cesar@kfka.com',
                    aulas: '6º Ano B • Matemática; 7º Ano B • Matemática',
                    turma: '6º Ano B',
                    disciplina: 'Matemática'
                },
                {
                    id: 2,
                    nome: 'Julia Cruz',
                    email: 'julia.cruz@kfka.com',
                    aulas: '6º Ano B • Matemática',
                    turma: '6º Ano B',
                    disciplina: 'Matemática'
                }
            ],
            responsaveis: [
                {
                    id: 1,
                    nome: 'Vitor Silva',
                    email: 'vitor@exemplo.com',
                    telefone: '(11) 98765-4321',
                    cpf: '987.654.321-00',
                    parentesco: 'Pai',
                    aluno: 'Lucas Sevino'
                },
                {
                    id: 2,
                    nome: 'Thaís Carla',
                    email: 'thais@exemplo.com',
                    telefone: '(11) 98555-4321',
                    cpf: '123.456.789-00',
                    parentesco: 'Mãe',
                    aluno: 'Maria Lourdes'
                }
            ],
            alunos: [
                {
                    id: 1,
                    nome: 'Lucas Sevino',
                    matricula: '23011232',
                    serie: '6º Ano B',
                    responsavel: 'Vitor Silva'
                },
                {
                    id: 2,
                    nome: 'Ramos Batista',
                    matricula: '23013333',
                    serie: '6º Ano B',
                    responsavel: 'Thaís Carla'
                }
            ],
            tags: [
                { id: 1, nome: 'Participação ativa' },
                { id: 2, nome: 'Entregas pontuais' },
                { id: 3, nome: 'Trabalhos em equipe' },
                { id: 4, nome: 'Necessita apoio' }
            ],
            acompanhamentos: [
                {
                    id: 1,
                    aluno: 'Lucas Sevino',
                    disciplina: 'Matemática',
                    turma: '6º Ano B',
                    bimestre: '2º Bimestre',
                    media: 8.5,
                    tags: ['Conversas paralelas', 'Trabalhos entregues', 'Acompanha a aula'],
                    descricao: 'O aluno apresentou boa evolução na interpretação de textos e participou ativamente das aulas.',
                    status: 'Devolvido'
                },
                {
                    id: 2,
                    aluno: 'Maria Lourdes',
                    disciplina: 'Matemática',
                    turma: '6º Ano B',
                    bimestre: '2º Bimestre',
                    media: 8.5,
                    tags: ['Participação ativa', 'Entrega pontual'],
                    descricao: 'A aluna vem demonstrando progresso nas atividades.',
                    status: 'Pendente'
                },
                {
                    id: 3,
                    aluno: 'Maria Lourdes',
                    disciplina: 'Ciências',
                    turma: '6º Ano B',
                    bimestre: '2º Bimestre',
                    media: 8.5,
                    tags: ['Entrega pontual'],
                    descricao: 'Mantém ótimo aproveitamento e participação nas aulas.',
                    status: 'Publicado'
                }
            ]
        };

        for (const [tabela, registros] of Object.entries(dados)) {
            const { total } = this.db
                .prepare(`SELECT COUNT(*) AS total FROM ${tabela}`)
                .get();

            if (total === 0) {
                this.substituirTodos(tabela, registros);
            }
        }
    }

    listar(tabela) {
        this.validarTabela(tabela);

        const registros = this.db
            .prepare(`SELECT * FROM ${tabela} ORDER BY id`)
            .all()
            .map(registro => ({ ...registro }));

        if (tabela === 'acompanhamentos') {
            for (const item of registros) {
                item.tags = JSON.parse(item.tags || '[]');
                item.media = Number(item.media).toFixed(1);
            }
        }

        return registros;
    }

    substituirTodos(tabela, registros) {
        this.validarTabela(tabela);

        this.db.exec('BEGIN TRANSACTION;');

        try {
            this.db.exec(`DELETE FROM ${tabela};`);

            for (const registro of registros) {
                this.inserir(tabela, registro);
            }

            this.db.exec('COMMIT;');
        } catch (erro) {
            this.db.exec('ROLLBACK;');
            throw erro;
        }
    }

    inserir(tabela, r) {
        switch (tabela) {
            case 'turmas':
                this.db.prepare(`
                    INSERT INTO turmas
                    (id, nome, turno, capacidade, disciplinas, ano)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    Number(r.id),
                    r.nome,
                    r.turno,
                    Number(r.capacidade),
                    r.disciplinas || '',
                    r.ano || '2026'
                );
                break;

            case 'professores':
                this.db.prepare(`
                    INSERT INTO professores
                    (id, nome, email, aulas, turma, disciplina)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    Number(r.id),
                    r.nome,
                    r.email,
                    r.aulas || '',
                    r.turma || '',
                    r.disciplina || ''
                );
                break;

            case 'responsaveis':
                this.db.prepare(`
                    INSERT INTO responsaveis
                    (id, nome, email, telefone, cpf, parentesco, aluno)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    Number(r.id),
                    r.nome,
                    r.email,
                    r.telefone,
                    r.cpf || '',
                    r.parentesco || '',
                    r.aluno || ''
                );
                break;

            case 'alunos':
                this.db.prepare(`
                    INSERT INTO alunos
                    (id, nome, matricula, serie, responsavel)
                    VALUES (?, ?, ?, ?, ?)
                `).run(
                    Number(r.id),
                    r.nome,
                    r.matricula,
                    r.serie,
                    r.responsavel || ''
                );
                break;

            case 'tags':
                this.db.prepare(`
                    INSERT INTO tags (id, nome)
                    VALUES (?, ?)
                `).run(Number(r.id), r.nome);
                break;

            case 'acompanhamentos':
                this.db.prepare(`
                    INSERT INTO acompanhamentos
                    (id, aluno, disciplina, turma, bimestre, media, tags, descricao, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    Number(r.id),
                    r.aluno,
                    r.disciplina,
                    r.turma || '',
                    r.bimestre,
                    Number(r.media),
                    JSON.stringify(r.tags || []),
                    r.descricao,
                    r.status
                );
                break;
        }
    }

    validarTabela(tabela) {
        if (!this.tabelasPermitidas.has(tabela)) {
            throw new Error('Tipo de dado inválido.');
        }
    }
}

module.exports = BancoDados;
