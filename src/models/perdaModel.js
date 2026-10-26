const { query, buscarUm, executar } = require("../config/db");

function montarFiltros(idUsuario, filtros = {}) {
    const condicoes = ["pe.id_usuario = ?"];
    const parametros = [idUsuario];

    const busca = String(filtros.q || "").trim();

    if (busca) {
        condicoes.push(
            `(p.nome LIKE ? OR pe.motivo LIKE ? OR pe.local_perda LIKE ? OR pe.observacoes LIKE ?)`
        );
        const termo = `%${busca}%`;
        parametros.push(termo, termo, termo, termo);
    }

    if (filtros.idProduto) {
        condicoes.push("pe.id_produto = ?");
        parametros.push(filtros.idProduto);
    }

    if (filtros.motivo) {
        condicoes.push("pe.motivo = ?");
        parametros.push(filtros.motivo);
    }

    if (filtros.inicio) {
        condicoes.push("pe.data_perda >= ?");
        parametros.push(filtros.inicio);
    }

    if (filtros.fim) {
        condicoes.push("pe.data_perda <= ?");
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
        `SELECT pe.id_perda, pe.id_produto, pe.quantidade, pe.unidade,
                pe.motivo, pe.local_perda, pe.valor_unitario, pe.valor_estimado,
                pe.data_perda, pe.observacoes, pe.criado_em,
                p.nome AS produto
         FROM perdas pe
         INNER JOIN produtos p ON p.id_produto = pe.id_produto
         ${where}
         ORDER BY pe.data_perda DESC, pe.id_perda DESC`,
        parametros
    );
}

async function resumo(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return buscarUm(
        `SELECT COUNT(*) AS total_registros,
                COALESCE(SUM(pe.quantidade), 0) AS total_quantidade,
                COALESCE(SUM(pe.valor_estimado), 0) AS total_valor
         FROM perdas pe
         INNER JOIN produtos p ON p.id_produto = pe.id_produto
         ${where}`,
        parametros
    );
}

async function criar(dados) {
    const resultado = await executar(
        `INSERT INTO perdas
            (id_usuario, id_produto, quantidade, unidade, motivo, local_perda,
             valor_unitario, valor_estimado, data_perda, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            dados.idUsuario,
            dados.idProduto,
            dados.quantidade,
            dados.unidade,
            dados.motivo,
            dados.localPerda || null,
            dados.valorUnitario,
            dados.valorEstimado,
            dados.dataPerda,
            dados.observacoes || null
        ]
    );

    return resultado.insertId;
}

async function excluir(idPerda, idUsuario) {
    const resultado = await executar(
        "DELETE FROM perdas WHERE id_perda = ? AND id_usuario = ?",
        [idPerda, idUsuario]
    );

    return resultado.affectedRows > 0;
}

async function listarMotivos(idUsuario) {
    return query(
        `SELECT DISTINCT motivo
         FROM perdas
         WHERE id_usuario = ? AND motivo IS NOT NULL AND motivo <> ''
         ORDER BY motivo ASC`,
        [idUsuario]
    );
}

async function relatorioMensal(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return query(
        `SELECT DATE_FORMAT(pe.data_perda, '%Y-%m') AS mes,
                COUNT(*) AS quantidade_perdas,
                COALESCE(SUM(pe.valor_estimado), 0) AS total_perdas
         FROM perdas pe
         INNER JOIN produtos p ON p.id_produto = pe.id_produto
         ${where}
         GROUP BY DATE_FORMAT(pe.data_perda, '%Y-%m')
         ORDER BY mes ASC`,
        parametros
    );
}

module.exports = {
    listar,
    resumo,
    criar,
    excluir,
    listarMotivos,
    relatorioMensal
};
