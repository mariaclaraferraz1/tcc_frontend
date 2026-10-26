function asyncHandler(handler) {
    return function (req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

function redirecionarComSucesso(res, destino, chave) {
    const separador = destino.includes("?") ? "&" : "?";

    return res.redirect(`${destino}${separador}ok=${encodeURIComponent(chave)}`);
}

function redirecionarComErro(res, destino, chave) {
    const separador = destino.includes("?") ? "&" : "?";

    return res.redirect(`${destino}${separador}erro=${encodeURIComponent(chave)}`);
}

function respostaApiErro(res, status, mensagem, detalhes) {
    return res.status(status).json({
        erro: mensagem,
        detalhes: detalhes || undefined
    });
}

module.exports = {
    asyncHandler,
    redirecionarComSucesso,
    redirecionarComErro,
    respostaApiErro
};
