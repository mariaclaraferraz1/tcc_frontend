const validation = require("../utils/validation");

const LIMITE_BYTES = 2 * 1024 * 1024;
const LIMITE_TEXTO = 3 * 1024 * 1024;
const LIMITE_LINK = 2000;
const REGEX_IMAGEM = /^data:image\/(png|jpe?g|webp|gif);base64,([a-z0-9+/=\r\n]+)$/i;
const REGEX_COMPROVANTE = /^data:(image\/(png|jpe?g|webp|gif)|application\/pdf);base64,([a-z0-9+/=\r\n]+)$/i;

function tamanhoBase64(conteudo) {
    const limpo = String(conteudo || "").replace(/\s/g, "");
    const preenchimento = limpo.endsWith("==") ? 2 : (limpo.endsWith("=") ? 1 : 0);

    return Math.floor((limpo.length * 3) / 4) - preenchimento;
}

function lerAnexo(valor) {
    return String(valor === undefined || valor === null ? "" : valor).trim();
}

function normalizarAnexo(valor, regex, mensagemTipo, mensagemTamanho) {
    const texto = lerAnexo(valor);

    if (!texto) {
        return { valor: null, erro: null };
    }

    if (texto.length > LIMITE_TEXTO) {
        return { valor: null, erro: mensagemTamanho };
    }

    const anexo = regex.exec(texto);

    if (anexo) {
        const conteudo = anexo[anexo.length - 1];

        if (tamanhoBase64(conteudo) > LIMITE_BYTES) {
            return { valor: null, erro: mensagemTamanho };
        }

        return { valor: texto, erro: null };
    }

    if (texto.length <= LIMITE_LINK && /^(https?:\/\/|\/)[^\s]+$/i.test(texto)) {
        return { valor: texto, erro: null };
    }

    return { valor: null, erro: mensagemTipo };
}

function paraData(valor) {
    const normalizada = validation.data(valor, false);

    return normalizada || "";
}

function filtrosBasicos(query, extras = []) {
    const filtros = {
        q: validation.texto(query.q, 120),
        inicio: paraData(query.inicio),
        fim: paraData(query.fim)
    };

    extras.forEach((chave) => {
        const valor = query[chave];

        if (valor === undefined || valor === null) {
            filtros[chave] = "";
        } else {
            filtros[chave] = validation.texto(valor, 120);
        }
    });

    return filtros;
}

function idDaQuery(query) {
    return validation.id(query.id);
}

function idDoParametro(valor) {
    return validation.id(valor);
}

function normalizarImagem(valor) {
    return normalizarAnexo(
        valor,
        REGEX_IMAGEM,
        "Formato de imagem inválido. Envie PNG, JPG, WEBP, GIF ou informe um link de imagem.",
        "A imagem é muito grande. Use um arquivo de até 2 MB."
    );
}

function normalizarComprovante(valor) {
    return normalizarAnexo(
        valor,
        REGEX_COMPROVANTE,
        "Comprovante inválido. Envie imagem, PDF ou informe um link.",
        "O comprovante é muito grande. Use um arquivo de até 2 MB."
    );
}

function booleano(valor) {
    return valor === true || valor === "1" || valor === "on" || valor === "true";
}

module.exports = {
    LIMITE_BYTES,
    filtrosBasicos,
    idDaQuery,
    idDoParametro,
    normalizarImagem,
    normalizarComprovante,
    booleano
};
