const express = require("express");
const relatorioModel = require("../models/relatorioModel");
const vendaModel = require("../models/vendaModel");
const gastoModel = require("../models/gastoModel");
const perdaModel = require("../models/perdaModel");

const router = express.Router();

router.get("/inicio", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const [indicadores, vendas, gastos, perdas] = await Promise.all([
        relatorioModel.indicadoresInicio(idUsuario),
        vendaModel.listar(idUsuario, {}),
        gastoModel.listar(idUsuario, {}),
        perdaModel.listar(idUsuario, {})
    ]);

    return res.render("inicio", {
        titulo: "Início",
        indicadores,
        ultimasVendas: vendas.slice(0, 5),
        ultimosGastos: gastos.slice(0, 5),
        ultimasPerdas: perdas.slice(0, 5)
    });
});

router.get("/comercial", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const [resumo, produtos, producao] = await Promise.all([
        relatorioModel.resumoFinanceiro(idUsuario),
        relatorioModel.gerarRelatorio("produtos", idUsuario),
        relatorioModel.gerarRelatorio("producao", idUsuario)
    ]);

    return res.render("comercial", {
        titulo: "Comercial",
        resumo,
        resumoProdutos: produtos.resumo,
        resumoProducao: producao.resumo
    });
});

module.exports = router;
