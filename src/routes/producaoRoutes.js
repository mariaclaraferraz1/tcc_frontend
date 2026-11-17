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

    if (dataPlantio && dataPlantio >= dataProducao) {
        return erro("A data da colheita deve ser posterior à data do plantio.");
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

function somarDias(dataISO, dias) {
    const [ano, mes, dia] = String(dataISO).split("-").map(Number);
    const resultado = new Date(Date.UTC(ano, mes - 1, dia + dias));

    return [
        resultado.getUTCFullYear(),
        String(resultado.getUTCMonth() + 1).padStart(2, "0"),
        String(resultado.getUTCDate()).padStart(2, "0")
    ].join("-");
}

function cicloDoProduto(produto) {
    const ciclo = Number(produto && produto.ciclo_dias);

    return Number.isFinite(ciclo) && ciclo > 0 ? Math.trunc(ciclo) : null;
}

function dadosFormularioPlantio(plantio) {
    if (!plantio) {
        return { dataPlantio: hojeISO(), status: "em_progresso", dataColheita: "" };
    }

    return {
        id: plantio.id_plantio,
        idProduto: plantio.id_produto ? String(plantio.id_produto) : "",
        cultura: plantio.cultura || "",
        variedade: plantio.variedade || "",
        area: plantio.area || "",
        dataPlantio: plantio.data_plantio || hojeISO(),
        status: plantio.status === "colhido" ? "colhido" : "em_progresso",
        dataColheita: plantio.data_colheita || "",
        observacoes: plantio.observacoes || ""
    };
}

async function renderizarPlantio(res, idUsuario, filtros, extras = {}) {
    const [plantios, resumo, produtos] = await Promise.all([
        plantioModel.listar(idUsuario, filtros),
        plantioModel.resumo(idUsuario),
        produtoModel.listarAtivos(idUsuario)
    ]);

    return res.status(extras.status || 200).render("plantio", {
        titulo: extras.plantioEdicao ? "Editar plantio" : "Plantio",
        plantios,
        resumo,
        produtos,
        filtros,
        statusOpcoes: STATUS_PLANTIO,
        plantioEdicao: extras.plantioEdicao || null,
        dados: extras.dados || dadosFormularioPlantio(extras.plantioEdicao),
        erro: extras.erro || null
    });
}

router.get("/plantio", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query, ["status"]);
    let plantioEdicao = null;
    let dadosFormulario = dadosFormularioPlantio();

    if (req.query.editar) {
        const idEdicao = validation.id(req.query.editar);
        plantioEdicao = idEdicao
            ? await plantioModel.buscarPorId(idEdicao, idUsuario)
            : null;

        if (!plantioEdicao) {
            return res.redirect("/plantio?erro=plantio-nao-encontrado");
        }

        dadosFormulario = dadosFormularioPlantio(plantioEdicao);

        // Atalho "Colher": abre a edição já com o status Colhido e a data de hoje.
        if (req.query.colher === "1" && dadosFormulario.status !== "colhido") {
            dadosFormulario.status = "colhido";
            dadosFormulario.dataColheita = hojeISO();
        }
    }

    return renderizarPlantio(res, idUsuario, filtros, {
        plantioEdicao,
        dados: dadosFormulario
    });
});

async function salvarPlantio(req, res, idPlantio = null) {
    const idUsuario = req.usuario.id_usuario;
    const idProduto = validation.id(req.body.idProduto);
    const area = validation.texto(req.body.area, 150);
    const dataPlantio = validation.data(req.body.dataPlantio, true);
    const dataColheita = validation.data(req.body.dataColheita, false);
    const status = validation.texto(req.body.status, 30);
    const observacoes = validation.texto(req.body.observacoes, 1000);

    const dados = {
        id: idPlantio,
        idProduto: req.body.idProduto || "",
        area: req.body.area || "",
        dataPlantio: req.body.dataPlantio || hojeISO(),
        status: idPlantio ? (req.body.status || "em_progresso") : "em_progresso",
        dataColheita: req.body.dataColheita || "",
        observacoes
    };

    let plantioEdicao = null;

    if (idPlantio) {
        plantioEdicao = await plantioModel.buscarPorId(idPlantio, idUsuario);

        if (!plantioEdicao) {
            return res.redirect("/plantio?erro=plantio-nao-encontrado");
        }
    }

    const filtros = filtrosBasicos({});

    function erro(mensagem, status = 400) {
        return renderizarPlantio(res, idUsuario, filtros, {
            status,
            dados,
            erro: mensagem,
            plantioEdicao
        });
    }

    if (!idProduto) {
        return erro("Selecione um produto já cadastrado no estoque.");
    }

    if (!area) {
        return erro("Informe a área ou talhão do plantio.");
    }

    if (!dataPlantio) {
        return erro("Informe uma data de plantio válida.");
    }

    // Novos plantios sempre começam em progresso; a colheita é registrada depois.
    const statusFinal = idPlantio ? status : "em_progresso";

    if (idPlantio && !plantioModel.STATUS_VALIDOS.includes(statusFinal)) {
        return erro("Selecione um status válido para o plantio.");
    }

    const produto = await produtoModel.buscarPorId(idProduto, idUsuario);

    if (!produto || !produto.ativo) {
        return erro("O produto selecionado não está cadastrado no seu estoque ou está inativo.");
    }

    // A cultura, a variedade e o ciclo são sempre derivados do produto escolhido.
    // Valores enviados pelo cliente para esses campos são ignorados de propósito.
    const cultura = produto.nome;
    const variedade = produto.variedade || null;
    const cicloDias = cicloDoProduto(produto);
    const dataColheitaEstimada = cicloDias ? somarDias(dataPlantio, cicloDias) : null;

    let dataColheitaFinal = null;

    if (statusFinal === "colhido") {
        if (!dataColheita) {
            return erro("Informe a data em que a colheita foi realizada.");
        }

        if (dataColheita <= dataPlantio) {
            return erro("A data da colheita deve ser posterior à data do plantio.");
        }

        if (dataColheita > hojeISO()) {
            return erro("A data da colheita não pode ser uma data futura.");
        }

        dataColheitaFinal = dataColheita;
    }

    const registro = {
        idUsuario,
        idProduto,
        cultura,
        variedade,
        area,
        dataPlantio,
        cicloDias,
        dataColheitaEstimada,
        dataColheita: dataColheitaFinal,
        status: statusFinal,
        observacoes
    };

    if (idPlantio) {
        const atualizado = await plantioModel.atualizar(idPlantio, idUsuario, registro);

        if (!atualizado) {
            return res.redirect("/plantio?erro=plantio-nao-encontrado");
        }

        if (statusFinal === "colhido" && plantioEdicao.status !== "colhido") {
            return res.redirect("/plantio?ok=plantio-colhido");
        }

        return res.redirect("/plantio?ok=plantio-atualizado");
    }

    await plantioModel.criar(registro);

    return res.redirect("/plantio?ok=plantio-criado");
}

router.post("/plantio", async (req, res) => {
    return salvarPlantio(req, res);
});

router.post("/plantio/:id/editar", async (req, res) => {
    const idPlantio = validation.id(req.params.id);

    if (!idPlantio) {
        return res.redirect("/plantio?erro=plantio-nao-encontrado");
    }

    return salvarPlantio(req, res, idPlantio);
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
