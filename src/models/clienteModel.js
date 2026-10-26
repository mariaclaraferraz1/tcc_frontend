const { query, buscarUm, executar } = require("../config/db");

async function listarPorUsuario(idUsuario) {
    return query(
        `SELECT id_cliente, nome, telefone, email
         FROM clientes
         WHERE id_usuario = ?
         ORDER BY nome ASC`,
        [idUsuario]
    );
}

async function buscarPorId(idCliente, idUsuario) {
    return buscarUm(
        `SELECT id_cliente, nome, telefone, email
         FROM clientes
         WHERE id_cliente = ? AND id_usuario = ?
         LIMIT 1`,
        [idCliente, idUsuario]
    );
}

async function buscarOuCriar(idUsuario, nome, dados = {}) {
    const nomeNormalizado = String(nome || "").trim();

    if (!nomeNormalizado) {
        return null;
    }

    const existente = await buscarUm(
        `SELECT id_cliente, nome, telefone, email
         FROM clientes
         WHERE id_usuario = ? AND nome = ?
         LIMIT 1`,
        [idUsuario, nomeNormalizado]
    );

    if (existente) {
        return existente;
    }

    try {
        const resultado = await executar(
            `INSERT INTO clientes (id_usuario, nome, telefone, email)
             VALUES (?, ?, ?, ?)`,
            [idUsuario, nomeNormalizado, dados.telefone || null, dados.email || null]
        );

        return {
            id_cliente: resultado.insertId,
            nome: nomeNormalizado,
            telefone: dados.telefone || null,
            email: dados.email || null
        };
    } catch (erro) {
        if (erro && erro.code === "ER_DUP_ENTRY") {
            return buscarUm(
                `SELECT id_cliente, nome, telefone, email
                 FROM clientes
                 WHERE id_usuario = ? AND nome = ?
                 LIMIT 1`,
                [idUsuario, nomeNormalizado]
            );
        }

        throw erro;
    }
}

module.exports = {
    listarPorUsuario,
    buscarPorId,
    buscarOuCriar
};
