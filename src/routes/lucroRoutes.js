const express = require("express");
const relatorioModel = require("../models/relatorioModel");
const vendaModel = require("../models/vendaModel");
const gastoModel = require("../models/gastoModel");
const perdaModel = require("../models/perdaModel");
const { filtrosBasicos } = require("./_helpers");

const router = express.Router();

router.get("/lucros", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query);

    const [resumo, mensal, vendas, gastos, perdas] = await Promise.all([
        relatorioModel.resumoFinanceiro(idUsuario, filtros),
        relatorioModel.resumoMensal(idUsuario, filtros),
        vendaModel.listar(idUsuario, filtros),
        gastoModel.listar(idUsuario, filtros),
        perdaModel.listar(idUsuario, filtros)
    ]);

    return res.render("lucros", {
        titulo: "Lucros",
        resumo,
        mensal,
        filtros,
        ultimasVendas: vendas.slice(0, 5),
        ultimosGastos: gastos.slice(0, 5),
        ultimasPerdas: perdas.slice(0, 5)
    });
});

module.exports = router;
