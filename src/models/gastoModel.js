const { query, buscarUm, executar } = require("../config/db");

function montarFiltros(idUsuario, filtros = {}) {
    const condicoes = ["g.id_usuario = ?"];
    const parametros = [idUsuario];

    const busca = String(filtros.q || "").trim();

    if (busca) {
        condicoes.push(
            `(g.descricao LIKE ? OR g.fornecedor LIKE ? OR g.categoria LIKE ? OR g.observacao LIKE ?)`
        );
        const termo = `%${busca}%`;
        parametros.push(termo, termo, termo, termo);
    }

    if (filtros.categoria) {
        condicoes.push("g.categoria = ?");
        parametros.push(filtros.categoria);
    }

    if (filtros.classificacao) {
        condicoes.push("g.classificacao = ?");
        parametros.push(filtros.classificacao);
    }

    if (filtros.inicio) {
        condicoes.push("g.data_gasto >= ?");
        parametros.push(filtros.inicio);
    }

    if (filtros.fim) {
        condicoes.push("g.data_gasto <= ?");
        parametros.push(filtros.fim);
    }

    return {
        where: `WHERE ${condicoes.join(" AND ")}`,
        parametros
    };
}

async function listar(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return query(
        `SELECT g.id_gasto, g.descricao, g.valor, g.data_gasto, g.categoria,
                g.forma_pagamento, g.fornecedor, g.classificacao,
                g.observacao, g.comprovante, g.criado_em
         FROM gastos g
         ${where}
         ORDER BY g.data_gasto DESC, g.id_gasto DESC`,
        parametros
    );
}

async function resumo(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return buscarUm(
        `SELECT COUNT(*) AS total_registros,
                COALESCE(SUM(g.valor), 0) AS total_valor,
                COALESCE(AVG(g.valor), 0) AS media_valor
         FROM gastos g
         ${where}`,
        parametros
    );
}

async function buscarPorId(idGasto, idUsuario) {
    return buscarUm(
        `SELECT id_gasto, comprovante
         FROM gastos
         WHERE id_gasto = ? AND id_usuario = ?`,
        [idGasto, idUsuario]
    );
}

async function criar(dados) {
    const resultado = await executar(
        `INSERT INTO gastos
            (id_usuario, descricao, valor, data_gasto, categoria,
             forma_pagamento, fornecedor, classificacao, observacao, comprovante)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            dados.idUsuario,
            dados.descricao,
            dados.valor,
            dados.dataGasto,
            dados.categoria || null,
            dados.formaPagamento || null,
            dados.fornecedor || null,
            dados.classificacao || null,
            dados.observacao || null,
            dados.comprovante || null
        ]
    );

    return resultado.insertId;
}

async function excluir(idGasto, idUsuario) {
    const resultado = await executar(
        "DELETE FROM gastos WHERE id_gasto = ? AND id_usuario = ?",
        [idGasto, idUsuario]
    );

    return resultado.affectedRows > 0;
}

async function listarCategorias(idUsuario) {
    return query(
        `SELECT DISTINCT categoria
         FROM gastos
         WHERE id_usuario = ? AND categoria IS NOT NULL AND categoria <> ''
         ORDER BY categoria ASC`,
        [idUsuario]
    );
}

async function listarClassificacoes(idUsuario) {
    return query(
        `SELECT DISTINCT classificacao
         FROM gastos
         WHERE id_usuario = ? AND classificacao IS NOT NULL AND classificacao <> ''
         ORDER BY classificacao ASC`,
        [idUsuario]
    );
}

async function relatorioMensal(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return query(
        `SELECT DATE_FORMAT(g.data_gasto, '%Y-%m') AS mes,
                COUNT(*) AS quantidade_gastos,
                COALESCE(SUM(g.valor), 0) AS total_gastos
         FROM gastos g
         ${where}
         GROUP BY DATE_FORMAT(g.data_gasto, '%Y-%m')
         ORDER BY mes ASC`,
        parametros
    );
}

module.exports = {
    listar,
    resumo,
    buscarPorId,
    criar,
    excluir,
    listarCategorias,
    listarClassificacoes,
    relatorioMensal
};
