const { buscarUm, executar } = require("../config/db");

async function criar(idUsuario, tokenHash, dias = 7) {
    await executar(
        `INSERT INTO sessoes (id_usuario, token_hash, expira_em)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
        [idUsuario, tokenHash, dias]
    );
}

async function buscarUsuarioPorToken(tokenHash) {
    return buscarUm(
        `SELECT u.id_usuario, u.nome, u.email, u.telefone,
                u.notificacoes_sistema, u.lembretes
         FROM sessoes s
         INNER JOIN usuarios u ON u.id_usuario = s.id_usuario
         WHERE s.token_hash = ?
           AND s.expira_em > NOW()
         LIMIT 1`,
        [tokenHash]
    );
}

async function excluir(tokenHash) {
    await executar("DELETE FROM sessoes WHERE token_hash = ?", [tokenHash]);
}

async function excluirOutrasSessoes(idUsuario, tokenHashAtual) {
    await executar(
        `DELETE FROM sessoes
         WHERE id_usuario = ? AND token_hash <> ?`,
        [idUsuario, tokenHashAtual]
    );
}

async function limparExpiradas() {
    await executar("DELETE FROM sessoes WHERE expira_em <= NOW()");
}

module.exports = {
    criar,
    buscarUsuarioPorToken,
    excluir,
    excluirOutrasSessoes,
    limparExpiradas
};
