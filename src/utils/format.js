function arredondar(valor, casas = 2) {
    const fator = Math.pow(10, casas);

    return Math.round((Number(valor) + Number.EPSILON) * fator) / fator;
}

function numero(valor, padrao = 0) {
    const convertido = Number(valor);

    return Number.isFinite(convertido) ? convertido : padrao;
}

function formatarMoeda(valor) {
    return numero(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarNumero(valor, casas = 2) {
    return numero(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

function formatarQuantidade(valor) {
    const convertido = numero(valor);

    return Number.isInteger(convertido)
        ? convertido.toLocaleString("pt-BR")
        : convertido.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
          });
}

function formatarData(valor) {
    if (!valor) {
        return "-";
    }

    if (valor instanceof Date) {
        return valor.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    }

    const texto = String(valor).slice(0, 10);
    const partes = texto.split("-");

    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return texto;
}

function hojeISO() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function inicioDoMesISO() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");

    return `${ano}-${mes}-01`;
}

module.exports = {
    arredondar,
    numero,
    formatarMoeda,
    formatarNumero,
    formatarQuantidade,
    formatarData,
    hojeISO,
    inicioDoMesISO
};
