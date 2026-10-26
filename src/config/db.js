const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// ---------------------------------------------------------------------------
// Carrega as variáveis do arquivo .env (sem depender do pacote dotenv).
// O arquivo .env.example documenta todas as variáveis aceitas.
// ---------------------------------------------------------------------------
function carregarEnv() {
    const arquivo = path.join(__dirname, "..", "..", ".env");

    if (!fs.existsSync(arquivo)) {
        return;
    }

    const conteudo = fs.readFileSync(arquivo, "utf8");

    conteudo.split(/\r?\n/).forEach((linha) => {
        const texto = linha.trim();

        if (!texto || texto.startsWith("#")) {
            return;
        }

        const separador = texto.indexOf("=");

        if (separador === -1) {
            return;
        }

        const chave = texto.slice(0, separador).trim();
        let valor = texto.slice(separador + 1).trim();

        if (
            (valor.startsWith('"') && valor.endsWith('"')) ||
            (valor.startsWith("'") && valor.endsWith("'"))
        ) {
            valor = valor.slice(1, -1);
        }

        if (process.env[chave] === undefined) {
            process.env[chave] = valor;
        }
    });
}

carregarEnv();

const configuracao = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "rural_tech",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    decimalNumbers: true,
    dateStrings: true,
    charset: "utf8mb4"
};

const pool = mysql.createPool(configuracao);

async function query(sql, parametros = []) {
    const [linhas] = await pool.query(sql, parametros);
    return linhas;
}

async function buscarUm(sql, parametros = []) {
    const linhas = await query(sql, parametros);

    return linhas.length > 0 ? linhas[0] : null;
}

async function executar(sql, parametros = []) {
    const [resultado] = await pool.execute(sql, parametros);

    return resultado;
}

async function comTransacao(callback) {
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();
        const resultado = await callback(conexao);
        await conexao.commit();

        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

async function testarConexao() {
    const conexao = await pool.getConnection();

    try {
        await conexao.ping();

        return true;
    } finally {
        conexao.release();
    }
}

function descricaoConexao() {
    return `${configuracao.user}@${configuracao.host}:${configuracao.port}/${configuracao.database}`;
}

module.exports = {
    pool,
    configuracao,
    query,
    buscarUm,
    executar,
    comTransacao,
    testarConexao,
    descricaoConexao
};
