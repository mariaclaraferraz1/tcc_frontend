const { query, buscarUm, executar } = require("../config/db");

function montarFiltros(idUsuario, filtros = {}) {
    const condicoes = ["id_usuario = ?"];
    const parametros = [idUsuario];

    if (!filtros.incluirInativos) {
        condicoes.push("ativo = 1");
    }

    const busca = String(filtros.q || "").trim();

    if (busca) {
        condicoes.push("(nome LIKE ? OR descricao LIKE ? OR categoria LIKE ?)");
        const termo = `%${busca}%`;
        parametros.push(termo, termo, termo);
    }

    if (filtros.categoria) {
        condicoes.push("categoria = ?");
        parametros.push(filtros.categoria);
    }

    if (filtros.inicio) {
        condicoes.push("DATE(criado_em) >= ?");
        parametros.push(filtros.inicio);
    }

    if (filtros.fim) {
        condicoes.push("DATE(criado_em) <= ?");
        parametros.push(filtros.fim);
    }

    return {
        where: condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "",
        parametros
    };
}

async function listar(idUsuario, filtros = {}) {
    const { where, parametros } = montarFiltros(idUsuario, filtros);

    return query(
        `SELECT id_produto, nome, descricao, unidade, preco, estoque,
                categoria, imagem, ativo, criado_em, atualizado_em
         FROM produtos
         ${where}
         ORDER BY nome ASC`,
        parametros
    );
}

async function listarAtivos(idUsuario) {
    return query(
        `SELECT id_produto, nome, descricao, unidade, preco, estoque, categoria
         FROM produtos
         WHERE ativo = 1 AND id_usuario = ?
         ORDER BY nome ASC`,
        [idUsuario]
    );
}

async function buscarPorId(idProduto, idUsuario) {
    return buscarUm(
        `SELECT id_produto, nome, descricao, unidade, preco, estoque,
                categoria, imagem, ativo, criado_em, atualizado_em
         FROM produtos
         WHERE id_produto = ? AND id_usuario = ?
         LIMIT 1`,
        [idProduto, idUsuario]
    );
}

async function criar(idUsuario, dados) {
    const resultado = await executar(
        `INSERT INTO produtos
            (id_usuario, nome, descricao, unidade, preco, estoque, categoria, imagem, ativo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
            idUsuario,
            dados.nome,
            dados.descricao || null,
            dados.unidade,
            dados.preco,
            dados.estoque,
            dados.categoria || "Outros",
            dados.imagem || null
        ]
    );

    return resultado.insertId;
}

async function atualizar(idProduto, idUsuario, dados) {
    await executar(
        `UPDATE produtos
         SET nome = ?, descricao = ?, unidade = ?, preco = ?, estoque = ?,
             categoria = ?, imagem = ?
         WHERE id_produto = ? AND id_usuario = ?`,
        [
            dados.nome,
            dados.descricao || null,
            dados.unidade,
            dados.preco,
            dados.estoque,
            dados.categoria || "Outros",
            dados.imagem || null,
            idProduto,
            idUsuario
        ]
    );
}

async function desativar(idProduto, idUsuario) {
    const resultado = await executar(
        "UPDATE produtos SET ativo = 0 WHERE id_produto = ? AND id_usuario = ?",
        [idProduto, idUsuario]
    );

    return resultado.affectedRows > 0;
}

async function listarCategorias(idUsuario) {
    return query(
        `SELECT DISTINCT categoria
         FROM produtos
         WHERE id_usuario = ? AND categoria IS NOT NULL AND categoria <> ''
         ORDER BY categoria ASC`,
        [idUsuario]
    );
}

async function obterEstatisticas(idUsuario) {
    return buscarUm(
        `SELECT COUNT(*) AS total_produtos,
                COUNT(DISTINCT categoria) AS total_categorias,
                COALESCE(SUM(estoque), 0) AS total_estoque,
                COALESCE(SUM(estoque * preco), 0) AS valor_estoque
         FROM produtos
         WHERE ativo = 1 AND id_usuario = ?`,
        [idUsuario]
    );
}

module.exports = {
    listar,
    listarAtivos,
    buscarPorId,
    criar,
    atualizar,
    desativar,
    listarCategorias,
    obterEstatisticas
};
