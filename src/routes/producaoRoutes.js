const express = require("express");
const producaoModel = require("../models/producaoModel");
const plantioModel = require("../models/plantioModel");
const produtoModel = require("../models/produtoModel");
const validation = require("../utils/validation");
const { hojeISO } = require("../utils/format");
const { filtrosBasicos } = require("./_helpers");
const { STATUS_PLANTIO } = require("../config/constantes");

const router = express.Router();

router.get("/producao", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const [colheitas, resumoColheitas, plantios, resumoPlantio] = await Promise.all([
        producaoModel.listar(idUsuario, {}),
        producaoModel.resumo(idUsuario, {}),
        plantioModel.listar(idUsuario, {}),
        plantioModel.resumo(idUsuario)
    ]);

    return res.render("producao", {
        titulo: "Produção",
        resumoColheitas,
        resumoPlantio,
        ultimasColheitas: colheitas.slice(0, 5),
        ultimosPlantios: plantios.slice(0, 5)
    });
});

async function renderizarColheita(res, idUsuario, filtros, extras = {}) {
    const [colheitas, resumo, produtos] = await Promise.all([
        producaoModel.listar(idUsuario, filtros),
        producaoModel.resumo(idUsuario, filtros),
        produtoModel.listarAtivos(idUsuario)
    ]);

    return res.status(extras.status || 200).render("dados_colheita", {
        titulo: "Dados da colheita",
        colheitas,
        resumo,
        produtos,
        filtros,
        dados: extras.dados || { dataProducao: hojeISO() },
        erro: extras.erro || null
    });
}

router.get("/dados-colheita", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query);

    filtros.idProduto = validation.id(req.query.idProduto) || "";

    return renderizarColheita(res, idUsuario, filtros);
});

router.post("/dados-colheita", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idProduto = validation.id(req.body.idProduto);
    const quantidade = validation.numero(req.body.quantidade);
    const peso = validation.numero(req.body.peso);
    const dataPlantio = validation.data(req.body.dataPlantio, false);
    const dataProducao = validation.data(req.body.dataProducao, true);
    const observacoes = validation.texto(req.body.observacoes, 1000);

    const dados = {
        idProduto: req.body.idProduto || "",
        quantidade: req.body.quantidade || "",
        peso: req.body.peso || "",
        dataPlantio: req.body.dataPlantio || "",
        dataProducao: req.body.dataProducao || hojeISO(),
        observacoes
    };

    const filtros = filtrosBasicos({});

    function erro(mensagem, status = 400) {
        return renderizarColheita(res, idUsuario, filtros, {
            status,
            dados,
            erro: mensagem
        });
    }

    if (!idProduto) {
        return erro("Selecione um produto válido.");
    }

    if (quantidade === null || quantidade <= 0) {
        return erro("Informe uma quantidade colhida maior que zero.");
    }

    if (peso === null || peso < 0) {
        return erro("Informe um peso válido (maior ou igual a zero).");
    }

    if (!dataProducao) {
        return erro("Informe uma data de colheita válida.");
    }

    if (dataPlantio && dataPlantio > dataProducao) {
        return erro("A data do plantio não pode ser posterior à data da colheita.");
    }

    const produto = await produtoModel.buscarPorId(idProduto, idUsuario);

    if (!produto || !produto.ativo) {
        return erro("O produto selecionado não pertence à sua conta ou está inativo.");
    }

    await producaoModel.criar({
        idUsuario,
        idProduto,
        quantidade,
        peso,
        dataPlantio,
        dataProducao,
        observacoes
    });

    return res.redirect("/dados-colheita?ok=colheita-criada");
});

router.post("/dados-colheita/:id/excluir", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idProducao = validation.id(req.params.id);

    if (!idProducao) {
        return res.redirect("/dados-colheita?erro=colheita-nao-encontrada");
    }

    const removido = await producaoModel.excluir(idProducao, idUsuario);

    if (!removido) {
        return res.redirect("/dados-colheita?erro=colheita-nao-encontrada");
    }

    return res.redirect("/dados-colheita?ok=colheita-removida");
});

async function renderizarPlantio(res, idUsuario, filtros, extras = {}) {
    const [plantios, resumo] = await Promise.all([
        plantioModel.listar(idUsuario, filtros),
        plantioModel.resumo(idUsuario)
    ]);

    return res.status(extras.status || 200).render("plantio", {
        titulo: "Plantio",
        plantios,
        resumo,
        filtros,
        statusOpcoes: STATUS_PLANTIO,
        dados: extras.dados || { dataPlantio: hojeISO(), status: "germinacao" },
        erro: extras.erro || null
    });
}

router.get("/plantio", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query, ["status"]);

    return renderizarPlantio(res, idUsuario, filtros);
});

router.post("/plantio", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const cultura = validation.texto(req.body.cultura, 150);
    const area = validation.texto(req.body.area, 150);
    const dataPlantio = validation.data(req.body.dataPlantio, true);
    const status = validation.texto(req.body.status, 30);
    const observacoes = validation.texto(req.body.observacoes, 1000);

    const dados = {
        cultura: req.body.cultura || "",
        area: req.body.area || "",
        dataPlantio: req.body.dataPlantio || hojeISO(),
        status: req.body.status || "germinacao",
        observacoes
    };

    const filtros = filtrosBasicos({});

    function erro(mensagem, status = 400) {
        return renderizarPlantio(res, idUsuario, filtros, {
            status,
            dados,
            erro: mensagem
        });
    }

    if (!cultura) {
        return erro("Informe a cultura ou variedade plantada.");
    }

    if (!area) {
        return erro("Informe a área ou talhão do plantio.");
    }

    if (!dataPlantio) {
        return erro("Informe uma data de plantio válida.");
    }

    if (!plantioModel.STATUS_VALIDOS.includes(status)) {
        return erro("Selecione um status válido para o plantio.");
    }

    await plantioModel.criar({
        idUsuario,
        cultura,
        area,
        dataPlantio,
        status,
        observacoes
    });

    return res.redirect("/plantio?ok=plantio-criado");
});

router.post("/plantio/:id/excluir", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idPlantio = validation.id(req.params.id);

    if (!idPlantio) {
        return res.redirect("/plantio?erro=plantio-nao-encontrado");
    }

    const removido = await plantioModel.excluir(idPlantio, idUsuario);

    if (!removido) {
        return res.redirect("/plantio?erro=plantio-nao-encontrado");
    }

    return res.redirect("/plantio?ok=plantio-removido");
});

module.exports = router;
