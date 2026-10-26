const { query, buscarUm, executar } = require("../config/db");

const STATUS_VALIDOS = ["germinacao", "crescimento", "colheita"];

function montarFiltros(idUsuario, filtros = {}) {
    const condicoes = ["pl.id_usuario = ?"];
    const parametros = [idUsuario];

    const busca = String(filtros.q || "").trim();

    if (busca) {
        condicoes.push("(pl.cultura LIKE ? OR pl.area LIKE ? OR pl.observacoes LIKE ?)");
        const termo = `%${busca}%`;
        parametros.push(termo, termo, termo);
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
        `SELECT pl.id_plantio, pl.cultura, pl.area, pl.data_plantio,
                pl.status, pl.observacoes, pl.criado_em
         FROM plantio pl
         ${where}
         ORDER BY pl.data_plantio DESC, pl.id_plantio DESC`,
        parametros
    );
}

async function resumo(idUsuario) {
    return buscarUm(
        `SELECT COUNT(*) AS total_registros,
                SUM(CASE WHEN status = 'germinacao' THEN 1 ELSE 0 END) AS germinacao,
                SUM(CASE WHEN status = 'crescimento' THEN 1 ELSE 0 END) AS crescimento,
                SUM(CASE WHEN status = 'colheita' THEN 1 ELSE 0 END) AS colheita
         FROM plantio
         WHERE id_usuario = ?`,
        [idUsuario]
    );
}

async function criar(dados) {
    const resultado = await executar(
        `INSERT INTO plantio
            (id_usuario, cultura, area, data_plantio, status, observacoes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            dados.idUsuario,
            dados.cultura,
            dados.area,
            dados.dataPlantio,
            dados.status,
            dados.observacoes || null
        ]
    );

    return resultado.insertId;
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
        germinacao: "Germinação",
        crescimento: "Em crescimento",
        colheita: "Pronto para colheita"
    };

    return rotulos[status] || status;
}

module.exports = {
    STATUS_VALIDOS,
    listar,
    resumo,
    criar,
    excluir,
    rotuloStatus
};
