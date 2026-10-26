const express = require("express");
const vendaModel = require("../models/vendaModel");
const produtoModel = require("../models/produtoModel");
const clienteModel = require("../models/clienteModel");
const { comTransacao, buscarUm } = require("../config/db");
const validation = require("../utils/validation");
const { arredondar, hojeISO } = require("../utils/format");
const { filtrosBasicos } = require("./_helpers");
const { FORMAS_PAGAMENTO } = require("../config/constantes");

const router = express.Router();

async function carregarDadosFormulario(idUsuario) {
    const [produtos, clientes] = await Promise.all([
        produtoModel.listarAtivos(idUsuario),
        clienteModel.listarPorUsuario(idUsuario)
    ]);

    return { produtos, clientes };
}

async function renderizarFormulario(res, idUsuario, extras = {}) {
    const { produtos, clientes } = await carregarDadosFormulario(idUsuario);

    return res.status(extras.status || 200).render("registrar_vendas", {
        titulo: "Registrar venda",
        produtos,
        clientes,
        formasPagamento: FORMAS_PAGAMENTO,
        dados: extras.dados || { dataVenda: hojeISO() },
        erro: extras.erro || null
    });
}

router.get("/vendas", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query, ["formaPagamento"]);

    filtros.idProduto = validation.id(req.query.idProduto) || "";
    filtros.idCliente = validation.id(req.query.idCliente) || "";

    const [vendas, resumo, produtos, clientes, formasPagamento] = await Promise.all([
        vendaModel.listar(idUsuario, filtros),
        vendaModel.resumo(idUsuario, filtros),
        produtoModel.listarAtivos(idUsuario),
        clienteModel.listarPorUsuario(idUsuario),
        vendaModel.listarFormasPagamento(idUsuario)
    ]);

    return res.render("vendas", {
        titulo: "Vendas",
        vendas,
        resumo,
        produtos,
        clientes,
        formasPagamento,
        filtros
    });
});

router.get("/registrar-vendas", async (req, res) => {
    return renderizarFormulario(res, req.usuario.id_usuario);
});

router.post("/vendas", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idProduto = validation.id(req.body.idProduto);
    const quantidade = validation.numero(req.body.quantidade);
    const dataVenda = validation.data(req.body.dataVenda, true);
    const formaPagamento = validation.texto(req.body.formaPagamento, 50);
    const observacoes = validation.texto(req.body.observacoes, 1000);
    const clienteNome = validation.texto(req.body.clienteNome, 150);
    const idCliente = validation.id(req.body.idCliente);

    const dados = {
        idProduto: req.body.idProduto || "",
        idCliente: req.body.idCliente || "",
        quantidade: req.body.quantidade || "",
        dataVenda: req.body.dataVenda || hojeISO(),
        formaPagamento,
        observacoes,
        clienteNome
    };

    if (!idProduto) {
        return renderizarFormulario(res, idUsuario, {
            status: 400,
            dados,
            erro: "Selecione um produto válido."
        });
    }

    if (quantidade === null || quantidade <= 0) {
        return renderizarFormulario(res, idUsuario, {
            status: 400,
            dados,
            erro: "Informe uma quantidade maior que zero."
        });
    }

    if (!dataVenda) {
        return renderizarFormulario(res, idUsuario, {
            status: 400,
            dados,
            erro: "Informe uma data de venda válida."
        });
    }

    let cliente = null;

    if (idCliente) {
        cliente = await clienteModel.buscarPorId(idCliente, idUsuario);

        if (!cliente) {
            return renderizarFormulario(res, idUsuario, {
                status: 400,
                dados,
                erro: "O cliente selecionado não pertence à sua conta."
            });
        }
    } else if (clienteNome) {
        cliente = await clienteModel.buscarOuCriar(idUsuario, clienteNome);
    }

    try {
        let produtoVendido = null;

        await comTransacao(async (conexao) => {
            const [linhas] = await conexao.execute(
                `SELECT id_produto, nome, preco, unidade, estoque
                 FROM produtos
                 WHERE id_produto = ? AND id_usuario = ? AND ativo = 1
                 FOR UPDATE`,
                [idProduto, idUsuario]
            );

            if (linhas.length === 0) {
                const erro = new Error("Produto não encontrado ou inativo.");
                erro.status = 400;
                throw erro;
            }

            produtoVendido = linhas[0];

            const precoUnitario = arredondar(produtoVendido.preco || 0);
            const valorTotal = arredondar(quantidade * precoUnitario);

            await conexao.execute(
                `INSERT INTO vendas
                    (id_usuario, id_produto, id_cliente, quantidade, preco_unitario,
                     unidade, valor_total, forma_pagamento, observacoes, data_venda)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    idUsuario,
                    idProduto,
                    cliente ? cliente.id_cliente : null,
                    quantidade,
                    precoUnitario,
                    produtoVendido.unidade || "kg",
                    valorTotal,
                    formaPagamento || null,
                    observacoes || null,
                    dataVenda
                ]
            );

            await conexao.execute(
                `UPDATE produtos
                 SET estoque = GREATEST(estoque - ?, 0)
                 WHERE id_produto = ? AND id_usuario = ?`,
                [quantidade, idProduto, idUsuario]
            );
        });

        return res.redirect("/vendas?ok=venda-criada");
    } catch (erro) {
        console.error("Falha ao registrar venda:", erro.message);

        return renderizarFormulario(res, idUsuario, {
            status: erro.status || 500,
            dados,
            erro: erro.status === 400
                ? erro.message
                : "Não foi possível registrar a venda. Tente novamente."
        });
    }
});

router.post("/vendas/:id/excluir", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idVenda = validation.id(req.params.id);

    if (!idVenda) {
        return res.redirect("/vendas?erro=venda-nao-encontrada");
    }

    try {
        const encontrada = await comTransacao(async (conexao) => {
            const [linhas] = await conexao.execute(
                `SELECT id_venda, id_produto, quantidade
                 FROM vendas
                 WHERE id_venda = ? AND id_usuario = ?
                 FOR UPDATE`,
                [idVenda, idUsuario]
            );

            if (linhas.length === 0) {
                return false;
            }

            const venda = linhas[0];

            await conexao.execute(
                "DELETE FROM vendas WHERE id_venda = ? AND id_usuario = ?",
                [idVenda, idUsuario]
            );

            await conexao.execute(
                `UPDATE produtos
                 SET estoque = estoque + ?
                 WHERE id_produto = ? AND id_usuario = ?`,
                [venda.quantidade, venda.id_produto, idUsuario]
            );

            return true;
        });

        if (!encontrada) {
            return res.redirect("/vendas?erro=venda-nao-encontrada");
        }

        return res.redirect("/vendas?ok=venda-removida");
    } catch (erro) {
        console.error("Falha ao excluir venda:", erro.message);

        return res.redirect("/vendas?erro=dados-invalidos");
    }
});

module.exports = router;
