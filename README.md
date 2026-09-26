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
- Denise de Sousa Lima
- João Henrique Percino Albuquerque
- Gabriel Barbosa da Silva Cabral

## Professores Orientadores

- Adriano Valente
- Eduardo Savino Gomes
- Francisco Escobar
- Carlos Buesso Junior
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
KFKA-Tech/
│
├── documentos/
│   └── Documentação do projeto
│
├── imagens/
│   └── Imagens, logos e recursos visuais
│
├── src/
│   │
│   ├── Backend/
│   │   ├── classes/
│   │   ├── database/
│   │   └── arquivos do backend
│   │
│   └── Frontend/
│       ├── páginas HTML
│       ├── arquivos CSS
│       ├── arquivos JavaScript
│       └── recursos do sistema
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

**src/Frontend/**  
Contém as telas e componentes responsáveis pela interface visual da plataforma.

**src/Backend/**  
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
- Node.js

### Banco de Dados

- Banco de dados utilizado para armazenar as informações acadêmicas e os dados necessários ao funcionamento do sistema.

### Ferramentas

- Visual Studio Code
- Git
- GitHub
- Figma
- Navegador Web

---

## 🛠 Instalação e Execução

### Front-end

Para visualizar as páginas do front-end:

1. Acesse a pasta:

```text
src/Frontend
```

2. Localize o arquivo principal:

```text
index.html
```

3. Abra o arquivo em um navegador, como:

- Google Chrome;
- Microsoft Edge;
- Mozilla Firefox.

Não é necessária instalação para visualizar as páginas estáticas do front-end.

---

### Back-end

O back-end do sistema está localizado na pasta:

```text
src/Backend
```

Ele é responsável pela organização das classes, regras de negócio e acesso aos dados utilizados pela plataforma KFKA Tech.

Para ambientes que utilizem Node.js, é necessário possuir o Node.js instalado no computador.

Download:

https://nodejs.org/

A execução do servidor pode variar conforme a versão atual implementada no projeto.

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

A camada de banco de dados está integrada ao back-end do projeto.

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

Este projeto foi desenvolvido para fins acadêmicos como parte do Projeto Interdisciplinar da **FECAP – Fundação de Comércio Álvares Penteado**.

Caso seja necessária a aplicação de uma licença Creative Commons, poderá ser utilizada a licença **CC BY 4.0**.

Mais informações:

https://creativecommons.org/licenses/by/4.0/

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
**Denise de Sousa Lima**  
**João Henrique Percino Albuquerque**  
**Gabriel Barbosa da Silva Cabral**

### Professores Orientadores

**Adriano Valente**  
**Eduardo Savino Gomes**  
**Francisco Escobar**  
**Carlos Buesso Junior**  
**Ronaldo Araujo Pinto**

FECAP – Fundação de Comércio Álvares Penteado.