const express = require("express");
const path = require("path");
const conexao = require("./src/config/db");

const app = express();

// ==========================================
// CONFIGURAÇÃO DO EJS
// ==========================================

app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// ==========================================
// ARQUIVOS ESTÁTICOS
// ==========================================

app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// PROCESSAMENTO DE FORMULÁRIOS
// ==========================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// LOGIN
// ==========================================

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/login", (req, res) => {
    res.render("login");
});

// ==========================================
// CRIAR CONTA
// ==========================================

app.get("/criar-conta", (req, res) => {
    res.render("criar_conta");
});

// ==========================================
// ALTERAR SENHA
// ==========================================

app.get("/alterar-senha", (req, res) => {
    res.render("alterar_senha");
});

// ==========================================
// CADASTRAR USUÁRIO NO BANCO
// ==========================================

app.post("/criar-conta", (req, res) => {

    console.log("Dados recebidos no cadastro:", req.body);

    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;

    // Verifica se os campos foram preenchidos
    if (!nome || !email || !senha) {
        return res.send("Preencha todos os campos do cadastro.");
    }

    const sql = `
        INSERT INTO usuarios (nome, email, senha)
        VALUES (?, ?, ?)
    `;

    conexao.query(sql, [nome, email, senha], (erro, resultado) => {

        if (erro) {

            console.log("Erro ao cadastrar usuário:", erro);

            // Caso o e-mail já esteja cadastrado
            if (erro.code === "ER_DUP_ENTRY") {
                return res.send("Este e-mail já está cadastrado.");
            }

            return res.send("Erro ao cadastrar usuário.");
        }

        console.log("Usuário cadastrado com sucesso!");
        console.log("ID do usuário:", resultado.insertId);

        res.redirect("/login");
    });
});

// ==========================================
// PROCESSAR LOGIN
// ==========================================

app.post("/login", (req, res) => {

    console.log("Dados recebidos no login:", req.body);

    const email = req.body.email;
    const senha = req.body.senha;

    if (!email || !senha) {
        return res.send("Digite o e-mail e a senha.");
    }

    const sql = `
        SELECT id_usuario, nome, email
        FROM usuarios
        WHERE email = ? AND senha = ?
    `;

    conexao.query(sql, [email, senha], (erro, resultados) => {

        if (erro) {

            console.log("Erro ao fazer login:", erro);

            return res.send("Erro ao consultar o banco de dados.");
        }

        if (resultados.length === 0) {

            return res.send("E-mail ou senha incorretos.");
        }

        const usuario = resultados[0];

        console.log("Login realizado com sucesso!");
        console.log("Usuário:", usuario.nome);

        res.redirect("/inicio");
    });
});

// ==========================================
// INÍCIO
// ==========================================

app.get("/inicio", (req, res) => {
    res.render("inicio");
});

// ==========================================
// OUTRAS PÁGINAS
// ==========================================

app.get("/cadastro-produto", (req, res) => {
    res.render("cadastro_produto");
});

app.get("/comercial", (req, res) => {
    res.render("comercial");
});

app.get("/configuracoes", (req, res) => {
    res.render("configuracoes");
});

app.get("/consulta", (req, res) => {
    res.render("consulta");
});

app.get("/controle-de-gastos", (req, res) => {
    res.render("controle_de_gastos");
});

app.get("/dados-colheita", (req, res) => {
    res.render("dados_colheita");
});

app.get("/editar-perfil", (req, res) => {
    res.render("editar_perfil");
});

app.get("/perdas", (req, res) => {
    res.render("perdas");
});

app.get("/producao", (req, res) => {
    res.render("producao");
});

app.get("/produtos", (req, res) => {
    res.render("produtos");
});

app.get("/registrar-vendas", (req, res) => {
    res.render("registrar_vendas");
});

app.get("/relatorios", (req, res) => {
    res.render("relatorios");
});

app.get("/vendas", (req, res) => {
    res.render("vendas");
});

// ==========================================
// ERRO 404
// ==========================================

app.use((req, res) => {
    res.status(404).send("Página não encontrada!");
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
