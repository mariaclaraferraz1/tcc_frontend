const express = require("express");

const app = express();

const PORT = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/inicio", (req, res) => {
    res.render("inicio");
});

app.get("/alterar-senha", (req, res) => {
    res.render("alterar_senha");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});