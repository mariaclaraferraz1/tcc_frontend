const express = require("express");
const produtoModel = require("../models/produtoModel");
const validation = require("../utils/validation");
const { filtrosBasicos, idDaQuery, normalizarImagem } = require("./_helpers");
const { salvarDataUrl, removerAnexo } = require("../utils/anexos");
const { CATEGORIAS_PRODUTO, UNIDADES } = require("../config/constantes");

const router = express.Router();

router.get("/produtos", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query, ["categoria"]);

    const [produtos, categorias, estatisticas] = await Promise.all([
        produtoModel.listar(idUsuario, filtros),
        produtoModel.listarCategorias(idUsuario),
        produtoModel.obterEstatisticas(idUsuario)
    ]);

    return res.render("produtos", {
        titulo: "Produtos",
        produtos,
        categorias,
        estatisticas,
        filtros
    });
});

router.get("/cadastro-produto", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idProduto = idDaQuery(req.query);
    let produto = null;

    if (idProduto) {
        produto = await produtoModel.buscarPorId(idProduto, idUsuario);

        if (!produto) {
            return res.redirect("/produtos?erro=produto-nao-encontrado");
        }
    }

    const categoriasBanco = await produtoModel.listarCategorias(idUsuario);
    const categorias = Array.from(
        new Set([...CATEGORIAS_PRODUTO, ...categoriasBanco.map((item) => item.categoria)])
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    return res.render("cadastro_produto", {
        titulo: produto ? "Editar produto" : "Novo produto",
        produto,
        categorias,
        unidades: UNIDADES,
        erro: null
    });
});

router.post("/cadastro-produto", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idProduto = validation.id(req.body.id);
    const nome = validation.texto(req.body.nome, 100);
    const descricao = validation.texto(req.body.descricao, 255);
    const unidade = validation.texto(req.body.unidade, 30) || "kg";
    const categoria = validation.texto(req.body.categoria, 100) || "Outros";
    const preco = validation.numero(req.body.preco);
    const estoque = validation.numero(req.body.estoque);
    const imagem = normalizarImagem(req.body.imagem || req.body.imagemLink);
    const categoriasBanco = await produtoModel.listarCategorias(idUsuario);
    const categorias = Array.from(
        new Set([...CATEGORIAS_PRODUTO, ...categoriasBanco.map((item) => item.categoria)])
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    const dados = {
        id_produto: idProduto,
        nome,
        descricao,
        unidade,
        categoria,
        preco: preco === null ? "" : preco,
        estoque: estoque === null ? "" : estoque,
        imagem: imagem.valor || null
    };

    function renderizarComErro(mensagem) {
        return res.status(400).render("cadastro_produto", {
            titulo: idProduto ? "Editar produto" : "Novo produto",
            produto: dados,
            categorias,
            unidades: UNIDADES,
            erro: mensagem
        });
    }

    if (!nome) {
        return renderizarComErro("Informe o nome do produto.");
    }

    if (preco === null || preco < 0) {
        return renderizarComErro("Informe um preço válido (maior ou igual a zero).");
    }

    if (estoque === null || estoque < 0) {
        return renderizarComErro("Informe um estoque válido (maior ou igual a zero).");
    }

    if (imagem.erro) {
        return renderizarComErro(imagem.erro);
    }

    let imagemFinal = imagem.valor;

    if (imagemFinal) {
        try {
            imagemFinal = await salvarDataUrl(imagemFinal, "produto");
        } catch (erro) {
            console.error("Falha ao salvar imagem do produto:", erro.message);

            return renderizarComErro("Não foi possível salvar a imagem. Tente novamente.");
        }
    }

    const registro = {
        nome,
        descricao,
        unidade,
        categoria,
        preco,
        estoque,
        imagem: imagemFinal
    };

    if (idProduto) {
        const existente = await produtoModel.buscarPorId(idProduto, idUsuario);

        if (!existente) {
            await removerAnexo(imagemFinal);

            return res.redirect("/produtos?erro=produto-nao-encontrado");
        }

        if (!registro.imagem) {
            registro.imagem = existente.imagem;
        }

        try {
            await produtoModel.atualizar(idProduto, idUsuario, registro);
        } catch (erro) {
            await removerAnexo(imagemFinal);
            throw erro;
        }

        if (registro.imagem && existente.imagem && registro.imagem !== existente.imagem) {
            await removerAnexo(existente.imagem);
        }

        return res.redirect("/produtos?ok=produto-atualizado");
    }

    try {
        await produtoModel.criar(idUsuario, registro);
    } catch (erro) {
        await removerAnexo(imagemFinal);
        throw erro;
    }

    return res.redirect("/produtos?ok=produto-criado");
});

router.post("/produtos/:id/excluir", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idProduto = validation.id(req.params.id);

    if (!idProduto) {
        return res.redirect("/produtos?erro=produto-nao-encontrado");
    }

    const removido = await produtoModel.desativar(idProduto, idUsuario);

    if (!removido) {
        return res.redirect("/produtos?erro=produto-nao-encontrado");
    }

    return res.redirect("/produtos?ok=produto-removido");
});

module.exports = router;
