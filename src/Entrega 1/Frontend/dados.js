// Comunicação do front-end com o backend local do KFKA.

async function carregarDados(chave) {
    const resposta = await fetch(`/api/${encodeURIComponent(chave)}`);

    if (!resposta.ok) {
        const erro = await resposta.json().catch(() => ({}));
        throw new Error(erro.erro || 'Não foi possível carregar os dados.');
    }

    return resposta.json();
}

function guardarDados(chave, valor) {
    fetch(`/api/${encodeURIComponent(chave)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(valor)
    })
        .then(async resposta => {
            if (!resposta.ok) {
                const erro = await resposta.json().catch(() => ({}));
                throw new Error(erro.erro || 'Não foi possível salvar os dados.');
            }
        })
        .catch(erro => {
            console.error('Erro ao salvar no backend:', erro);
            alert('Não foi possível salvar no banco de dados. Verifique se o servidor local está ligado.');
        });
}
