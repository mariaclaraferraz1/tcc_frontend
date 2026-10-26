const { query, buscarUm, executar } = require("../config/db");

async function buscarPorEmail(email) {
    return buscarUm(
        `SELECT id_usuario, nome, email, senha, telefone,
                notificacoes_sistema, lembretes
         FROM usuarios
         WHERE email = ?
         LIMIT 1`,
        [email]
    );
}

async function buscarPorId(idUsuario) {
    return buscarUm(
        `SELECT id_usuario, nome, email, telefone, notificacoes_sistema,
                lembretes, criado_em, atualizado_em
         FROM usuarios
         WHERE id_usuario = ?
         LIMIT 1`,
        [idUsuario]
    );
}

async function criar({ nome, email, senhaHash, telefone }) {
    const resultado = await executar(
        `INSERT INTO usuarios (nome, email, senha, telefone)
         VALUES (?, ?, ?, ?)`,
        [nome, email, senhaHash, telefone || null]
    );

    return resultado.insertId;
}

async function atualizarPerfil(idUsuario, { nome, email, telefone }) {
    await executar(
        `UPDATE usuarios
         SET nome = ?, email = ?, telefone = ?
         WHERE id_usuario = ?`,
        [nome, email, telefone || null, idUsuario]
    );
}

async function atualizarSenha(idUsuario, senhaHash) {
    await executar(
        `UPDATE usuarios
         SET senha = ?
         WHERE id_usuario = ?`,
        [senhaHash, idUsuario]
    );
}

async function atualizarPreferencias(idUsuario, { notificacoesSistema, lembretes }) {
    await executar(
        `UPDATE usuarios
         SET notificacoes_sistema = ?, lembretes = ?
         WHERE id_usuario = ?`,
        [notificacoesSistema ? 1 : 0, lembretes ? 1 : 0, idUsuario]
    );
}

async function emailEmUso(email, excetoId) {
    const usuario = await buscarUm(
        `SELECT id_usuario
         FROM usuarios
         WHERE email = ? AND id_usuario <> ?
         LIMIT 1`,
        [email, excetoId]
    );

    return Boolean(usuario);
}

async function listarSenhasLegadas() {
    return query(
        `SELECT id_usuario, email, senha
         FROM usuarios
         WHERE senha NOT LIKE 'scrypt$%'`
    );
}

module.exports = {
    buscarPorEmail,
    buscarPorId,
    criar,
    atualizarPerfil,
    atualizarSenha,
    atualizarPreferencias,
    emailEmUso,
    listarSenhasLegadas
};
