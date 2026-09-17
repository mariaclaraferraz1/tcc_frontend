const express = require("express");
const path = require("path");
const app = express();

// CONFIGURAÇÃO DO EJS E PASTAS ESTÁTICAS
// Indica que as views estão na pasta src/views
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// Indica onde ficam as pastas de CSS, JS do front e Imagens
app.use(express.static(path.join(__dirname, "public")));

// Middleware para processar dados de formulários (se necessário no cadastro/login)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. ROTA PRINCIPAL (Abre primeiro a tela de Login)
app.get("/", (req, res) => {
  res.render("login");
});

// 2. ROTAS DE AUTENTICAÇÃO
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/criar-conta", (req, res) => {
  res.render("criar_conta");
});

app.get("/alterar-senha", (req, res) => {
  res.render("alterar_senha");
});

// 3. PAINEL PRINCIPAL / DASHBOARD
app.get("/inicio", (req, res) => {
  res.render("inicio");
});

// 4. MÓDULOS DO SISTEMA
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
  res.render("controle_de_gasto");
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

// 5. TRATAMENTO DE ERRO 404 (Sempre por último)
app.use((req, res) => {
  res.status(404).send("Página não encontrada!");
});

// INICIALIZAÇÃO DO SERVIDOR
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
