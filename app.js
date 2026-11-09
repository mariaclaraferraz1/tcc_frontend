const express = require('express');
const path = require('path');
const app = express();

// CONFIGURAÇÃO DO EJS E PASTAS
app.set('view engine', 'ejs');
// Aponta para a pasta views (ajuste se a sua pasta views não estiver dentro de 'src')
app.set('views', path.join(__dirname, 'src', 'views'));

// ARQUIVOS ESTÁTICOS (CSS, Imagens, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// LEITURA DE DADOS DE FORMULÁRIO
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// ROTAS DO SISTEMA
// ==========================================

// Tela Principal (Login)
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// AÇÃO DO FORMULÁRIO DE LOGIN (Força o envio para /inicio)
app.post('/login', (req, res) => {
    res.redirect('/inicio');
});

// Tela de Início
app.get('/inicio', (req, res) => {
    res.render('inicio');
});

// Outras Telas do Sistema
app.get('/criar-conta', (req, res) => res.render('criar_conta'));
app.get('/produtos', (req, res) => res.render('produtos'));
app.get('/cadastro-produto', (req, res) => res.render('cadastro_produto'));
app.get('/producao', (req, res) => res.render('producao'));
app.get('/comercial', (req, res) => res.render('vendas'));
app.get('/relatorios', (req, res) => res.render('relatorios'));
app.get('/consulta', (req, res) => res.render('consulta'));
app.get('/configuracoes', (req, res) => res.render('configuracoes'));

// ==========================================
// TRATAMENTO DE ERRO (SEMPRE POR ÚLTIMO)
// ==========================================
app.use((req, res) => {
    res.status(404).send('Página não encontrada! Verifique a rota digitada.');
});

// INICIALIZAÇÃO DO SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
