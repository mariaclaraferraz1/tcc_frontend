const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "img")));

app.get("/", (req, res) => {
    res.render("inicio");
});

app.get("/produtos", (req, res) => {
    res.send("Página de produtos");
});

app.get("/producao", (req, res) => {
    res.send("Página de produção");
});

app.get("/comercial", (req, res) => {
    res.send("Página comercial");
});

app.get("/relatorios", (req, res) => {
    res.send("Página de relatórios");
});

app.get("/consulta", (req, res) => {
    res.send("Página de consulta");
});

app.get("/configuracoes", (req, res) => {
    res.send("Página de configurações");
});

app.get("/vendas", (req, res) => {
    res.send("Página de vendas");
});

app.listen(3000, () => {
    console.log("Rural Tech rodando em http://localhost:3000");
});