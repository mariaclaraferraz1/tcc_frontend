const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const DIRETORIO_UPLOADS = path.join(__dirname, "..", "..", "public", "uploads");
const PREFIXO_UPLOADS = "/uploads/";
const REGEX_DATA_URL = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([a-z0-9+/=\r\n]+)$/i;

const EXTENSOES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf"
};

function ehDataUrl(valor) {
    return REGEX_DATA_URL.test(String(valor || "").trim());
}

async function salvarDataUrl(valor, prefixo = "anexo") {
    const texto = String(valor || "").trim();

    if (!texto) {
        return null;
    }

    if (!ehDataUrl(texto)) {
        return texto;
    }

    const partes = REGEX_DATA_URL.exec(texto);
    const mime = partes[1].toLowerCase();
    const extensao = EXTENSOES[mime];

    if (!extensao) {
        const erro = new Error("Tipo de anexo inválido.");
        erro.status = 400;
        throw erro;
    }

    const conteudo = Buffer.from(partes[2].replace(/\s/g, ""), "base64");

    await fs.mkdir(DIRETORIO_UPLOADS, { recursive: true });

    const nome = [
        String(prefixo || "anexo").replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
        Date.now(),
        crypto.randomBytes(8).toString("hex")
    ].join("-") + extensao;

    await fs.writeFile(path.join(DIRETORIO_UPLOADS, nome), conteudo);

    return PREFIXO_UPLOADS + nome;
}

async function removerAnexo(valor) {
    const texto = String(valor || "").trim();

    if (!texto.startsWith(PREFIXO_UPLOADS)) {
        return;
    }

    const nome = path.basename(texto);

    if (!nome) {
        return;
    }

    await fs.unlink(path.join(DIRETORIO_UPLOADS, nome)).catch(() => {});
}

module.exports = {
    DIRETORIO_UPLOADS,
    PREFIXO_UPLOADS,
    ehDataUrl,
    salvarDataUrl,
    removerAnexo
};
