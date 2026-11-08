class Turma {
    constructor(id, nome, turno, capacidade, disciplinas, ano = '2026') {
        this.id = Number(id);
        this.nome = nome;
        this.turno = turno;
        this.capacidade = Number(capacidade);
        this.disciplinas = disciplinas;
        this.ano = ano;
    }
}

class Professor {
    constructor(id, nome, email, aulas, turma = '', disciplina = '') {
        this.id = Number(id);
        this.nome = nome;
        this.email = email;
        this.aulas = aulas;
        this.turma = turma;
        this.disciplina = disciplina;
    }
}

class Responsavel {
    constructor(id, nome, email, telefone, cpf, parentesco, aluno) {
        this.id = Number(id);
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.parentesco = parentesco;
        this.aluno = aluno;
    }
}

class Aluno {
    constructor(id, nome, matricula, serie, responsavel) {
        this.id = Number(id);
        this.nome = nome;
        this.matricula = matricula;
        this.serie = serie;
        this.responsavel = responsavel;
    }
}

class Tag {
    constructor(id, nome) {
        this.id = Number(id);
        this.nome = nome;
    }
}

class Acompanhamento {
    constructor(id, aluno, disciplina, turma, bimestre, media, tags, descricao, status) {
        this.id = Number(id);
        this.aluno = aluno;
        this.disciplina = disciplina;
        this.turma = turma;
        this.bimestre = bimestre;
        this.media = Number(media).toFixed(1);
        this.tags = Array.isArray(tags) ? tags : [];
        this.descricao = descricao;
        this.status = status;
    }
}

module.exports = {
    Turma,
    Professor,
    Responsavel,
    Aluno,
    Tag,
    Acompanhamento
};
