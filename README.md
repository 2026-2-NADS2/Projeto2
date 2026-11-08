# FECAP - Fundação de Comércio Álvares Penteado

<p align="center">
  <a href="https://www.fecap.br/">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0">
  </a>
</p>

# KFKA Tech

## Nome do Grupo

KFKA Tech

## Integrantes

- Vitor de Moura Lima
- João Henrique Percino Albuquerque
- Gabriel Barbosa da Silva Cabral

## Professores Orientadores

- Adriano Valente
- Eduardo Savino Gomes
- Francisco Escobar
- José Buesso Junior
- Ronaldo Araujo Pinto

---

## 📖 Descrição

O **KFKA Tech** é uma plataforma web de acompanhamento escolar desenvolvida com o objetivo de facilitar o acesso às informações acadêmicas e melhorar a comunicação entre alunos, responsáveis, professores e administradores.

O sistema possui diferentes áreas de acesso para **alunos e responsáveis, professores e administradores**. Alunos e responsáveis podem consultar informações acadêmicas, como horários, notificações, eventos, provas, média geral e situação de frequência. Professores podem registrar e consultar o acompanhamento bimestral dos alunos nas turmas e disciplinas sob sua responsabilidade. Já os administradores possuem acesso às funcionalidades de gerenciamento necessárias para o funcionamento da plataforma.

O objetivo do projeto é proporcionar um acompanhamento acadêmico mais simples, organizado e acessível.

---

## ✨ Principais Funcionalidades

### 👨‍🎓 Aluno e Responsável

- Visualização do mural principal;
- Consulta do horário semanal de aulas;
- Visualização das últimas notificações;
- Consulta dos próximos eventos e provas;
- Visualização da média geral do aluno;
- Consulta da situação do limite de faltas.

### 👨‍🏫 Professor

- Acesso ao painel do professor;
- Consulta das turmas e disciplinas sob sua responsabilidade;
- Registro do acompanhamento bimestral dos alunos;
- Consulta dos acompanhamentos registrados.

### ⚙️ Administrador

- Acesso ao painel administrativo;
- Gerenciamento das informações necessárias ao funcionamento do sistema;
- Administração dos principais cadastros e recursos da plataforma.

---

## 🛠 Estrutura de Pastas

A estrutura do projeto está organizada da seguinte forma:

```text
Projeto2/
│
├── documentos/
│   ├── Entrega 1/            (Banco de Dados, Design, Estrutura de Dados, Full Stack, POO)
│   ├── Entrega 2/
│   ├── Declaracao de Uso de IA/   (fichas de cada integrante)
│   ├── Ficha de Declaracao Uso IA - FECAP.docx
│   ├── Documento_Projeto_Extensao_KFKA_Tech_Preenchido.docx
│   ├── MODELO_BANNER_FECAP_2026_1.pptx
│   └── README.md             (entregas e declaração de uso de IA)
│
├── imagens/
│
├── src/
│   ├── Entrega 1/
│   │   ├── Backend/          (servidor Node.js + SQLite)
│   │   └── Frontend/         (HTML, CSS e JavaScript)
│   ├── Entrega 2/
│   │   ├── Backend/          [preencher]
│   │   └── Frontend/         [preencher: React]
│   └── README.md             (declaração de uso de IA por módulo)
│
└── README.md
```

### Descrição das pastas

**documentos/**  
Contém os documentos relacionados ao desenvolvimento, planejamento e documentação do projeto interdisciplinar.

**imagens/**  
Contém logos, imagens e demais recursos visuais utilizados pelo sistema.

**src/**  
Contém todo o código-fonte da aplicação.

**src/Entrega N/Frontend/**  
Contém as telas e componentes responsáveis pela interface visual da plataforma.

**src/Entrega N/Backend/**  
Contém as classes, regras do sistema e estrutura responsável pela manipulação e armazenamento dos dados.

**README.md**  
Arquivo responsável por apresentar e documentar o projeto.

---

## 💻 Tecnologias Utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript

### Back-end

- JavaScript
- Node.js 22.5+ (servidor HTTP nativo, sem dependências externas)

### Banco de Dados

- SQLite (módulo nativo `node:sqlite`)

### Estrutura de Dados

- C# (.NET): simulador de paginação de alunos com SQLite

### Ferramentas

- Visual Studio Code
- Git
- GitHub
- Figma
- Navegador Web

---

## 🛠 Instalação e Execução

### Pré-requisito

- Node.js 22.5 ou superior: https://nodejs.org/

Não é necessário rodar `npm install`.

### Executando a Entrega 1

O código-fonte pode ser lido em `src/Entrega 1/`. Para executar o sistema completo:

1. Baixe o arquivo `documentos/Entrega 1/full stack/Full Stack.zip`, que tem o front-end e o back-end juntos, e extraia.
2. Entre na pasta `Projeto Kfka`.
3. No Windows, dê dois cliques em `INICIAR_KFKA.bat`. Em outros sistemas, rode:

```sh
node --no-warnings backend/servidor.js
```

4. Acesse http://127.0.0.1:8000 no navegador e mantenha a janela do servidor aberta enquanto usar o sistema.

O banco `backend/kfka.db` é criado automaticamente na primeira execução.

### Executando a Entrega 2

[preencher: passos para instalar dependências, configurar o banco e iniciar o back-end e o front-end em React]

```sh
[preencher: comandos, ex.: npm install / npm start]
```

---

## 💻 Configuração para Desenvolvimento

Para desenvolver ou modificar o projeto, recomenda-se utilizar:

- Visual Studio Code;
- Node.js;
- Git;
- GitHub;
- Navegador atualizado;
- Figma.

### Visual Studio Code

https://code.visualstudio.com/

### Node.js

https://nodejs.org/

### Git

https://git-scm.com/

### Figma

https://www.figma.com/

---

## 🗄 Banco de Dados

O sistema utiliza um banco de dados para armazenar informações necessárias ao funcionamento da plataforma, como dados de usuários, alunos, professores, acompanhamento escolar, turmas, disciplinas e demais registros acadêmicos.

O banco utilizado é o SQLite, acessado pelo back-end (`backend/banco.js`).

---

## 🧩 Arquitetura do Sistema

O projeto está dividido principalmente em duas partes:

### Front-end

Responsável pela interação com o usuário e pela apresentação das informações da plataforma.

### Back-end

Responsável pelas regras de negócio, classes do sistema, tratamento das informações e comunicação com o banco de dados.

A separação entre front-end e back-end facilita a organização, manutenção e evolução do projeto.

---

## 🔐 Tipos de Usuário

### Aluno / Responsável

Possui acesso às informações relacionadas ao acompanhamento acadêmico do aluno.

### Professor

Possui acesso às informações de suas turmas e disciplinas e pode realizar o acompanhamento bimestral dos alunos.

### Administrador

Possui acesso às funcionalidades administrativas necessárias para gerenciamento da plataforma.

---

## 📋 Licença / License

Este projeto foi desenvolvido para fins acadêmicos como parte do Projeto Interdisciplinar da **FECAP – Fundação de Comércio Álvares Penteado** e está licenciado sob a <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)</a>.

---

## 🤖 Declaração de Uso de Inteligência Artificial

Conforme o Guia para o Uso Responsável de IA na FECAP (versão 2.0), as declarações de uso de IA estão em:

- [documentos/README.md](documentos/README.md) – por disciplina e entrega
- [src/README.md](src/README.md) – por módulo do sistema
- [Ficha de Declaração de Uso de IA](documentos/Ficha%20de%20Declaracao%20Uso%20IA%20-%20FECAP.docx) – ficha individual

---

## 🎓 Referências

1. FECAP – Fundação de Comércio Álvares Penteado  
   https://www.fecap.br/

2. MDN Web Docs  
   https://developer.mozilla.org/

3. Node.js  
   https://nodejs.org/

4. GitHub  
   https://github.com/

5. Visual Studio Code  
   https://code.visualstudio.com/

6. Figma  
   https://www.figma.com/

7. Creative Commons  
   https://creativecommons.org/licenses/by/4.0/

---

## 👥 Desenvolvedores

Projeto desenvolvido por:

**Vitor de Moura Lima**   
**João Henrique Percino Albuquerque**  
**Gabriel Barbosa da Silva Cabral**

### Professores Orientadores

**Adriano Valente**  
**Eduardo Savino Gomes**  
**Francisco Escobar**  
**José Buesso Junior**  
**Ronaldo Araujo Pinto**

FECAP – Fundação de Comércio Álvares Penteado.
