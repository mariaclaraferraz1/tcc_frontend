const express = require("express");
const relatorioModel = require("../models/relatorioModel");
const { filtrosBasicos } = require("./_helpers");
const { respostaApiErro } = require("../utils/http");

const router = express.Router();

function filtrosDoRelatorio(query) {
    return filtrosBasicos(query, ["categoria", "formaPagamento", "motivo", "idProduto"]);
}

router.get("/relatorios", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosDoRelatorio(req.query);
    const tipo = relatorioModel.TIPOS[req.query.tipo] ? req.query.tipo : "";
    let relatorio = null;

    if (tipo) {
        relatorio = await relatorioModel.gerarRelatorio(tipo, idUsuario, filtros);
    }

    return res.render("relatorios", {
        titulo: "Relatórios",
        tipos: [
            { valor: "vendas", rotulo: "Vendas" },
            { valor: "gastos", rotulo: "Gastos" },
            { valor: "perdas", rotulo: "Perdas" },
            { valor: "producao", rotulo: "Produção" },
            { valor: "produtos", rotulo: "Produtos" },
            { valor: "lucros", rotulo: "Lucros" }
        ],
        tipo,
        filtros,
        relatorio
    });
});

router.get("/api/relatorios/:tipo", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const tipo = String(req.params.tipo || "");

    if (!relatorioModel.TIPOS[tipo]) {
        return respostaApiErro(res, 404, "Tipo de relatório inválido.");
    }

    const filtros = filtrosDoRelatorio(req.query);
    const relatorio = await relatorioModel.gerarRelatorio(tipo, idUsuario, filtros);

    return res.json({
        tipo,
        filtros,
        relatorio
    });
});

module.exports = router;
