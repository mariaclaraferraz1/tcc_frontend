const express = require("express");
const usuarioModel = require("../models/usuarioModel");
const sessaoModel = require("../models/sessaoModel");
const validation = require("../utils/validation");
const { gerarHashSenha, hashToken } = require("../utils/security");
const { conferirSenha } = require("../utils/senha");
const { booleano } = require("./_helpers");

const router = express.Router();

router.get("/configuracoes", async (req, res) => {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id_usuario);

    return res.render("configuracoes", {
        titulo: "Configurações",
        usuario,
        erro: null
    });
});

router.post("/configuracoes/notificacoes", async (req, res) => {
    await usuarioModel.atualizarPreferencias(req.usuario.id_usuario, {
        notificacoesSistema: booleano(req.body.notificacoesSistema),
        lembretes: booleano(req.body.lembretes)
    });

    return res.redirect("/configuracoes?ok=preferencias-atualizadas");
});

router.get("/editar-perfil", async (req, res) => {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id_usuario);

    return res.render("editar_perfil", {
        titulo: "Editar perfil",
        dados: usuario,
        erro: null
    });
});

router.post("/editar-perfil", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const nome = validation.texto(req.body.nome, 100);
    const email = validation.email(req.body.email);
    const telefone = validation.texto(req.body.telefone, 30);
    const dados = { nome, email: req.body.email, telefone };

    function erro(mensagem) {
        return res.status(400).render("editar_perfil", {
            titulo: "Editar perfil",
            dados,
            erro: mensagem
        });
    }

    if (!nome) {
        return erro("Informe o nome completo.");
    }

    if (!email) {
        return erro("Informe um e-mail válido.");
    }

    const emUso = await usuarioModel.emailEmUso(email, idUsuario);

    if (emUso) {
        return erro("Este e-mail já está sendo usado por outra conta.");
    }

    await usuarioModel.atualizarPerfil(idUsuario, { nome, email, telefone });

    return res.redirect("/configuracoes?ok=perfil-atualizado");
});

function renderizarAlterarSenha(res, extras = {}) {
    return res.status(extras.status || 200).render("alterar_senha", {
        titulo: "Alterar senha",
        erro: extras.erro || null
    });
}

router.get("/alterar-senha", (req, res) => {
    return renderizarAlterarSenha(res);
});

router.post("/alterar-senha", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const senhaAtual = validation.texto(req.body.senhaAtual, 200);
    const novaSenha = validation.texto(req.body.novaSenha, 200);
    const confirmarSenha = validation.texto(req.body.confirmarSenha, 200);

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        return renderizarAlterarSenha(res, {
            status: 400,
            erro: "Preencha todos os campos."
        });
    }

    const usuario = await usuarioModel.buscarPorEmail(req.usuario.email);

    if (!usuario || !(await conferirSenha(usuario, senhaAtual))) {
        return renderizarAlterarSenha(res, {
            status: 400,
            erro: "A senha atual informada está incorreta."
        });
    }

    if (senhaAtual === novaSenha) {
        return renderizarAlterarSenha(res, {
            status: 400,
            erro: "A nova senha deve ser diferente da senha atual."
        });
    }

    const forca = validation.senha(novaSenha);

    if (!forca.valida) {
        return renderizarAlterarSenha(res, { status: 400, erro: forca.mensagem });
    }

    if (novaSenha !== confirmarSenha) {
        return renderizarAlterarSenha(res, {
            status: 400,
            erro: "A nova senha e a confirmação não são iguais."
        });
    }

    const senhaHash = await gerarHashSenha(novaSenha);
    await usuarioModel.atualizarSenha(idUsuario, senhaHash);

    if (req.tokenSessao) {
        await sessaoModel.excluirOutrasSessoes(idUsuario, hashToken(req.tokenSessao));
    }

    return res.redirect("/configuracoes?ok=senha-atualizada");
});

module.exports = router;
