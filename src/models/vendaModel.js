const { query, buscarUm, executar } = require("../config/db");

function montarFiltros(idUsuario, filtros = {}) {
    const condicoes = ["v.id_usuario = ?"];
    const parametros = [idUsuario];

    const busca = String(filtros.q || "").trim();

    if (busca) {
        condicoes.push(
            `(p.nome LIKE ? OR c.nome LIKE ? OR v.forma_pagamento LIKE ? OR v.observacoes LIKE ?)`
        );
        const termo = `%${busca}%`;
        parametros.push(termo, termo, termo, termo);
    }

    if (filtros.idProduto) {
        condicoes.push("v.id_produto = ?");
        parametros.push(filtros.idProduto);
    }

    if (filtros.idCliente) {
        condicoes.push("v.id_cliente = ?");
        parametros.push(filtros.idCliente);
    }

    if (filtros.formaPagamento) {
        condicoes.push("v.forma_pagamento = ?");
        parametros.push(filtros.formaPagamento);
    }

    if (filtros.inicio) {
        condicoes.push("v.data_venda >= ?");
        parametros.push(filtros.inicio);
    }

    if (filtros.fim) {
        condicoes.push("v.data_venda <= ?");
        parametros.push(filtros.fim);
    }

    return {
        where: `WHERE ${condicoes.join(" AND ")}`,
        parametros
    };
}

const FROM_VENDAS = `
    FROM vendas v
    INNER JOIN produtos p ON p.id_produto = v.id_produto
    LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
`;

async function listar(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return query(
        `SELECT v.id_venda, v.id_produto, v.id_cliente, v.quantidade,
                v.preco_unitario, v.unidade, v.valor_total, v.forma_pagamento,
                v.observacoes, v.data_venda, v.criado_em,
                p.nome AS produto, p.unidade AS produto_unidade,
                c.nome AS cliente
         ${FROM_VENDAS}
         ${where}
         ORDER BY v.data_venda DESC, v.id_venda DESC`,
        parametros
    );
}

async function resumo(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return buscarUm(
        `SELECT COUNT(*) AS total_registros,
                COALESCE(SUM(v.quantidade), 0) AS total_quantidade,
                COALESCE(SUM(v.valor_total), 0) AS total_valor,
                COALESCE(AVG(v.valor_total), 0) AS ticket_medio
         ${FROM_VENDAS}
         ${where}`,
        parametros
    );
}

async function buscarPorId(idVenda, idUsuario) {
    return buscarUm(
        `SELECT v.*, p.nome AS produto, c.nome AS cliente
         FROM vendas v
         INNER JOIN produtos p ON p.id_produto = v.id_produto
         LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
         WHERE v.id_venda = ? AND v.id_usuario = ?
         LIMIT 1`,
        [idVenda, idUsuario]
    );
}

async function criar(dados) {
    const resultado = await executar(
        `INSERT INTO vendas
            (id_usuario, id_produto, id_cliente, quantidade, preco_unitario,
             unidade, valor_total, forma_pagamento, observacoes, data_venda)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            dados.idUsuario,
            dados.idProduto,
            dados.idCliente || null,
            dados.quantidade,
            dados.precoUnitario,
            dados.unidade,
            dados.valorTotal,
            dados.formaPagamento || null,
            dados.observacoes || null,
            dados.dataVenda
        ]
    );

    return resultado.insertId;
}

async function excluir(idVenda, idUsuario) {
    const resultado = await executar(
        "DELETE FROM vendas WHERE id_venda = ? AND id_usuario = ?",
        [idVenda, idUsuario]
    );

    return resultado.affectedRows > 0;
}

async function listarFormasPagamento(idUsuario) {
    return query(
        `SELECT DISTINCT forma_pagamento
         FROM vendas
         WHERE id_usuario = ? AND forma_pagamento IS NOT NULL AND forma_pagamento <> ''
         ORDER BY forma_pagamento ASC`,
        [idUsuario]
    );
}

async function relatorioMensal(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return query(
        `SELECT DATE_FORMAT(v.data_venda, '%Y-%m') AS mes,
                COUNT(*) AS quantidade_vendas,
                COALESCE(SUM(v.valor_total), 0) AS total_vendas
         FROM vendas v
         INNER JOIN produtos p ON p.id_produto = v.id_produto
         LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
         ${where}
         GROUP BY DATE_FORMAT(v.data_venda, '%Y-%m')
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
    listarFormasPagamento,
    relatorioMensal
};
