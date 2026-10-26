/**
 * Converte senhas legadas (texto puro) para hash scrypt.
 * Pode ser executado com segurança várias vezes: ignora quem já é hash.
 *
 * Uso:
 *   npm run migrar-senhas
 */
const { testarConexao, descricaoConexao, pool } = require("../src/config/db");
const usuarioModel = require("../src/models/usuarioModel");
const { gerarHashSenha } = require("../src/utils/security");

async function main() {
    await testarConexao();
    console.log(`Conectado a ${descricaoConexao()}`);

    const usuarios = await usuarioModel.listarSenhasLegadas();

    if (usuarios.length === 0) {
        console.log("Nenhuma senha legada encontrada. Nada a fazer.");
        return;
    }

    for (const usuario of usuarios) {
        if (!usuario.senha) {
            console.log(`- Ignorado (senha vazia): ${usuario.email}`);
            continue;
        }

        const hash = await gerarHashSenha(usuario.senha);
        await usuarioModel.atualizarSenha(usuario.id_usuario, hash);
        console.log(`- Migrado: ${usuario.email}`);
    }

    console.log(`${usuarios.length} senha(s) migrada(s).`);
}

main()
    .catch((erro) => {
        console.error("Falha ao migrar senhas:", erro.message);
        process.exitCode = 1;
    })
    .finally(() => {
        pool.end();
    });
