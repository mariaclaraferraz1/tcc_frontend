const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);

const TAMANHO_CHAVE = 64;
const PREFIXO = "scrypt";

async function gerarHashSenha(senha) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivado = await scrypt(String(senha), salt, TAMANHO_CHAVE);

    return `${PREFIXO}$${salt}$${derivado.toString("hex")}`;
}

function pareceHash(valor) {
    return typeof valor === "string" && valor.startsWith(`${PREFIXO}$`);
}

async function verificarSenha(senha, hash) {
    if (!pareceHash(hash)) {
        return false;
    }

    const partes = hash.split("$");

    if (partes.length !== 3) {
        return false;
    }

    const [, salt, hashArmazenado] = partes;

    try {
        const derivado = await scrypt(String(senha), salt, TAMANHO_CHAVE);
        const armazenado = Buffer.from(hashArmazenado, "hex");

        if (armazenado.length !== derivado.length) {
            return false;
        }

        return crypto.timingSafeEqual(armazenado, derivado);
    } catch (erro) {
        return false;
    }
}

function gerarToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
    return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function compararTextoSeguro(a, b) {
    const bufferA = Buffer.from(String(a));
    const bufferB = Buffer.from(String(b));

    if (bufferA.length !== bufferB.length) {
        return false;
    }

    return crypto.timingSafeEqual(bufferA, bufferB);
}

module.exports = {
    gerarHashSenha,
    verificarSenha,
    pareceHash,
    gerarToken,
    hashToken,
    compararTextoSeguro
};
