const path = require("path");
const express = require("express");

const { testarConexao, descricaoConexao } = require("./src/config/db");
const {
    carregarSessao,
    locais,
    exigirLogin,
    naoEncontrado,
    tratarErro
} = require("./src/middleware/sessao");

const app = express();
const PORTA = Number(process.env.PORT || 3000);

// ---------------------------------------------------------------------------
// Configuração do EJS e arquivos estáticos
// ---------------------------------------------------------------------------
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");
app.disable("x-powered-by");

// Anexos enviados: o arquivo fica em public/uploads e só é servido com sessão ativa.
app.use(
    "/uploads",
    carregarSessao,
    exigirLogin,
    express.static(path.join(__dirname, "public", "uploads"))
);

app.use(express.static(path.join(__dirname, "public")));

// Os formulários enviam anexos como data URL (base64); o servidor grava o arquivo
// em public/uploads e mantém apenas o caminho no banco.
app.use(express.urlencoded({ extended: true, limit: "3mb" }));
app.use(express.json({ limit: "3mb" }));

// ---------------------------------------------------------------------------
// Sessão e variáveis disponíveis em todas as views
// ---------------------------------------------------------------------------
app.use(carregarSessao);
app.use(locais);

// ---------------------------------------------------------------------------
// Rotas públicas (login, cadastro e logout)
// ---------------------------------------------------------------------------
app.use(require("./src/routes/authRoutes"));

// ---------------------------------------------------------------------------
// Rotas protegidas
// ---------------------------------------------------------------------------
app.use(exigirLogin);

app.use(require("./src/routes/painelRoutes"));
app.use(require("./src/routes/produtoRoutes"));
app.use(require("./src/routes/vendaRoutes"));
app.use(require("./src/routes/gastoRoutes"));
app.use(require("./src/routes/perdaRoutes"));
app.use(require("./src/routes/lucroRoutes"));
app.use(require("./src/routes/relatorioRoutes"));
app.use(require("./src/routes/consultaRoutes"));
app.use(require("./src/routes/configuracaoRoutes"));
app.use(require("./src/routes/producaoRoutes"));
app.use(require("./src/routes/apiRoutes"));

// ---------------------------------------------------------------------------
// 404 e tratamento central de erros
// ---------------------------------------------------------------------------
app.use(naoEncontrado);
app.use(tratarErro);

if (require.main === module) {
    testarConexao()
        .then(() => {
            console.log(`Banco de dados conectado: ${descricaoConexao()}`);
        })
        .catch((erro) => {
            console.warn(
                `Atenção: não foi possível conectar ao banco (${descricaoConexao()}): ${erro.message}`
            );
        });

    app.listen(PORTA, () => {
        console.log(`Servidor rodando em http://localhost:${PORTA}`);
    });
}

module.exports = app;
