const { query, buscarUm, executar } = require("../config/db");

const STATUS_VALIDOS = ["em_progresso", "colhido"];

function montarFiltros(idUsuario, filtros = {}) {
    const condicoes = ["pl.id_usuario = ?"];
    const parametros = [idUsuario];

    const busca = String(filtros.q || "").trim();

    if (busca) {
        condicoes.push(
            "(pl.cultura LIKE ? OR pl.variedade LIKE ? OR pl.area LIKE ? OR pl.observacoes LIKE ?)"
        );
        const termo = `%${busca}%`;
        parametros.push(termo, termo, termo, termo);
    }

    if (filtros.status && STATUS_VALIDOS.includes(filtros.status)) {
        condicoes.push("pl.status = ?");
        parametros.push(filtros.status);
    }

    if (filtros.inicio) {
        condicoes.push("pl.data_plantio >= ?");
        parametros.push(filtros.inicio);
    }

    if (filtros.fim) {
        condicoes.push("pl.data_plantio <= ?");
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
        `SELECT pl.id_plantio, pl.id_produto, pl.cultura, pl.variedade, pl.area,
                pl.data_plantio, pl.ciclo_dias, pl.data_colheita_estimada,
                pl.data_colheita, pl.status, pl.observacoes, pl.criado_em
         FROM plantio pl
         ${where}
         ORDER BY pl.data_plantio DESC, pl.id_plantio DESC`,
        parametros
    );
}

async function buscarPorId(idPlantio, idUsuario) {
    return buscarUm(
        `SELECT id_plantio, id_produto, cultura, variedade, area, data_plantio,
                ciclo_dias, data_colheita_estimada, data_colheita, status, observacoes, criado_em
         FROM plantio
         WHERE id_plantio = ? AND id_usuario = ?
         LIMIT 1`,
        [idPlantio, idUsuario]
    );
}

async function resumo(idUsuario) {
    return buscarUm(
        `SELECT COUNT(*) AS total_registros,
                SUM(CASE WHEN status = 'em_progresso' THEN 1 ELSE 0 END) AS em_progresso,
                SUM(CASE WHEN status = 'colhido' THEN 1 ELSE 0 END) AS colhidos,
                SUM(CASE
                        WHEN status = 'em_progresso'
                         AND data_colheita_estimada IS NOT NULL
                         AND data_colheita_estimada <= CURDATE()
                        THEN 1 ELSE 0
                    END) AS prontos
         FROM plantio
         WHERE id_usuario = ?`,
        [idUsuario]
    );
}

async function criar(dados) {
    const resultado = await executar(
        `INSERT INTO plantio
            (id_usuario, id_produto, cultura, variedade, area, data_plantio,
             ciclo_dias, data_colheita_estimada, data_colheita, status, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            dados.idUsuario,
            dados.idProduto,
            dados.cultura,
            dados.variedade || null,
            dados.area,
            dados.dataPlantio,
            dados.cicloDias || null,
            dados.dataColheitaEstimada || null,
            dados.dataColheita || null,
            dados.status,
            dados.observacoes || null
        ]
    );

    return resultado.insertId;
}

async function atualizar(idPlantio, idUsuario, dados) {
    const resultado = await executar(
        `UPDATE plantio
         SET id_produto = ?, cultura = ?, variedade = ?, area = ?, data_plantio = ?,
             ciclo_dias = ?, data_colheita_estimada = ?, data_colheita = ?,
             status = ?, observacoes = ?
         WHERE id_plantio = ? AND id_usuario = ?`,
        [
            dados.idProduto,
            dados.cultura,
            dados.variedade || null,
            dados.area,
            dados.dataPlantio,
            dados.cicloDias || null,
            dados.dataColheitaEstimada || null,
            dados.dataColheita || null,
            dados.status,
            dados.observacoes || null,
            idPlantio,
            idUsuario
        ]
    );

    return resultado.affectedRows > 0;
}

async function excluir(idPlantio, idUsuario) {
    const resultado = await executar(
        "DELETE FROM plantio WHERE id_plantio = ? AND id_usuario = ?",
        [idPlantio, idUsuario]
    );

    return resultado.affectedRows > 0;
}

function rotuloStatus(status) {
    const rotulos = {
        em_progresso: "Em progresso",
        colhido: "Colhido"
    };

    return rotulos[status] || status;
}

module.exports = {
    STATUS_VALIDOS,
    listar,
    buscarPorId,
    resumo,
    criar,
    atualizar,
    excluir,
    rotuloStatus
};
