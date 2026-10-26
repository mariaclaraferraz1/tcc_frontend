const express = require("express");
const perdaModel = require("../models/perdaModel");
const produtoModel = require("../models/produtoModel");
const { buscarUm } = require("../config/db");
const validation = require("../utils/validation");
const { arredondar, hojeISO } = require("../utils/format");
const { filtrosBasicos } = require("./_helpers");
const { MOTIVOS_PERDA, UNIDADES } = require("../config/constantes");

const router = express.Router();

async function carregarAuxiliares(idUsuario) {
    const [produtos, motivos] = await Promise.all([
        produtoModel.listarAtivos(idUsuario),
        perdaModel.listarMotivos(idUsuario)
    ]);

    return {
        produtos,
        motivos: Array.from(new Set([...MOTIVOS_PERDA, ...motivos.map((item) => item.motivo)])),
        unidades: UNIDADES
    };
}

async function renderizarPagina(res, idUsuario, extras = {}) {
    const filtros = extras.filtros || filtrosBasicos({});
    const [perdas, resumo, auxiliares] = await Promise.all([
        perdaModel.listar(idUsuario, filtros),
        perdaModel.resumo(idUsuario, filtros),
        carregarAuxiliares(idUsuario)
    ]);

    return res.status(extras.status || 200).render("perdas", {
        titulo: "Perdas",
        perdas,
        resumo,
        filtros,
        produtos: auxiliares.produtos,
        motivos: auxiliares.motivos,
        unidades: auxiliares.unidades,
        dados: extras.dados || { dataPerda: hojeISO() },
        erro: extras.erro || null
    });
}

router.get("/perdas", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query, ["motivo"]);

    filtros.idProduto = validation.id(req.query.idProduto) || "";

    return renderizarPagina(res, idUsuario, { filtros });
});

router.post("/perdas", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idProduto = validation.id(req.body.idProduto);
    const quantidade = validation.numero(req.body.quantidade);
    const dataPerda = validation.data(req.body.dataPerda, true);
    const motivo = validation.texto(req.body.motivo, 100);
    const localPerda = validation.texto(req.body.localPerda, 150);
    const observacoes = validation.texto(req.body.observacoes, 1000);
    const unidadeInformada = validation.texto(req.body.unidade, 30);
    const valorUnitarioInformado = validation.numero(req.body.valorUnitario);

    const dados = {
        idProduto: req.body.idProduto || "",
        quantidade: req.body.quantidade || "",
        dataPerda: req.body.dataPerda || hojeISO(),
        motivo: req.body.motivo || "",
        localPerda,
        unidade: unidadeInformada,
        valorUnitario: req.body.valorUnitario || "",
        observacoes
    };

    function erro(mensagem, status = 400) {
        return renderizarPagina(res, idUsuario, {
            status,
            dados,
            erro: mensagem
        });
    }

    if (!idProduto) {
        return erro("Selecione um produto válido.");
    }

    if (quantidade === null || quantidade <= 0) {
        return erro("Informe uma quantidade perdida maior que zero.");
    }

    if (!dataPerda) {
        return erro("Informe uma data válida para a perda.");
    }

    if (!motivo) {
        return erro("Informe o motivo da perda.");
    }

    const produto = await buscarUm(
        `SELECT id_produto, nome, preco, unidade
         FROM produtos
         WHERE id_produto = ? AND id_usuario = ? AND ativo = 1
         LIMIT 1`,
        [idProduto, idUsuario]
    );

    if (!produto) {
        return erro("O produto selecionado não pertence à sua conta ou está inativo.");
    }

    const valorUnitario = valorUnitarioInformado !== null && valorUnitarioInformado >= 0
        ? arredondar(valorUnitarioInformado)
        : arredondar(produto.preco || 0);

    const valorEstimado = arredondar(quantidade * valorUnitario);

    await perdaModel.criar({
        idUsuario,
        idProduto,
        quantidade,
        unidade: unidadeInformada || produto.unidade || "kg",
        motivo,
        localPerda,
        valorUnitario,
        valorEstimado,
        dataPerda,
        observacoes
    });

    return res.redirect("/perdas?ok=perda-criada");
});

router.post("/perdas/:id/excluir", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idPerda = validation.id(req.params.id);

    if (!idPerda) {
        return res.redirect("/perdas?erro=perda-nao-encontrada");
    }

    const removido = await perdaModel.excluir(idPerda, idUsuario);

    if (!removido) {
        return res.redirect("/perdas?erro=perda-nao-encontrada");
    }

    return res.redirect("/perdas?ok=perda-removida");
});

module.exports = router;
