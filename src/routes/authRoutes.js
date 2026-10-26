const express = require("express");
const usuarioModel = require("../models/usuarioModel");
const sessaoModel = require("../models/sessaoModel");
const validation = require("../utils/validation");
const {
    gerarHashSenha,
    gerarToken,
    hashToken
} = require("../utils/security");
const { conferirSenha } = require("../utils/senha");
const {
    definirCookieSessao,
    limparCookieSessao,
    DIAS_SESSAO
} = require("../middleware/sessao");

const router = express.Router();

function renderizarLogin(res, extras = {}) {
    return res.render("login", {
        titulo: "Entrar",
        email: extras.email || "",
        erro: extras.erro || null
    });
}

function renderizarCadastro(res, extras = {}) {
    return res.render("criar_conta", {
        titulo: "Criar conta",
        dados: extras.dados || {},
        erro: extras.erro || null
    });
}

router.get(["/", "/login"], (req, res) => {
    if (req.usuario) {
        return res.redirect("/inicio");
    }

    return renderizarLogin(res);
});

router.post("/login", async (req, res) => {
    const email = validation.email(req.body.email);
    const senha = validation.texto(req.body.senha, 200);

    if (!email || !senha) {
        return renderizarLogin(res, {
            email: validation.texto(req.body.email, 150),
            erro: "Informe um e-mail válido e a senha."
        });
    }

    const usuario = await usuarioModel.buscarPorEmail(email);
    const senhaValida = await conferirSenha(usuario, senha);

    if (!usuario || !senhaValida) {
        return renderizarLogin(res, {
            email,
            erro: "E-mail ou senha incorretos."
        });
    }

    const token = gerarToken();

    await sessaoModel.limparExpiradas();
    await sessaoModel.criar(usuario.id_usuario, hashToken(token), DIAS_SESSAO);
    definirCookieSessao(res, token);

    return res.redirect("/inicio?ok=login-ok");
});

router.post("/logout", async (req, res) => {
    if (req.tokenSessao) {
        try {
            await sessaoModel.excluir(hashToken(req.tokenSessao));
        } catch (erro) {
            console.error("Falha ao encerrar a sessão:", erro.message);
        }
    }

    limparCookieSessao(res);

    return res.redirect("/login?ok=logout-ok");
});

router.get("/criar-conta", (req, res) => {
    if (req.usuario) {
        return res.redirect("/inicio");
    }

    return renderizarCadastro(res);
});

router.post("/criar-conta", async (req, res) => {
    const nome = validation.texto(req.body.nome, 100);
    const email = validation.email(req.body.email);
    const telefone = validation.texto(req.body.telefone, 30);
    const senha = validation.texto(req.body.senha, 200);
    const confirmarSenha = validation.texto(req.body.confirmarSenha, 200);
    const dados = { nome, email: req.body.email, telefone };

    if (!nome || !email || !senha) {
        return renderizarCadastro(res, {
            dados,
            erro: "Informe nome, e-mail e senha."
        });
    }

    const forca = validation.senha(senha);

    if (!forca.valida) {
        return renderizarCadastro(res, { dados, erro: forca.mensagem });
    }

    if (senha !== confirmarSenha) {
        return renderizarCadastro(res, {
            dados,
            erro: "A senha e a confirmação não são iguais."
        });
    }

    const existente = await usuarioModel.buscarPorEmail(email);

    if (existente) {
        return renderizarCadastro(res, {
            dados,
            erro: "Este e-mail já está cadastrado."
        });
    }

    const senhaHash = await gerarHashSenha(senha);
    await usuarioModel.criar({ nome, email, senhaHash, telefone });

    return res.redirect("/login?ok=conta-criada");
});

module.exports = router;
