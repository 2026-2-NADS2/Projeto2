CREATE DATABASE IF NOT EXISTS kfka_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kfka_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  identificador VARCHAR(60) NOT NULL UNIQUE COMMENT 'Usuario, RA ou CPF',
  email VARCHAR(120) NOT NULL,
  senha VARCHAR(120) NOT NULL,
  perfil ENUM('administrador', 'professor', 'responsavel') NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  area VARCHAR(100) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS turmas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ano VARCHAR(10) NOT NULL DEFAULT '2026',
  nome VARCHAR(80) NOT NULL,
  turno VARCHAR(30) NOT NULL,
  capacidade INT NOT NULL DEFAULT 30,
  disciplinas VARCHAR(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS professores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  ra VARCHAR(40) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL,
  turma VARCHAR(80) NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  aulas VARCHAR(255) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS responsaveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  telefone VARCHAR(40) NOT NULL,
  cpf VARCHAR(25) NOT NULL UNIQUE,
  parentesco VARCHAR(40) NOT NULL,
  aluno VARCHAR(120) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_responsaveis_cpf (cpf)
);

CREATE TABLE IF NOT EXISTS alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  matricula VARCHAR(40) NOT NULL UNIQUE,
  serie VARCHAR(80) NOT NULL,
  responsavel VARCHAR(120) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_alunos_serie (serie)
);

CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(60) NOT NULL DEFAULT 'Desempenho',
  ativo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bimestres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(40) NOT NULL UNIQUE,
  ano VARCHAR(10) NOT NULL DEFAULT '2026',
  data_abertura DATETIME NOT NULL,
  data_encerramento DATETIME NOT NULL,
  aberto TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS acompanhamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno VARCHAR(120) NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  turma VARCHAR(80) NOT NULL,
  bimestre VARCHAR(40) NOT NULL,
  ano VARCHAR(10) NOT NULL DEFAULT '2026',
  professor VARCHAR(120) NOT NULL DEFAULT 'Julio Cesar',
  media DECIMAL(4,1) NOT NULL,
  tags TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status ENUM('Rascunho', 'Pendente', 'Em revisão', 'Devolvido', 'Publicado', 'Cancelado') NOT NULL DEFAULT 'Rascunho',
  feedback_admin TEXT NULL,
  ciencia_data VARCHAR(60) NULL,
  observacao_responsavel TEXT NULL,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_acomp_aluno_bimestre (aluno, bimestre, status),
  INDEX idx_acomp_turma_disciplina (turma, disciplina)
);

CREATE TABLE IF NOT EXISTS historico_auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  acompanhamento_id INT NOT NULL,
  usuario VARCHAR(120) NOT NULL,
  perfil VARCHAR(40) NOT NULL,
  estado_anterior VARCHAR(40) NOT NULL,
  estado_posterior VARCHAR(40) NOT NULL,
  detalhes VARCHAR(255) NOT NULL,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historico_acomp FOREIGN KEY (acompanhamento_id) REFERENCES acompanhamentos(id) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW vw_relatorio_acompanhamentos AS
SELECT
  a.id,
  a.ano,
  a.bimestre,
  a.turma,
  a.aluno,
  al.matricula,
  al.responsavel,
  a.disciplina,
  d.area AS area_disciplina,
  a.professor,
  a.media,
  a.tags,
  a.descricao,
  a.status,
  a.feedback_admin,
  a.ciencia_data,
  a.observacao_responsavel,
  a.atualizado_em
FROM acompanhamentos a
LEFT JOIN alunos al ON al.nome = a.aluno
LEFT JOIN disciplinas d ON d.nome = a.disciplina;

INSERT IGNORE INTO usuarios (id, nome, identificador, email, senha, perfil) VALUES
(1, 'Admin Coordenação', 'admin', 'admin@kfka.com', '123456', 'administrador'),
(2, 'Prof. Julio Cesar', '102030', 'julio.cesar@kfka.com', '123456', 'professor'),
(3, 'Vitor Silva', '987.654.321-00', 'vitor@exemplo.com', '123456', 'responsavel'),
(4, 'Thaís Carla', '123.456.789-00', 'thais@exemplo.com', '123456', 'responsavel');

INSERT IGNORE INTO disciplinas (id, nome, area, ativo) VALUES
(1, 'Matemática', 'Ciências Exatas', 1),
(2, 'Português', 'Linguagens e Códigos', 1),
(3, 'Ciências', 'Ciências da Natureza', 1),
(4, 'História', 'Ciências Humanas', 1);

INSERT IGNORE INTO turmas (id, ano, nome, turno, capacidade, disciplinas, ativo) VALUES
(1, '2026', '6º Ano B', 'Tarde', 35, 'Ciências, História, Matemática, Português', 1),
(2, '2026', '7º Ano B', 'Manhã', 21, 'Ciências, História, Matemática', 1);

INSERT IGNORE INTO professores (id, nome, ra, email, turma, disciplina, aulas, ativo) VALUES
(1, 'Julio Cesar', '102030', 'julio.cesar@kfka.com', '6º Ano B', 'Matemática', '6º Ano B • Matemática', 1),
(2, 'Julia Cruz', '102031', 'julia.cruz@kfka.com', '6º Ano B', 'Ciências', '6º Ano B • Ciências', 1);

INSERT IGNORE INTO responsaveis (id, nome, email, telefone, cpf, parentesco, aluno, ativo) VALUES
(1, 'Vitor Silva', 'vitor@exemplo.com', '(11) 98765-4321', '987.654.321-00', 'Pai', 'Lucas Sevino', 1),
(2, 'Thaís Carla', 'thais@exemplo.com', '(11) 98555-4321', '123.456.789-00', 'Mãe', 'Maria Lourdes', 1);

INSERT IGNORE INTO alunos (id, nome, matricula, serie, responsavel, ativo) VALUES
(1, 'Lucas Sevino', '23011232', '6º Ano B', 'Vitor Silva', 1),
(2, 'Maria Lourdes', '23012222', '6º Ano B', 'Thaís Carla', 1),
(3, 'Ramos Batista', '23013333', '6º Ano B', 'Thaís Carla', 1);

INSERT IGNORE INTO tags (id, nome, categoria, ativo) VALUES
(1, 'Participação ativa', 'Positiva', 1),
(2, 'Entrega pontual', 'Positiva', 1),
(3, 'Trabalhos entregues', 'Positiva', 1),
(4, 'Acompanha a aula', 'Positiva', 1),
(5, 'Conversa paralela', 'Atenção', 1),
(6, 'Necessita apoio', 'Atenção', 1);

INSERT IGNORE INTO bimestres (id, nome, ano, data_abertura, data_encerramento, aberto) VALUES
(1, '1º Bimestre', '2026', '2026-02-01 08:00:00', '2026-04-15 23:59:00', 0),
(2, '2º Bimestre', '2026', '2026-04-16 08:00:00', '2026-12-30 23:59:00', 1),
(3, '3º Bimestre', '2026', '2026-08-01 08:00:00', '2026-10-15 23:59:00', 1),
(4, '4º Bimestre', '2026', '2026-10-16 08:00:00', '2026-12-20 23:59:00', 1);

INSERT IGNORE INTO acompanhamentos
(id, aluno, disciplina, turma, bimestre, ano, professor, media, tags, descricao, status, feedback_admin, ciencia_data, observacao_responsavel)
VALUES
(1, 'Lucas Sevino', 'Matemática', '6º Ano B', '2º Bimestre', '2026', 'Julio Cesar', 8.5,
 '["Participação ativa","Trabalhos entregues","Acompanha a aula"]',
 'O aluno apresentou ótima evolução no raciocínio lógico e resolução de problemas algébricos ao longo do bimestre.',
 'Publicado', 'Aprovado pela coordenação pedagógica.', NULL, NULL),
(2, 'Lucas Sevino', 'Ciências', '6º Ano B', '2º Bimestre', '2026', 'Julia Cruz', 9.0,
 '["Participação ativa","Entrega pontual"]',
 'Excelente desempenho nos experimentos práticos e participação ativa nos debates em sala.',
 'Publicado', 'Relatório claro e bem detalhado.', NULL, NULL),
(3, 'Maria Lourdes', 'Matemática', '6º Ano B', '2º Bimestre', '2026', 'Julio Cesar', 8.0,
 '["Participação ativa","Entrega pontual"]',
 'A aluna vem demonstrando progresso constante nas atividades propostas em sala.',
 'Pendente', NULL, NULL, NULL),
(4, 'Ramos Batista', 'Matemática', '6º Ano B', '2º Bimestre', '2026', 'Julio Cesar', 6.5,
 '["Conversa paralela","Necessita apoio"]',
 'Necessita maior foco durante as explicações teóricas e reforço na entrega das listas de exercícios.',
 'Devolvido', 'Favor detalhar quais listas de exercícios não foram entregues.', NULL, NULL);

INSERT IGNORE INTO historico_auditoria (id, acompanhamento_id, usuario, perfil, estado_anterior, estado_posterior, detalhes) VALUES
(1, 1, 'Prof. Julio Cesar', 'professor', 'Rascunho', 'Pendente', 'Enviado para revisão da coordenação'),
(2, 1, 'Admin Coordenação', 'administrador', 'Pendente', 'Publicado', 'Revisado e publicado para os responsáveis'),
(3, 4, 'Admin Coordenação', 'administrador', 'Pendente', 'Devolvido', 'Devolvido para ajustes: Favor detalhar quais listas não foram entregues.');
