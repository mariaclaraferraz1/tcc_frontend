const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor, limite = 255) {
    if (valor === undefined || valor === null) {
        return "";
    }

    return String(valor).trim().slice(0, limite);
}

function email(valor) {
    const normalizado = texto(valor, 150).toLowerCase();

    return REGEX_EMAIL.test(normalizado) ? normalizado : null;
}

function data(valor, obrigatoria = false) {
    const normalizada = texto(valor, 10);

    if (!normalizada) {
        return obrigatoria ? null : "";
    }

    if (!REGEX_DATA.test(normalizada)) {
        return null;
    }

    const [ano, mes, dia] = normalizada.split("-").map(Number);
    const verificacao = new Date(Date.UTC(ano, mes - 1, dia));

    if (
        verificacao.getUTCFullYear() !== ano ||
        verificacao.getUTCMonth() !== mes - 1 ||
        verificacao.getUTCDate() !== dia
    ) {
        return null;
    }

    return normalizada;
}

function numero(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : null;
    }

    const normalizado = String(valor)
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(\D|$))/g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

    if (!normalizado || normalizado === "-" || normalizado === ".") {
        return null;
    }

    const convertido = Number(normalizado);

    return Number.isFinite(convertido) ? convertido : null;
}

function inteiro(valor) {
    const convertido = numero(valor);

    if (convertido === null || !Number.isInteger(convertido)) {
        return null;
    }

    return convertido;
}

function id(valor) {
    const convertido = inteiro(valor);

    return convertido !== null && convertido > 0 ? convertido : null;
}

function senha(valor) {
    const convertida = texto(valor, 200);

    if (convertida.length < 8) {
        return {
            valida: false,
            mensagem: "A senha deve ter pelo menos 8 caracteres."
        };
    }

    if (!/[A-Za-z]/.test(convertida) || !/\d/.test(convertida)) {
        return {
            valida: false,
            mensagem: "A senha deve conter letras e números."
        };
    }

    return { valida: true, mensagem: "" };
}

module.exports = {
    texto,
    email,
    data,
    numero,
    inteiro,
    id,
    senha
};
