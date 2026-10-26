/**
 * Cria um usuário com senha segura (hash scrypt).
 *
 * Uso:
 *   npm run criar-usuario -- "Nome" "email@exemplo.com" "Senha123"
 */
const { testarConexao, descricaoConexao } = require("../src/config/db");
const usuarioModel = require("../src/models/usuarioModel");
const { gerarHashSenha } = require("../src/utils/security");
const validation = require("../src/utils/validation");

async function main() {
    const [nomeArg, emailArg, senhaArg] = process.argv.slice(2);
    const nome = validation.texto(nomeArg, 100);
    const email = validation.email(emailArg);
    const senha = validation.texto(senhaArg, 200);

    if (!nome || !email || !senha) {
        console.error('Uso: npm run criar-usuario -- "Nome" "email@exemplo.com" "Senha123"');
        process.exitCode = 1;
        return;
    }

    const forca = validation.senha(senha);

    if (!forca.valida) {
        console.error(forca.mensagem);
        process.exitCode = 1;
        return;
    }

    await testarConexao();
    console.log(`Conectado a ${descricaoConexao()}`);

    const existente = await usuarioModel.buscarPorEmail(email);

    if (existente) {
        console.error("Já existe um usuário com este e-mail.");
        process.exitCode = 1;
        return;
    }

    const senhaHash = await gerarHashSenha(senha);
    const id = await usuarioModel.criar({ nome, email, senhaHash, telefone: null });

    console.log(`Usuário criado com sucesso (id ${id}): ${nome} <${email}>`);
}

main()
    .catch((erro) => {
        console.error("Falha ao criar usuário:", erro.message);
        process.exitCode = 1;
    })
    .finally(() => {
        const { pool } = require("../src/config/db");
        pool.end();
    });
