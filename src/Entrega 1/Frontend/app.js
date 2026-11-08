const app = document.querySelector('#app');

const routes = [
    'login',
    'acesso',
    'aluno',
    'professor',
    'administrador',
    'turmas',
    'professores',
    'alunos',
    'responsaveis',
    'tags'
];

const titulos = {
    aluno: 'Portal do Aluno e Responsável',
    professor: 'Portal do Professor',
    administrador: 'Central de Cadastros e Estrutura',
    turmas: 'Cadastro de Turmas',
    professores: 'Cadastro de Professor',
    alunos: 'Cadastro de Alunos',
    responsaveis: 'Cadastro de Responsável',
    tags: 'Cadastro de Tags'
};

const limpo = valor =>
    String(valor ?? '').replace(
        /[&<>"']/g,
        letra => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[letra])
    );

const caminho = () =>
    decodeURIComponent(
        location.hash.slice(1).split('?')[0] || '/login'
    ).replace(/^\/+/, '');

function aviso(mensagem, tipo = 'success') {
    const lugar = document.querySelector('#aviso');

    if (lugar) {
        lugar.innerHTML = `
            <div class="message ${tipo}" role="status">
                ${limpo(mensagem)}
            </div>
        `;

        lugar.scrollIntoView({
            block: 'nearest'
        });
    }
}

function casca(titulo, conteudo, home = '/administrador') {
    const contextoAluno =
        home === '/aluno'
            ? `
                <div class="contexto-aluno">
                    <span>Aluno: Lucas Sevino</span>
                    <span>Ano: 2026</span>
                </div>
            `
            : '';

    app.innerHTML = `
        <div class="shell">

            <header class="topbar">

                <div class="topbar-left">

                    <a
                        class="brand"
                        href="#/login"
                        aria-label="KFKA início"
                    >
                        K F K <span>Λ</span>
                    </a>

                    ${contextoAluno}

                </div>

                <strong class="heading">
                    ${titulo}
                </strong>

                <span class="right">

                    <a
                        class="home-link"
                        href="#${home}"
                    >
                        Início
                    </a>

                    <a href="#/login">
                        Sair
                    </a>

                </span>

            </header>

            <main class="content">

                <div id="aviso"></div>

                ${conteudo}

            </main>

        </div>
    `;
}

function acesso() {
    app.innerHTML = `
        <main class="login">

            <section class="login-box">

                <h1 class="login-logo">
                    K F K <span>Λ</span>
                </h1>

                <div class="role-choice">

                    <a
                        class="login-input"
                        href="#/acesso?perfil=responsavel"
                    >
                        RESPONSÁVEL
                    </a>

                    <a
                        class="login-input"
                        href="#/acesso?perfil=professor"
                    >
                        PROFESSOR
                    </a>

                    <a
                        class="login-input"
                        href="#/acesso?perfil=administrador"
                    >
                        ADMINISTRADOR
                    </a>

                </div>

                <p class="muted">
                    Demonstração com dados fictícios
                </p>

            </section>

        </main>
    `;
}

function telaAcesso() {
    const perfil =
        new URLSearchParams(
            location.hash.split('?')[1] || ''
        ).get('perfil') || 'responsavel';

    const label =
        perfil === 'professor'
            ? 'RA'
            : perfil === 'administrador'
                ? 'Usuário'
                : 'CPF';

    app.innerHTML = `
        <main class="login">

            <section class="login-box">

                <h1 class="login-logo">
                    K F K <span>Λ</span>
                </h1>

                <form
                    id="login-form"
                    class="login-form"
                >

                    <h2>
                        Acesso ${limpo(perfil)}
                    </h2>

                    <label for="usuario">
                        ${label}
                    </label>

                    <input
                        class="login-input"
                        id="usuario"
                        name="usuario"
                        placeholder="${label}"
                        required
                    >

                    <label for="senha">
                        Senha
                    </label>

                    <input
                        class="login-input"
                        id="senha"
                        type="password"
                        name="senha"
                        placeholder="Senha"
                        required
                    >

                    <button
                        class="primary"
                        type="submit"
                    >
                        Confirmar
                    </button>

                    <a href="#/login">
                        ← Voltar
                    </a>

                    <small>
                        Para a demonstração, informe qualquer usuário e senha.
                    </small>

                </form>

            </section>

        </main>
    `;

    document
        .querySelector('#login-form')
        .addEventListener('submit', e => {
            e.preventDefault();

            if (e.target.reportValidity()) {
                location.hash =
                    perfil === 'responsavel'
                        ? '#/aluno'
                        : perfil === 'professor'
                            ? '#/professor'
                            : '#/administrador';
            }
        });
}

function menuAdmin() {
    casca(
        titulos.administrador,
        `
            <h1 class="title">
                SELECIONE A ÁREA DE GESTÃO
            </h1>

            <nav
                class="menu"
                aria-label="Áreas de gestão"
            >

                ${
                    [
                        'turmas',
                        'professores',
                        'alunos',
                        'responsaveis',
                        'tags'
                    ]
                        .map(
                            r => `
                                <a
                                    class="menu-tile"
                                    href="#/${r}"
                                >
                                    ${
                                        titulos[r]
                                            .replace('Cadastro de ', '')
                                            .replace('Cadastro de', '')
                                    }
                                </a>
                            `
                        )
                        .join('')
                }

            </nav>
        `
    );
}

function linhaCampo(
    nome,
    rotulo,
    tipo = 'text',
    obrigatorio = true
) {
    return `
        <label class="field">

            ${rotulo}

            <input
                name="${nome}"
                type="${tipo}"
                ${obrigatorio ? 'required' : ''}
            >

        </label>
    `;
}

function select(nome, rotulo, opcoes) {
    return `
        <label class="field">

            ${rotulo}

            <select
                name="${nome}"
                required
            >

                ${
                    opcoes
                        .map(
                            o => `
                                <option>
                                    ${limpo(o)}
                                </option>
                            `
                        )
                        .join('')
                }

            </select>

        </label>
    `;
}

function tabela(
    colunas,
    linhas,
    editavel = true
) {
    return `
        <div class="table-wrap">

            <table>

                <thead>

                    <tr>

                        ${
                            colunas
                                .map(
                                    c => `
                                        <th>
                                            ${c}
                                        </th>
                                    `
                                )
                                .join('')
                        }

                        <th>
                            Ações
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        linhas
                            .map(
                                l => `
                                    <tr>

                                        ${
                                            colunas
                                                .map(
                                                    (_, i) => `
                                                        <td>
                                                            ${limpo(l.valores[i])}
                                                        </td>
                                                    `
                                                )
                                                .join('')
                                        }

                                        <td>

                                            ${
                                                editavel
                                                    ? `
                                                        <button
                                                            class="small-button danger excluir"
                                                            data-id="${l.id}"
                                                        >
                                                            Excluir
                                                        </button>
                                                    `
                                                    : '—'
                                            }

                                        </td>

                                    </tr>
                                `
                            )
                            .join('')
                    }

                </tbody>

            </table>

        </div>
    `;
}

const configs = {
    turmas: {
        singular: 'Turma',

        campos: `
            ${select(
                'ano',
                'Ano letivo',
                [
                    '2026',
                    '2027'
                ]
            )}

            ${select(
                'nome',
                'Nome da turma',
                [
                    '6º Ano B',
                    '7º Ano B',
                    '8º Ano A'
                ]
            )}

            ${select(
                'turno',
                'Turno',
                [
                    'Tarde',
                    'Manhã'
                ]
            )}

            ${linhaCampo(
                'capacidade',
                'Capacidade de alunos',
                'number'
            )}

            <div class="wide field">

                Selecione as disciplinas desta turma:

                <div class="check-row">

                    ${
                        [
                            'Matemática',
                            'Português',
                            'Ciências',
                            'História'
                        ]
                            .map(
                                n => `
                                    <label>

                                        <input
                                            type="checkbox"
                                            name="disciplinas"
                                            value="${n}"
                                        >

                                        ${n}

                                    </label>
                                `
                            )
                            .join('')
                    }

                </div>

            </div>
        `,

        cols: [
            'Turma',
            'Turno',
            'Disciplinas associadas',
            'Quantidade de alunos'
        ],

        valores: x => [
            x.nome,
            x.turno,
            x.disciplinas,
            x.capacidade
        ]
    },

    professores: {
        singular: 'Professor',

        campos: `
            ${linhaCampo(
                'nome',
                'Nome do professor'
            )}

            ${linhaCampo(
                'email',
                'Email do professor',
                'email'
            )}

            ${select(
                'turma',
                'Selecione a turma',
                [
                    '6º Ano B',
                    '7º Ano B'
                ]
            )}

            ${select(
                'disciplina',
                'Selecione a disciplina',
                [
                    'Matemática',
                    'Português',
                    'Ciências',
                    'História'
                ]
            )}
        `,

        cols: [
            'Professor',
            'Email',
            'Turmas e disciplinas'
        ],

        valores: x => [
            x.nome,
            x.email,
            x.aulas
        ]
    },

    responsaveis: {
        singular: 'Responsável',

        campos: `
            ${linhaCampo(
                'nome',
                'Nome do responsável'
            )}

            ${linhaCampo(
                'email',
                'Email do responsável',
                'email'
            )}

            ${linhaCampo(
                'telefone',
                'Telefone',
                'tel'
            )}

            ${linhaCampo(
                'cpf',
                'CPF responsável'
            )}

            ${select(
                'parentesco',
                'Grau de parentesco',
                [
                    'Pai',
                    'Mãe',
                    'Outro'
                ]
            )}

            ${linhaCampo(
                'aluno',
                'Dependente vinculado'
            )}
        `,

        cols: [
            'Responsável',
            'Email',
            'Telefone',
            'Dependente vinculado'
        ],

        valores: x => [
            x.nome,
            x.email,
            x.telefone,
            x.aluno
        ]
    },

    alunos: {
        singular: 'Aluno',

        campos: `
            ${linhaCampo(
                'nome',
                'Nome do aluno'
            )}

            ${linhaCampo(
                'matricula',
                'Número de matrícula'
            )}

            ${select(
                'serie',
                'Série',
                [
                    '6º Ano B',
                    '7º Ano B',
                    '8º Ano A'
                ]
            )}

            ${select(
                'responsavel',
                'Responsável vinculado',
                [
                    'Vitor Silva',
                    'Thaís Carla'
                ]
            )}
        `,

        cols: [
            'Nome do aluno',
            'Matrícula',
            'Série',
            'Responsável vinculado'
        ],

        valores: x => [
            x.nome,
            x.matricula,
            x.serie,
            x.responsavel
        ]
    },

    tags: {
        singular: 'Tag',

        campos:
            linhaCampo(
                'nome',
                'Nome da tag'
            ),

        cols: [
            'Tag'
        ],

        valores: x => [
            x.nome
        ]
    }
};

async function cadastro(rota) {
    const c = configs[rota];

    casca(
        titulos[rota],
        `
            <h1 class="section-title">
                Cadastrar ${c.singular}
            </h1>

            <form
                id="cadastro"
                class="panel"
            >

                <div class="form-grid">

                    ${c.campos}

                </div>

                <div class="form-actions">

                    <button class="primary">
                        Salvar ${c.singular}
                    </button>

                </div>

            </form>

            <h2 class="section-title">
                ${
                    c.singular
                }${
                    rota === 'tags'
                        ? 's'
                        : 's cadastrados'
                }
            </h2>

            <div
                id="lista"
                class="loading"
                role="status"
            >
                Carregando dados...
            </div>
        `
    );

    let itens;

    try {
        itens =
            await carregarDados(rota);
    } catch (err) {
        document.querySelector(
            '#lista'
        ).innerHTML = `
            <div class="message error">

                ${limpo(err.message)}

                <button
                    class="small-button"
                    id="repetir"
                >
                    Tentar novamente
                </button>

            </div>
        `;

        document.querySelector(
            '#repetir'
        ).onclick = () =>
            cadastro(rota);

        return;
    }

    if (caminho() !== rota) {
        return;
    }

    function desenhar() {
        document.querySelector(
            '#lista'
        ).innerHTML =
            tabela(
                c.cols,
                itens.map(
                    x => ({
                        id: x.id,
                        valores:
                            c.valores(x)
                    })
                )
            );

        document
            .querySelectorAll(
                '.excluir'
            )
            .forEach(b => {
                b.onclick = () => {
                    itens =
                        itens.filter(
                            x =>
                                x.id !==
                                Number(
                                    b.dataset.id
                                )
                        );

                    guardarDados(
                        rota,
                        itens
                    );

                    desenhar();

                    aviso(
                        'Registro excluído da demonstração.'
                    );
                };
            });
    }

    desenhar();

    document.querySelector(
        '#cadastro'
    ).onsubmit = e => {
        e.preventDefault();

        if (
            !e.target.reportValidity()
        ) {
            return;
        }

        const f =
            new FormData(
                e.target
            );

        const x =
            Object.fromEntries(
                f.entries()
            );

        x.id = Date.now();

        if (rota === 'turmas') {
            x.disciplinas =
                f
                    .getAll(
                        'disciplinas'
                    )
                    .join(', ');

            if (!x.disciplinas) {
                return aviso(
                    'Escolha ao menos uma disciplina.',
                    'error'
                );
            }

            if (
                Number(
                    x.capacidade
                ) < 1
            ) {
                return aviso(
                    'A capacidade deve ser maior que zero.',
                    'error'
                );
            }
        }

        if (
            rota ===
            'professores'
        ) {
            x.aulas =
                `${x.turma} • ${x.disciplina}`;
        }

        if (
            rota === 'alunos' &&
            itens.some(
                a =>
                    a.matricula ===
                    x.matricula
            )
        ) {
            return aviso(
                'Esta matrícula já existe.',
                'error'
            );
        }

        itens.push(x);

        guardarDados(
            rota,
            itens
        );

        desenhar();

        e.target.reset();

        aviso(
            `${c.singular} cadastrado na demonstração.`
        );
    };
}

const tagsProfessor = [
    'Participação ativa',
    'Trabalhos entregues',
    'Acompanha a aula',
    'Conversa paralela',
    'Necessita apoio',
    'Entrega pontual'
];

function fichaProfessor(x) {
    return `
        <article class="record">

            <div class="record-head">

                <strong>
                    ♙ ALUNO:
                    ${limpo(x.aluno)}
                    ·
                    ${limpo(x.disciplina)}
                </strong>

                <span
                    class="badge ${limpo(x.status)}"
                >
                    STATUS:
                    ${limpo(x.status)}
                </span>

            </div>

            <div class="chips">

                ${
                    x.tags
                        .map(
                            t => `
                                <span class="chip">
                                    ${limpo(t)}
                                </span>
                            `
                        )
                        .join('')
                }

            </div>

            <p>
                <strong>
                    Média bimestral:
                </strong>

                ${limpo(x.media)}
            </p>

            <p>
                <strong>
                    Avaliação:
                </strong>

                ${limpo(x.descricao)}
            </p>

            <div class="record-actions">

                <button
                    class="small-button editar"
                    data-id="${x.id}"
                >
                    Visualizar / editar
                </button>

            </div>

        </article>
    `;
}

async function professor() {
    casca(
        titulos.professor,
        `
            <div class="panel">

                <strong>
                    SELEÇÃO DE CONTEXTO ACADÊMICO
                </strong>

                <div class="filter">
                    Ano: 2026 ·
                    Turma: 6º Ano B ·
                    Disciplina: Matemática ·
                    2º Bimestre
                </div>

            </div>

            <h1 class="section-title">
                JANELA DE DIGITAÇÃO ABERTA ·
                Encerramento em 30/04/2026 às 23:59
            </h1>

            <h2 class="section-title">
                LANÇAMENTO E ACOMPANHAMENTO BIMESTRAL
            </h2>

            <div
                id="lista"
                class="loading"
                role="status"
            >
                Carregando acompanhamentos...
            </div>

            <div class="panel">

                <h2>
                    Novo acompanhamento
                </h2>

                <form id="acompanhamento">

                    <div class="form-grid">

                        ${select(
                            'aluno',
                            'Aluno',
                            [
                                'Lucas Sevino',
                                'Maria Lourdes',
                                'Ramos Batista'
                            ]
                        )}

                        ${select(
                            'disciplina',
                            'Disciplina',
                            [
                                'Matemática',
                                'Português',
                                'Ciências',
                                'História'
                            ]
                        )}

                        ${select(
                            'bimestre',
                            'Bimestre',
                            [
                                '1º Bimestre',
                                '2º Bimestre',
                                '3º Bimestre',
                                '4º Bimestre'
                            ]
                        )}

                        ${linhaCampo(
                            'media',
                            'Média bimestral (0 a 10)',
                            'number'
                        )}

                        <div class="wide field">

                            Tags de acompanhamento

                            <div class="check-row">

                                ${
                                    tagsProfessor
                                        .map(
                                            t => `
                                                <label>

                                                    <input
                                                        type="checkbox"
                                                        name="tags"
                                                        value="${t}"
                                                    >

                                                    ${t}

                                                </label>
                                            `
                                        )
                                        .join('')
                                }

                            </div>

                        </div>

                        <label class="field wide">

                            Avaliação / descrição do professor

                            <textarea
                                name="descricao"
                                minlength="10"
                                required
                            ></textarea>

                        </label>

                    </div>

                    <div class="record-actions">

                        <button
                            class="primary"
                            name="acao"
                            value="Rascunho"
                        >
                            Salvar rascunho
                        </button>

                        <button
                            class="primary"
                            name="acao"
                            value="Pendente"
                        >
                            Enviar para revisão
                        </button>

                    </div>

                </form>

            </div>
        `,
        '/professor'
    );

    let itens;

    try {
        itens =
            await carregarDados(
                'acompanhamentos'
            );
    } catch (e) {
        document.querySelector(
            '#lista'
        ).innerHTML = `
            <div class="message error">

                ${limpo(e.message)}

                <button
                    class="small-button"
                    id="repetir"
                >
                    Tentar novamente
                </button>

            </div>
        `;

        document.querySelector(
            '#repetir'
        ).onclick =
            professor;

        return;
    }

    if (
        caminho() !==
        'professor'
    ) {
        return;
    }

    const lista =
        document.querySelector(
            '#lista'
        );

    function desenhar() {
        lista.className =
            'cards';

        lista.innerHTML =
            itens
                .map(
                    fichaProfessor
                )
                .join('');

        document
            .querySelectorAll(
                '.editar'
            )
            .forEach(b => {
                b.onclick = () => {
                    const x =
                        itens.find(
                            v =>
                                v.id ===
                                Number(
                                    b.dataset.id
                                )
                        );

                    const f =
                        document.querySelector(
                            '#acompanhamento'
                        );

                    f.aluno.value =
                        x.aluno;

                    f.disciplina.value =
                        x.disciplina;

                    f.bimestre.value =
                        x.bimestre;

                    f.media.value =
                        x.media;

                    f.descricao.value =
                        x.descricao;

                    f
                        .querySelectorAll(
                            '[name=tags]'
                        )
                        .forEach(el => {
                            el.checked =
                                x.tags.includes(
                                    el.value
                                );
                        });

                    f.dataset.editar =
                        x.id;

                    f.scrollIntoView({
                        behavior:
                            'smooth'
                    });
                };
            });
    }

    desenhar();

    document.querySelector(
        '#acompanhamento'
    ).onsubmit = e => {
        e.preventDefault();

        const f =
            e.currentTarget;

        if (
            !f.reportValidity()
        ) {
            return;
        }

        const data =
            new FormData(f);

        const media =
            Number(
                data.get('media')
            );

        if (
            media < 0 ||
            media > 10
        ) {
            return aviso(
                'A média deve estar entre 0 e 10.',
                'error'
            );
        }

        const tags =
            data.getAll(
                'tags'
            );

        if (
            !tags.length
        ) {
            return aviso(
                'Selecione ao menos uma tag.',
                'error'
            );
        }

        const x = {
            id:
                Number(
                    f.dataset.editar
                ) ||
                Date.now(),

            aluno:
                data.get(
                    'aluno'
                ),

            disciplina:
                data.get(
                    'disciplina'
                ),

            turma:
                '6º Ano B',

            bimestre:
                data.get(
                    'bimestre'
                ),

            media:
                media.toFixed(1),

            descricao:
                data.get(
                    'descricao'
                ),

            tags,

            status:
                e.submitter.value
        };

        const pos =
            itens.findIndex(
                v =>
                    v.id ===
                    x.id
            );

        if (pos >= 0) {
            itens[pos] = x;
        } else {
            itens.unshift(x);
        }

        guardarDados(
            'acompanhamentos',
            itens
        );

        delete f.dataset.editar;

        f.reset();

        desenhar();

        aviso(
            x.status ===
            'Rascunho'
                ? 'Rascunho salvo.'
                : 'Acompanhamento enviado para revisão.'
        );
    };
}

async function aluno() {
    casca(
        titulos.aluno,
        `
            <nav
                class="filter"
                aria-label="Bimestres"
            >

                ${
                    [
                        1,
                        2,
                        3,
                        4
                    ]
                        .map(
                            n => `
                                <a
                                    class="small-button"
                                    href="#/aluno?bimestre=${n}"
                                >
                                    ${n}º Bimestre
                                </a>
                            `
                        )
                        .join('')
                }

            </nav>

            <div class="stats">

                <div class="panel">

                    <strong>
                        Resumo do Bimestre
                    </strong>

                    <p>
                        Status:
                        Relatório publicado pela coordenação
                    </p>

                    <p>
                        Média geral do bimestre:
                        <b>8,5</b>
                    </p>

                    <p>
                        Faltas:
                        dentro do limite
                    </p>

                </div>

                <div class="panel">

                    <strong>
                        Comunicação com a Escola
                    </strong>

                    <form id="mensagem">

                        <label class="field">

                            Digite sua mensagem

                            <textarea
                                name="mensagem"
                                minlength="5"
                                required
                            ></textarea>

                        </label>

                        <button class="small-button">
                            Enviar mensagem
                        </button>

                    </form>

                </div>

                <div class="panel">

                    <strong>
                        Confirmação de Ciência
                    </strong>

                    <p id="ciencia-estado">
                        Consulte e confirme a ciência do relatório.
                    </p>

                    <button
                        class="small-button"
                        id="ciencia"
                    >
                        Confirmar Ciência
                    </button>

                </div>

            </div>

            <h1 class="section-title">
                AVALIAÇÕES E DESENVOLVIMENTO POR DISCIPLINA
            </h1>

            <div
                id="lista"
                class="loading"
                role="status"
            >
                Carregando relatórios...
            </div>

            <div class="form-actions">

                <button
                    id="pdf"
                    class="primary"
                >
                    Baixar PDF / Imprimir
                </button>

            </div>
        `,
        '/aluno'
    );

    let itens;

    try {
        itens =
            await carregarDados(
                'acompanhamentos'
            );
    } catch (e) {
        document.querySelector(
            '#lista'
        ).innerHTML = `
            <div class="message error">

                ${limpo(e.message)}

                <button
                    class="small-button"
                    id="repetir"
                >
                    Tentar novamente
                </button>

            </div>
        `;

        document.querySelector(
            '#repetir'
        ).onclick =
            aluno;

        return;
    }

    if (
        caminho() !==
        'aluno'
    ) {
        return;
    }

    const publicado =
        itens.filter(
            x =>
                x.status ===
                'Publicado'
        );

    document.querySelector(
        '#lista'
    ).innerHTML =
        publicado.length
            ? publicado
                .map(
                    x => `
                        <article class="record">

                            <div class="record-head">

                                <strong>
                                    ${
                                        limpo(
                                            x.disciplina
                                        ).toUpperCase()
                                    }
                                </strong>

                                <strong>
                                    Média Bimestral:
                                    ${limpo(x.media)}
                                </strong>

                            </div>

                            <div class="chips">

                                ${
                                    x.tags
                                        .map(
                                            t => `
                                                <span class="chip">
                                                    ${limpo(t)}
                                                </span>
                                            `
                                        )
                                        .join('')
                                }

                            </div>

                            <strong>
                                Avaliação do professor:
                            </strong>

                            ${limpo(x.descricao)}

                        </article>
                    `
                )
                .join('')
            : `
                <div class="panel">
                    Ainda não há relatórios publicados.
                </div>
            `;

    const ciencia =
        localStorage.getItem(
            'kfka_ciencia'
        );

    if (ciencia) {
        document.querySelector(
            '#ciencia-estado'
        ).textContent =
            `Ciência registrada em ${ciencia}`;
    }

    document.querySelector(
        '#ciencia'
    ).onclick = () => {
        const data =
            new Date()
                .toLocaleString(
                    'pt-BR'
                );

        localStorage.setItem(
            'kfka_ciencia',
            data
        );

        document.querySelector(
            '#ciencia-estado'
        ).textContent =
            `Ciência registrada em ${data}`;

        aviso(
            'Ciência confirmada nesta demonstração.'
        );
    };

    document.querySelector(
        '#mensagem'
    ).onsubmit = e => {
        e.preventDefault();

        if (
            e.target.reportValidity()
        ) {
            aviso(
                'Mensagem registrada nesta demonstração.'
            );

            e.target.reset();
        }
    };

    document.querySelector(
        '#pdf'
    ).onclick = () =>
        window.print();
}

function rota() {
    const r =
        caminho();

    if (
        r === 'login'
    ) {
        acesso();
    } else if (
        r === 'acesso'
    ) {
        telaAcesso();
    } else if (
        r ===
        'administrador'
    ) {
        menuAdmin();
    } else if (
        r === 'professor'
    ) {
        professor();
    } else if (
        r === 'aluno'
    ) {
        aluno();
    } else if (
        configs[r]
    ) {
        cadastro(r);
    } else {
        casca(
            'Página não encontrada',
            `
                <div class="notfound">

                    <h1>
                        404 · Página não encontrada
                    </h1>

                    <p>
                        Este endereço não existe.
                    </p>

                    <a
                        class="primary"
                        href="#/login"
                    >
                        Voltar ao início
                    </a>

                </div>
            `,
            '/login'
        );
    }
}

window.addEventListener(
    'hashchange',
    rota
);

rota();