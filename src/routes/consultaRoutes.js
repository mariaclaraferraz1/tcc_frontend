const express = require("express");
const consultaModel = require("../models/consultaModel");
const validation = require("../utils/validation");
const { filtrosBasicos } = require("./_helpers");

const router = express.Router();

function montarFiltros(query) {
    const filtros = filtrosBasicos(query, ["categoria", "tipo"]);

    filtros.categoria = consultaModel.CATEGORIAS.includes(filtros.categoria)
        ? filtros.categoria
        : "";
    filtros.tipo = ["", "nome", "data", "quantidade", "valor"].includes(filtros.tipo)
        ? filtros.tipo
        : "";

    return filtros;
}

router.get("/consulta", async (req, res) => {
    const filtros = montarFiltros(req.query);
    const resultado = await consultaModel.buscar(req.usuario.id_usuario, filtros);

    return res.render("consulta", {
        titulo: "Consulta",
        categorias: [
            { valor: "produtos", rotulo: "Produtos" },
            { valor: "vendas", rotulo: "Vendas" },
            { valor: "gastos", rotulo: "Gastos" },
            { valor: "perdas", rotulo: "Perdas" },
            { valor: "producao", rotulo: "Produção" },
            { valor: "plantio", rotulo: "Plantio" },
            { valor: "clientes", rotulo: "Clientes" }
        ],
        filtros,
        resultado
    });
});

router.get("/api/consulta", async (req, res) => {
    const filtros = montarFiltros(req.query);
    const resultado = await consultaModel.buscar(req.usuario.id_usuario, filtros);

    return res.json({
        filtros,
        ...resultado
    });
});

module.exports = router;
