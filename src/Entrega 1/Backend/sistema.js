const path = require('path');
const BancoDados = require('./banco');
const {
    Turma,
    Professor,
    Responsavel,
    Aluno,
    Tag,
    Acompanhamento
} = require('./modelos');

class SistemaKFKA {
    /*
     * Classe principal do sistema.
     * Ela integra as classes do domínio com o banco de dados
     * e centraliza o fluxo das operações do backend.
     */
    constructor(caminhoBanco = path.join(__dirname, 'kfka.db')) {
        this.banco = new BancoDados(caminhoBanco);

        this.classes = {
            turmas: Turma,
            professores: Professor,
            responsaveis: Responsavel,
            alunos: Aluno,
            tags: Tag,
            acompanhamentos: Acompanhamento
        };
    }

    listar(tipo) {
        const Classe = this.obterClasse(tipo);
        const registros = this.banco.listar(tipo);

        return registros.map(registro => {
            if (tipo === 'turmas') {
                return new Classe(
                    registro.id,
                    registro.nome,
                    registro.turno,
                    registro.capacidade,
                    registro.disciplinas,
                    registro.ano
                );
            }

            if (tipo === 'professores') {
                return new Classe(
                    registro.id,
                    registro.nome,
                    registro.email,
                    registro.aulas,
                    registro.turma,
                    registro.disciplina
                );
            }

            if (tipo === 'responsaveis') {
                return new Classe(
                    registro.id,
                    registro.nome,
                    registro.email,
                    registro.telefone,
                    registro.cpf,
                    registro.parentesco,
                    registro.aluno
                );
            }

            if (tipo === 'alunos') {
                return new Classe(
                    registro.id,
                    registro.nome,
                    registro.matricula,
                    registro.serie,
                    registro.responsavel
                );
            }

            if (tipo === 'tags') {
                return new Classe(registro.id, registro.nome);
            }

            return new Classe(
                registro.id,
                registro.aluno,
                registro.disciplina,
                registro.turma,
                registro.bimestre,
                registro.media,
                registro.tags,
                registro.descricao,
                registro.status
            );
        });
    }

    salvarLista(tipo, registros) {
        this.obterClasse(tipo);

        if (!Array.isArray(registros)) {
            throw new Error('Os dados enviados devem ser uma lista.');
        }

        this.banco.substituirTodos(tipo, registros);
        return this.listar(tipo);
    }

    obterClasse(tipo) {
        const Classe = this.classes[tipo];

        if (!Classe) {
            throw new Error('Tipo de dado inválido.');
        }

        return Classe;
    }
}

module.exports = SistemaKFKA;
