require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sistema = require('./models/sistemaKFKA');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/login', async (req, res) => {
  try {
    const { usuario, senha, perfil } = req.body;
    const dadosUsuario = await sistema.autenticar(usuario, senha, perfil);
    res.json({ usuario: dadosUsuario });
  } catch (err) {
    res.status(401).json({ erro: err.message });
  }
});

app.post('/api/definir-senha', async (req, res) => {
  try {
    const { identificador, novaSenha } = req.body;
    const resp = await sistema.definirSenhaResponsavel(identificador, novaSenha);
    res.json(resp);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.post('/api/recuperar-senha', async (req, res) => {
  try {
    const { identificador } = req.body;
    const resposta = await sistema.recuperarSenha(identificador);
    res.json(resposta);
  } catch (err) {
    res.status(404).json({ erro: err.message });
  }
});

app.get('/api/acompanhamentos', async (req, res) => {
  try {
    const lista = await sistema.listarAcompanhamentos(req.query);
    res.json(lista);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/acompanhamentos/:id', async (req, res) => {
  try {
    const item = await sistema.buscarAcompanhamentoPorId(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(404).json({ erro: err.message });
  }
});

app.post('/api/acompanhamentos', async (req, res) => {
  try {
    const criado = await sistema.criarAcompanhamento(req.body);
    res.status(201).json(criado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.put('/api/acompanhamentos/:id', async (req, res) => {
  try {
    const atualizado = await sistema.atualizarAcompanhamento(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.delete('/api/acompanhamentos/:id', async (req, res) => {
  try {
    const resp = await sistema.removerAcompanhamento(req.params.id);
    res.json(resp);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.get('/api/historico', async (req, res) => {
  try {
    const lista = await sistema.listarHistorico();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/:rota', async (req, res) => {
  try {
    const lista = await sistema.listarEntidade(req.params.rota);
    res.json(lista);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.get('/api/:rota/:id', async (req, res) => {
  try {
    const item = await sistema.buscarEntidadePorId(req.params.rota, req.params.id);
    res.json(item);
  } catch (err) {
    res.status(404).json({ erro: err.message });
  }
});

app.post('/api/:rota', async (req, res) => {
  try {
    const criado = await sistema.criarEntidade(req.params.rota, req.body);
    res.status(201).json(criado);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe um cadastro com este CPF, RA, Matrícula ou Nome.' });
    }
    res.status(400).json({ erro: err.message });
  }
});

app.put('/api/:rota/:id', async (req, res) => {
  try {
    const atualizado = await sistema.atualizarEntidade(req.params.rota, req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.delete('/api/:rota/:id', async (req, res) => {
  try {
    const resp = await sistema.removerEntidade(req.params.rota, req.params.id);
    res.json(resp);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor KFKA rodando em http://localhost:${PORT}`);
});
