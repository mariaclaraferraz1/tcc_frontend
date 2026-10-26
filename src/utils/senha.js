const usuarioModel = require("../models/usuarioModel");
const {
    gerarHashSenha,
    verificarSenha,
    pareceHash,
    compararTextoSeguro
} = require("./security");

/**
 * Confere a senha aceitando hashes scrypt e, para bases antigas,
 * senhas em texto puro (com rehash automático em caso de sucesso).
 */
async function conferirSenha(usuario, senha) {
    if (!usuario || !usuario.senha) {
        return false;
    }

    if (pareceHash(usuario.senha)) {
        return verificarSenha(senha, usuario.senha);
    }

    const legadoValido = compararTextoSeguro(senha, usuario.senha);

    if (legadoValido) {
        try {
            const novoHash = await gerarHashSenha(senha);
            await usuarioModel.atualizarSenha(usuario.id_usuario, novoHash);
        } catch (erro) {
            console.error("Não foi possível atualizar a senha legada:", erro.message);
        }
    }

    return legadoValido;
}

module.exports = {
    conferirSenha
};
