const sessaoModel = require("../models/sessaoModel");
const { hashToken } = require("../utils/security");
const { obterMensagem } = require("../utils/mensagens");
const format = require("../utils/format");

const COOKIE_SESSAO = process.env.SESSION_COOKIE_NAME || "ruraltech_sessao";
const DIAS_SESSAO = Number(process.env.SESSION_MAX_AGE_DAYS || 7);

function lerCookies(cabecalho) {
    const cookies = {};

    if (!cabecalho) {
        return cookies;
    }

    String(cabecalho).split(";").forEach((parte) => {
        const separador = parte.indexOf("=");

        if (separador === -1) {
            return;
        }

        const chave = parte.slice(0, separador).trim();
        const valor = parte.slice(separador + 1).trim();

        if (!chave) {
            return;
        }

        try {
            cookies[chave] = decodeURIComponent(valor);
        } catch (erro) {
            cookies[chave] = valor;
        }
    });

    return cookies;
}

function definirCookieSessao(res, token) {
    const maxAge = DIAS_SESSAO * 24 * 60 * 60;
    const partes = [
        `${COOKIE_SESSAO}=${encodeURIComponent(token)}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${maxAge}`
    ];

    if (String(process.env.COOKIE_SECURE).toLowerCase() === "true") {
        partes.push("Secure");
    }

    res.setHeader("Set-Cookie", partes.join("; "));
}

function limparCookieSessao(res) {
    const partes = [
        `${COOKIE_SESSAO}=`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        "Max-Age=0"
    ];

    if (String(process.env.COOKIE_SECURE).toLowerCase() === "true") {
        partes.push("Secure");
    }

    res.setHeader("Set-Cookie", partes.join("; "));
}

async function carregarSessao(req, res, next) {
    const cookies = lerCookies(req.headers.cookie);
    const token = cookies[COOKIE_SESSAO];

    req.usuario = null;
    req.tokenSessao = null;

    if (token) {
        try {
            const usuario = await sessaoModel.buscarUsuarioPorToken(hashToken(token));

            if (usuario) {
                req.usuario = usuario;
                req.tokenSessao = token;
            }
        } catch (erro) {
            console.error("Falha ao carregar a sessão:", erro.message);
        }
    }

    next();
}

function exigirLogin(req, res, next) {
    if (!req.usuario) {
        return res.redirect("/login?erro=login-necessario");
    }

    next();
}

function menuAtivo(caminho) {
    if (caminho === "/" || caminho === "/inicio") {
        return "/inicio";
    }

    if (caminho.startsWith("/cadastro-produto") || caminho.startsWith("/produtos")) {
        return "/produtos";
    }

    if (caminho.startsWith("/dados-colheita") || caminho.startsWith("/plantio") || caminho.startsWith("/producao")) {
        return "/producao";
    }

    if (
        caminho.startsWith("/registrar-vendas") ||
        caminho.startsWith("/vendas") ||
        caminho.startsWith("/controle-de-gastos") ||
        caminho.startsWith("/perdas") ||
        caminho.startsWith("/lucros")
    ) {
        return "/comercial";
    }

    if (caminho.startsWith("/relatorios")) {
        return "/relatorios";
    }

    if (caminho.startsWith("/consulta")) {
        return "/consulta";
    }

    if (
        caminho.startsWith("/configuracoes") ||
        caminho.startsWith("/editar-perfil") ||
        caminho.startsWith("/alterar-senha")
    ) {
        return "/configuracoes";
    }

    return caminho;
}

function formatarMes(valor) {
    if (!valor) {
        return "-";
    }

    const partes = String(valor).split("-");

    if (partes.length === 2) {
        return `${partes[1]}/${partes[0]}`;
    }

    return String(valor);
}

function rotuloStatusPlantio(status) {
    const rotulos = {
        germinacao: "Germinação",
        crescimento: "Em crescimento",
        colheita: "Pronto para colheita"
    };

    return rotulos[status] || status || "-";
}

function locais(req, res, next) {
    res.locals.usuario = req.usuario || null;
    res.locals.rotaAtual = req.path;
    res.locals.menuAtivo = menuAtivo(req.path);
    res.locals.mensagem = obterMensagem(req.query.ok || req.query.erro);
    res.locals.filtrosQuery = req.query || {};
    res.locals.formatarMoeda = format.formatarMoeda;
    res.locals.formatarData = format.formatarData;
    res.locals.formatarQuantidade = format.formatarQuantidade;
    res.locals.formatarNumero = format.formatarNumero;
    res.locals.formatarMes = formatarMes;
    res.locals.rotuloStatusPlantio = rotuloStatusPlantio;
    res.locals.anoAtual = new Date().getFullYear();
    res.locals.hoje = format.hojeISO();

    next();
}

function naoEncontrado(req, res) {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ erro: "Recurso não encontrado." });
    }

    return res.status(404).render("erro", {
        titulo: "Página não encontrada",
        codigo: 404,
        mensagem: "A página que você tentou acessar não existe.",
        detalhes: null
    });
}

function tratarErro(erro, req, res, next) {
    console.error("Erro não tratado:", erro);

    if (res.headersSent) {
        return next(erro);
    }

    if (req.path.startsWith("/api/")) {
        return res.status(500).json({
            erro: "Erro interno ao processar a solicitação."
        });
    }

    return res.status(500).render("erro", {
        titulo: "Erro interno",
        codigo: 500,
        mensagem: "Não foi possível concluir a operação.",
        detalhes: process.env.NODE_ENV === "development" ? erro.message : null
    });
}

module.exports = {
    COOKIE_SESSAO,
    DIAS_SESSAO,
    lerCookies,
    definirCookieSessao,
    limparCookieSessao,
    carregarSessao,
    exigirLogin,
    locais,
    naoEncontrado,
    tratarErro
};
