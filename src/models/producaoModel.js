const { query, buscarUm, executar } = require("../config/db");

function montarFiltros(idUsuario, filtros = {}) {
    const condicoes = ["pr.id_usuario = ?"];
    const parametros = [idUsuario];

    const busca = String(filtros.q || "").trim();

    if (busca) {
        condicoes.push("(p.nome LIKE ? OR pr.observacoes LIKE ?)");
        const termo = `%${busca}%`;
        parametros.push(termo, termo);
    }

    if (filtros.idProduto) {
        condicoes.push("pr.id_produto = ?");
        parametros.push(filtros.idProduto);
    }

    if (filtros.inicio) {
        condicoes.push("pr.data_producao >= ?");
        parametros.push(filtros.inicio);
    }

    if (filtros.fim) {
        condicoes.push("pr.data_producao <= ?");
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
        `SELECT pr.id_producao, pr.id_produto, pr.quantidade, pr.peso,
                pr.data_plantio, pr.data_producao, pr.observacoes, pr.criado_em,
                p.nome AS produto, p.unidade AS unidade
         FROM producao pr
         INNER JOIN produtos p ON p.id_produto = pr.id_produto
         ${where}
         ORDER BY pr.data_producao DESC, pr.id_producao DESC`,
        parametros
    );
}

async function resumo(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return buscarUm(
        `SELECT COUNT(*) AS total_registros,
                COALESCE(SUM(pr.quantidade), 0) AS total_quantidade,
                COALESCE(SUM(pr.peso), 0) AS total_peso
         FROM producao pr
         INNER JOIN produtos p ON p.id_produto = pr.id_produto
         ${where}`,
        parametros
    );
}

async function criar(dados) {
    const resultado = await executar(
        `INSERT INTO producao
            (id_usuario, id_produto, quantidade, peso, data_plantio,
             data_producao, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            dados.idUsuario,
            dados.idProduto,
            dados.quantidade,
            dados.peso,
            dados.dataPlantio || null,
            dados.dataProducao,
            dados.observacoes || null
        ]
    );

    return resultado.insertId;
}

async function excluir(idProducao, idUsuario) {
    const resultado = await executar(
        "DELETE FROM producao WHERE id_producao = ? AND id_usuario = ?",
        [idProducao, idUsuario]
    );

    return resultado.affectedRows > 0;
}

async function totalProduzido(idUsuario) {
    return buscarUm(
        `SELECT COALESCE(SUM(quantidade), 0) AS total
         FROM producao
         WHERE id_usuario = ?`,
        [idUsuario]
    );
}

module.exports = {
    listar,
    resumo,
    criar,
    excluir,
    totalProduzido
};
