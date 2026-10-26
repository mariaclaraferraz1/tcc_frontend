const express = require("express");
const produtoModel = require("../models/produtoModel");
const clienteModel = require("../models/clienteModel");
const validation = require("../utils/validation");

const router = express.Router();

router.get("/api/produtos", async (req, res) => {
    const produtos = await produtoModel.listarAtivos(req.usuario.id_usuario);

    return res.json({
        produtos: produtos.map((produto) => ({
            id: produto.id_produto,
            nome: produto.nome,
            preco: Number(produto.preco || 0),
            unidade: produto.unidade,
            estoque: Number(produto.estoque || 0),
            categoria: produto.categoria
        }))
    });
});

router.get("/api/produtos/:id", async (req, res) => {
    const idProduto = validation.id(req.params.id);

    if (!idProduto) {
        return res.status(400).json({ erro: "Produto inválido." });
    }

    const produto = await produtoModel.buscarPorId(idProduto, req.usuario.id_usuario);

    if (!produto || !produto.ativo) {
        return res.status(404).json({ erro: "Produto não encontrado." });
    }

    return res.json({
        produto: {
            id: produto.id_produto,
            nome: produto.nome,
            preco: Number(produto.preco || 0),
            unidade: produto.unidade,
            estoque: Number(produto.estoque || 0),
            categoria: produto.categoria
        }
    });
});

router.get("/api/clientes", async (req, res) => {
    const busca = validation.texto(req.query.q, 120).toLowerCase();
    const clientes = await clienteModel.listarPorUsuario(req.usuario.id_usuario);
    const filtrados = busca
        ? clientes.filter((cliente) => String(cliente.nome || "").toLowerCase().includes(busca))
        : clientes;

    return res.json({
        clientes: filtrados.map((cliente) => ({
            id: cliente.id_cliente,
            nome: cliente.nome,
            telefone: cliente.telefone,
            email: cliente.email
        }))
    });
});

router.post("/api/clientes", async (req, res) => {
    const nome = validation.texto(req.body.nome, 150);
    const telefone = validation.texto(req.body.telefone, 30);
    const email = validation.email(req.body.email);

    if (!nome) {
        return res.status(400).json({ erro: "Informe o nome do cliente." });
    }

    const cliente = await clienteModel.buscarOuCriar(req.usuario.id_usuario, nome, {
        telefone,
        email
    });

    return res.status(201).json({
        cliente: {
            id: cliente.id_cliente,
            nome: cliente.nome,
            telefone: cliente.telefone,
            email: cliente.email
        }
    });
});

module.exports = router;
