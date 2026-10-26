/**
 * Testa a conexão com o banco configurado no .env e mostra um resumo.
 *
 * Uso:
 *   npm run testar-conexao
 */
const {
    query,
    testarConexao,
    descricaoConexao,
    pool
} = require("../src/config/db");

async function main() {
    await testarConexao();
    console.log(`Conexão OK: ${descricaoConexao()}`);

    const tabelas = await query(
        `SELECT TABLE_NAME AS nome
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
         ORDER BY TABLE_NAME`
    );

    console.log(`Tabelas encontradas (${tabelas.length}):`);
    tabelas.forEach((tabela) => console.log(`  - ${tabela.nome}`));

    const usuarios = await query("SELECT COUNT(*) AS total FROM usuarios");
    console.log(`Usuários cadastrados: ${usuarios[0].total}`);
}

main()
    .catch((erro) => {
        console.error(`Falha na conexão: ${erro.message}`);
        process.exitCode = 1;
    })
    .finally(() => {
        pool.end();
    });
