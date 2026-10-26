const express = require("express");
const gastoModel = require("../models/gastoModel");
const validation = require("../utils/validation");
const { filtrosBasicos, normalizarComprovante } = require("./_helpers");
const { salvarDataUrl, removerAnexo } = require("../utils/anexos");
const {
    CATEGORIAS_GASTO,
    CLASSIFICACOES_GASTO,
    FORMAS_PAGAMENTO
} = require("../config/constantes");

const router = express.Router();

async function carregarAuxiliares(idUsuario) {
    const [categorias, classificacoes] = await Promise.all([
        gastoModel.listarCategorias(idUsuario),
        gastoModel.listarClassificacoes(idUsuario)
    ]);

    return {
        categorias: Array.from(new Set([...CATEGORIAS_GASTO, ...categorias.map((item) => item.categoria)])),
        classificacoes: Array.from(new Set([...CLASSIFICACOES_GASTO, ...classificacoes.map((item) => item.classificacao)])),
        formasPagamento: FORMAS_PAGAMENTO
    };
}

async function renderizarPagina(res, idUsuario, extras = {}) {
    const filtros = extras.filtros || filtrosBasicos({});
    const [gastos, resumo, auxiliares] = await Promise.all([
        gastoModel.listar(idUsuario, filtros),
        gastoModel.resumo(idUsuario, filtros),
        carregarAuxiliares(idUsuario)
    ]);

    return res.status(extras.status || 200).render("controle_de_gastos", {
        titulo: "Controle de gastos",
        gastos,
        resumo,
        filtros,
        categorias: auxiliares.categorias,
        classificacoes: auxiliares.classificacoes,
        formasPagamento: auxiliares.formasPagamento,
        dados: extras.dados || {},
        erro: extras.erro || null
    });
}

router.get("/controle-de-gastos", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const filtros = filtrosBasicos(req.query, ["categoria", "classificacao"]);

    return renderizarPagina(res, idUsuario, { filtros });
});

router.post("/controle-de-gastos", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const descricao = validation.texto(req.body.descricao, 255);
    const categoria = validation.texto(req.body.categoria, 100);
    const dataGasto = validation.data(req.body.dataGasto, true);
    const valor = validation.numero(req.body.valor);
    const formaPagamento = validation.texto(req.body.formaPagamento, 50);
    const fornecedor = validation.texto(req.body.fornecedor, 150);
    const classificacao = validation.texto(req.body.classificacao, 50);
    const observacao = validation.texto(req.body.observacao, 1000);
    const link = validation.texto(req.body.comprovanteLink, 1000);
    const comprovante = normalizarComprovante(req.body.comprovante || link);

    const dados = {
        descricao,
        categoria,
        dataGasto: req.body.dataGasto || "",
        valor: req.body.valor || "",
        formaPagamento,
        fornecedor,
        classificacao,
        observacao,
        comprovanteLink: link
    };

    function erro(mensagem, status = 400) {
        return renderizarPagina(res, idUsuario, {
            status,
            dados,
            erro: mensagem
        });
    }

    if (!descricao) {
        return erro("Informe a descrição do gasto.");
    }

    if (valor === null || valor <= 0) {
        return erro("Informe um valor maior que zero.");
    }

    if (!dataGasto) {
        return erro("Informe uma data válida para o gasto.");
    }

    if (comprovante.erro) {
        return erro(comprovante.erro);
    }

    let comprovanteFinal = comprovante.valor;

    if (comprovanteFinal) {
        try {
            comprovanteFinal = await salvarDataUrl(comprovanteFinal, "comprovante");
        } catch (falha) {
            console.error("Falha ao salvar comprovante:", falha.message);

            return erro("Não foi possível salvar o comprovante. Tente novamente.", 500);
        }
    }

    try {
        await gastoModel.criar({
            idUsuario,
            descricao,
            valor,
            dataGasto,
            categoria,
            formaPagamento,
            fornecedor,
            classificacao,
            observacao,
            comprovante: comprovanteFinal
        });
    } catch (falha) {
        await removerAnexo(comprovanteFinal);
        throw falha;
    }

    return res.redirect("/controle-de-gastos?ok=gasto-criado");
});

router.post("/controle-de-gastos/:id/excluir", async (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const idGasto = validation.id(req.params.id);

    if (!idGasto) {
        return res.redirect("/controle-de-gastos?erro=gasto-nao-encontrado");
    }

    const gasto = await gastoModel.buscarPorId(idGasto, idUsuario);

    if (!gasto) {
        return res.redirect("/controle-de-gastos?erro=gasto-nao-encontrado");
    }

    const removido = await gastoModel.excluir(idGasto, idUsuario);

    if (!removido) {
        return res.redirect("/controle-de-gastos?erro=gasto-nao-encontrado");
    }

    await removerAnexo(gasto.comprovante);

    return res.redirect("/controle-de-gastos?ok=gasto-removido");
});

module.exports = router;
