# KFKA – Plataforma de Acompanhamento Escolar

Projeto Interdisciplinar do 2º semestre de ADS da FECAP (2026).

A KFKA é um sistema web para escolas de Ensino Fundamental. Nele, o professor registra o acompanhamento bimestral de cada aluno, a coordenação revisa e publica, e o responsável consulta os relatórios do filho, confirma que leu e pode mandar observações para a escola.

O sistema tem três perfis de acesso: **Administrador**, **Professor** e **Responsável**.

## Tecnologias

- **Front-end:** React + Vite + React Router
- **Back-end:** Node.js + Express
- **Banco de dados:** MySQL

## Estrutura do projeto

```
KFKA_entrega2_react/
├── back_end/
│   ├── sql/schema.sql          criação do banco, tabelas, índices, view e dados iniciais
│   ├── src/config/db.js        conexão com o MySQL
│   ├── src/models/sistemaKFKA.js
│   ├── src/server.js           rotas da API
│   └── .env.example
└── front_end/
    ├── public/img/             imagens da página inicial
    ├── src/services/api.js     todas as chamadas para a API
    ├── src/components/         componentes reutilizáveis (tabela, paginação, avisos...)
    ├── src/pages/              telas do sistema
    ├── src/styles/             CSS
    └── .env.example
```

## Como rodar

Você vai precisar do **Node.js** e de um **MySQL** (pode ser o do XAMPP).

**1. Banco de dados**

Com o MySQL ligado, abra o phpMyAdmin (ou o Workbench) e execute o arquivo `back_end/sql/schema.sql`. Ele cria o banco `kfka_db` com todas as tabelas e alguns dados para teste. Se o banco já existir, pode rodar de novo sem problema.

**2. Back-end**

```bash
cd back_end
copy .env.example .env
npm install
npm start
```

No arquivo `.env`, confira o usuário e a senha do seu MySQL (no XAMPP normalmente é `root` sem senha). A API vai rodar em `http://localhost:3000/api`.

**3. Front-end** (em outro terminal, com o back-end ainda rodando)

```bash
cd front_end
copy .env.example .env
npm install
npm run dev
```

Depois é só abrir `http://localhost:5173` no navegador.

> No Mac ou Linux, troque `copy` por `cp`.

## Configurando a URL da API

O front-end lê o endereço da API no arquivo `front_end/.env`:

```
VITE_API_URL=http://localhost:3000/api
```

Se a API for publicada em outro endereço (por exemplo, num serviço de nuvem), basta trocar esse valor e rodar `npm run dev` ou `npm run build` de novo.

## Usuários para teste

| Perfil | Login | Senha |
|---|---|---|
| Administrador | `admin` | `123456` |
| Professor | `102030` | `123456` |
| Responsável | `987.654.321-00` | `123456` |

O professor entra com o RA, e o responsável pode entrar com o CPF ou com a matrícula do aluno.

## Fluxo de telas

```
Página inicial  →  Escolha do perfil  →  Login
                                           │
         ┌─────────────────────────────────┼──────────────────────────────┐
         ▼                                 ▼                              ▼
   Administrador                       Professor                     Responsável
   - Turmas                            - Períodos de digitação       - Escolha do aluno
   - Disciplinas                       - Minhas salas                - Relatórios por bimestre
   - Professores                       - Lançar acompanhamento       - Confirmar ciência
   - Alunos                            - Acompanhamentos da sala     - Enviar observação
   - Responsáveis                                                    - Baixar PDF
   - Tags
   - Períodos bimestrais
   - Revisão e publicação
   - Relatórios e exportação
```

**Exemplo de uso completo:** o administrador cadastra a turma, o aluno e o responsável, vincula o professor e libera o bimestre. O professor lança o acompanhamento e envia para revisão. O administrador revisa e publica. O responsável entra, lê o relatório, confirma a ciência e baixa o PDF. Por fim, o administrador exporta os dados para o Excel.

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| POST | `/api/login` | login de qualquer perfil |
| POST | `/api/definir-senha` | primeiro acesso do responsável |
| POST | `/api/recuperar-senha` | recuperação de senha |
| GET | `/api/:recurso` | lista os registros |
| GET | `/api/:recurso/:id` | busca um registro |
| POST | `/api/:recurso` | cria um registro |
| PUT | `/api/:recurso/:id` | atualiza um registro |
| DELETE | `/api/:recurso/:id` | exclui um registro |
| GET | `/api/historico` | histórico de alterações dos acompanhamentos |

Os recursos disponíveis são: turmas, disciplinas, professores, alunos, responsaveis, tags, bimestres e acompanhamentos.
