const http = require('http');
const fs = require('fs');
const path = require('path');
const SistemaKFKA = require('./sistema');

const HOST = '127.0.0.1';
const PORTA = 8000;
const PASTA_FRONTEND = path.resolve(__dirname, '..');

const sistema = new SistemaKFKA();

const tiposPermitidos = new Set([
    'turmas',
    'professores',
    'responsaveis',
    'alunos',
    'tags',
    'acompanhamentos'
]);

const tiposMime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function enviarJson(res, status, dados) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8'
    });

    res.end(JSON.stringify(dados));
}

function lerCorpoJson(req) {
    return new Promise((resolve, reject) => {
        let corpo = '';

        req.on('data', parte => {
            corpo += parte;

            if (corpo.length > 2_000_000) {
                reject(new Error('Dados enviados são muito grandes.'));
                req.destroy();
            }
        });

        req.on('end', () => {
            try {
                resolve(corpo ? JSON.parse(corpo) : null);
            } catch {
                reject(new Error('JSON inválido.'));
            }
        });

        req.on('error', reject);
    });
}

async function tratarApi(req, res, url) {
    const partes = url.pathname.split('/').filter(Boolean);
    const tipo = partes[1];

    if (partes.length !== 2 || !tiposPermitidos.has(tipo)) {
        enviarJson(res, 404, { erro: 'Rota da API não encontrada.' });
        return;
    }

    try {
        if (req.method === 'GET') {
            enviarJson(res, 200, sistema.listar(tipo));
            return;
        }

        if (req.method === 'PUT') {
            const registros = await lerCorpoJson(req);
            const resultado = sistema.salvarLista(tipo, registros);
            enviarJson(res, 200, resultado);
            return;
        }

        enviarJson(res, 405, { erro: 'Método não permitido.' });
    } catch (erro) {
        console.error(erro);
        enviarJson(res, 400, { erro: erro.message });
    }
}

function servirArquivo(res, url) {
    let caminhoPedido = decodeURIComponent(url.pathname);

    if (caminhoPedido === '/') {
        caminhoPedido = '/index.html';
    }

    const caminhoArquivo = path.resolve(
        PASTA_FRONTEND,
        '.' + caminhoPedido
    );

    if (!caminhoArquivo.startsWith(PASTA_FRONTEND + path.sep)) {
        res.writeHead(403);
        res.end('Acesso negado.');
        return;
    }

    fs.stat(caminhoArquivo, (erro, info) => {
        if (erro || !info.isFile()) {
            res.writeHead(404, {
                'Content-Type': 'text/plain; charset=utf-8'
            });
            res.end('Arquivo não encontrado.');
            return;
        }

        const extensao = path.extname(caminhoArquivo).toLowerCase();

        res.writeHead(200, {
            'Content-Type': tiposMime[extensao] || 'application/octet-stream'
        });

        fs.createReadStream(caminhoArquivo).pipe(res);
    });
}

const servidor = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${HOST}:${PORTA}`);

    if (url.pathname.startsWith('/api/')) {
        await tratarApi(req, res, url);
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405);
        res.end('Método não permitido.');
        return;
    }

    servirArquivo(res, url);
});

servidor.listen(PORTA, HOST, () => {
    console.log('===============================================');
    console.log(' KFKA - Servidor local iniciado com sucesso');
    console.log(` http://${HOST}:${PORTA}`);
    console.log('');
    console.log(' Banco: backend/kfka.db');
    console.log(' Para encerrar o servidor, feche esta janela.');
    console.log('===============================================');
});
