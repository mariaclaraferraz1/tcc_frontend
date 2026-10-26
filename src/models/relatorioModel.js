const { query } = require("../config/db");
const vendaModel = require("./vendaModel");
const gastoModel = require("./gastoModel");
const perdaModel = require("./perdaModel");
const producaoModel = require("./producaoModel");
const produtoModel = require("./produtoModel");
const plantioModel = require("./plantioModel");

function numero(valor) {
    const convertido = Number(valor);

    return Number.isFinite(convertido) ? convertido : 0;
}

function arredondar(valor) {
    return Math.round((numero(valor) + Number.EPSILON) * 100) / 100;
}

/**
 * Resumo financeiro consolidado.
 * Lucro líquido = vendas - gastos - perdas.
 */
async function resumoFinanceiro(idUsuario, filtros = {}) {
    const [vendas, gastos, perdas] = await Promise.all([
        vendaModel.resumo(idUsuario, filtros),
        gastoModel.resumo(idUsuario, filtros),
        perdaModel.resumo(idUsuario, filtros)
    ]);

    const totalVendas = numero(vendas && vendas.total_valor);
    const totalGastos = numero(gastos && gastos.total_valor);
    const totalPerdas = numero(perdas && perdas.total_valor);
    const lucroLiquido = arredondar(totalVendas - totalGastos - totalPerdas);

    return {
        totalVendas: arredondar(totalVendas),
        totalGastos: arredondar(totalGastos),
        totalPerdas: arredondar(totalPerdas),
        lucroLiquido,
        margem: totalVendas > 0 ? arredondar((lucroLiquido / totalVendas) * 100) : 0,
        quantidadeVendas: numero(vendas && vendas.total_registros),
        quantidadeGastos: numero(gastos && gastos.total_registros),
        quantidadePerdas: numero(perdas && perdas.total_registros),
        ticketMedio: numero(vendas && vendas.ticket_medio)
    };
}

function condicoesData(campo, filtros = {}) {
    const condicoes = [];
    const parametros = [];

    if (filtros.inicio) {
        condicoes.push(`AND ${campo} >= ?`);
        parametros.push(filtros.inicio);
    }

    if (filtros.fim) {
        condicoes.push(`AND ${campo} <= ?`);
        parametros.push(filtros.fim);
    }

    return { sql: condicoes.join(" "), parametros };
}

/**
 * Série mensal consolidada (vendas, gastos e perdas) sem depender de FULL JOIN.
 */
async function resumoMensal(idUsuario, filtros = {}) {
    const vendas = condicoesData("data_venda", filtros);
    const gastos = condicoesData("data_gasto", filtros);
    const perdas = condicoesData("data_perda", filtros);

    const parametros = [
        idUsuario,
        ...vendas.parametros,
        idUsuario,
        ...gastos.parametros,
        idUsuario,
        ...perdas.parametros
    ];

    const linhas = await query(
        `SELECT mes,
                COALESCE(SUM(vendas), 0) AS total_vendas,
                COALESCE(SUM(gastos), 0) AS total_gastos,
                COALESCE(SUM(perdas), 0) AS total_perdas,
                COALESCE(SUM(vendas - gastos - perdas), 0) AS lucro_liquido
         FROM (
             SELECT DATE_FORMAT(data_venda, '%Y-%m') AS mes,
                    valor_total AS vendas, 0 AS gastos, 0 AS perdas
             FROM vendas
             WHERE id_usuario = ? ${vendas.sql}
             UNION ALL
             SELECT DATE_FORMAT(data_gasto, '%Y-%m') AS mes,
                    0 AS vendas, valor AS gastos, 0 AS perdas
             FROM gastos
             WHERE id_usuario = ? ${gastos.sql}
             UNION ALL
             SELECT DATE_FORMAT(data_perda, '%Y-%m') AS mes,
                    0 AS vendas, 0 AS gastos, valor_estimado AS perdas
             FROM perdas
             WHERE id_usuario = ? ${perdas.sql}
         ) AS movimentos
         GROUP BY mes
         ORDER BY mes ASC`,
        parametros
    );

    return linhas.map((linha) => ({
        mes: linha.mes,
        totalVendas: arredondar(linha.total_vendas),
        totalGastos: arredondar(linha.total_gastos),
        totalPerdas: arredondar(linha.total_perdas),
        lucroLiquido: arredondar(linha.lucro_liquido)
    }));
}

function relatorioVendas(registros, resumo) {
    return {
        titulo: "Relatório de vendas",
        colunas: [
            { chave: "data_venda", rotulo: "Data", tipo: "data" },
            { chave: "produto", rotulo: "Produto", tipo: "texto" },
            { chave: "cliente", rotulo: "Cliente", tipo: "texto" },
            { chave: "quantidade", rotulo: "Quantidade", tipo: "quantidade" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "preco_unitario", rotulo: "Preço unit.", tipo: "moeda" },
            { chave: "valor_total", rotulo: "Total", tipo: "moeda" },
            { chave: "forma_pagamento", rotulo: "Pagamento", tipo: "texto" }
        ],
        registros,
        resumo: [
            { rotulo: "Vendas", valor: resumo.total_valor, tipo: "moeda" },
            { rotulo: "Registros", valor: resumo.total_registros, tipo: "numero" },
            { rotulo: "Quantidade", valor: resumo.total_quantidade, tipo: "quantidade" },
            { rotulo: "Ticket médio", valor: resumo.ticket_medio, tipo: "moeda" }
        ]
    };
}

function relatorioGastos(registros, resumo) {
    return {
        titulo: "Relatório de gastos",
        colunas: [
            { chave: "data_gasto", rotulo: "Data", tipo: "data" },
            { chave: "descricao", rotulo: "Descrição", tipo: "texto" },
            { chave: "categoria", rotulo: "Categoria", tipo: "texto" },
            { chave: "classificacao", rotulo: "Classificação", tipo: "texto" },
            { chave: "fornecedor", rotulo: "Fornecedor", tipo: "texto" },
            { chave: "forma_pagamento", rotulo: "Pagamento", tipo: "texto" },
            { chave: "valor", rotulo: "Valor", tipo: "moeda" }
        ],
        registros,
        resumo: [
            { rotulo: "Gastos", valor: resumo.total_valor, tipo: "moeda" },
            { rotulo: "Registros", valor: resumo.total_registros, tipo: "numero" },
            { rotulo: "Média", valor: resumo.media_valor, tipo: "moeda" }
        ]
    };
}

function relatorioPerdas(registros, resumo) {
    return {
        titulo: "Relatório de perdas",
        colunas: [
            { chave: "data_perda", rotulo: "Data", tipo: "data" },
            { chave: "produto", rotulo: "Produto", tipo: "texto" },
            { chave: "quantidade", rotulo: "Quantidade", tipo: "quantidade" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "motivo", rotulo: "Motivo", tipo: "texto" },
            { chave: "local_perda", rotulo: "Local", tipo: "texto" },
            { chave: "valor_unitario", rotulo: "Valor unit.", tipo: "moeda" },
            { chave: "valor_estimado", rotulo: "Total", tipo: "moeda" }
        ],
        registros,
        resumo: [
            { rotulo: "Perdas", valor: resumo.total_valor, tipo: "moeda" },
            { rotulo: "Registros", valor: resumo.total_registros, tipo: "numero" },
            { rotulo: "Quantidade", valor: resumo.total_quantidade, tipo: "quantidade" }
        ]
    };
}

function relatorioProducao(registros, resumo) {
    return {
        titulo: "Relatório de produção",
        colunas: [
            { chave: "data_producao", rotulo: "Data da colheita", tipo: "data" },
            { chave: "produto", rotulo: "Produto", tipo: "texto" },
            { chave: "quantidade", rotulo: "Quantidade", tipo: "quantidade" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "peso", rotulo: "Peso (kg)", tipo: "quantidade" },
            { chave: "data_plantio", rotulo: "Plantio", tipo: "data" },
            { chave: "observacoes", rotulo: "Observações", tipo: "texto" }
        ],
        registros,
        resumo: [
            { rotulo: "Registros", valor: resumo.total_registros, tipo: "numero" },
            { rotulo: "Quantidade", valor: resumo.total_quantidade, tipo: "quantidade" },
            { rotulo: "Peso total", valor: resumo.total_peso, tipo: "quantidade" }
        ]
    };
}

function relatorioProdutos(registros, estatisticas) {
    return {
        titulo: "Relatório de produtos",
        colunas: [
            { chave: "nome", rotulo: "Produto", tipo: "texto" },
            { chave: "categoria", rotulo: "Categoria", tipo: "texto" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "preco", rotulo: "Preço", tipo: "moeda" },
            { chave: "estoque", rotulo: "Estoque", tipo: "quantidade" },
            { chave: "valor_estoque", rotulo: "Valor em estoque", tipo: "moeda" }
        ],
        registros: registros.map((produto) => ({
            ...produto,
            valor_estoque: arredondar(numero(produto.estoque) * numero(produto.preco))
        })),
        resumo: [
            { rotulo: "Produtos", valor: estatisticas.total_produtos, tipo: "numero" },
            { rotulo: "Categorias", valor: estatisticas.total_categorias, tipo: "numero" },
            { rotulo: "Estoque", valor: estatisticas.total_estoque, tipo: "quantidade" },
            { rotulo: "Valor em estoque", valor: estatisticas.valor_estoque, tipo: "moeda" }
        ]
    };
}

function relatorioLucros(resumo, mensal) {
    return {
        titulo: "Relatório de lucros",
        colunas: [
            { chave: "mes", rotulo: "Mês", tipo: "mes" },
            { chave: "totalVendas", rotulo: "Vendas", tipo: "moeda" },
            { chave: "totalGastos", rotulo: "Gastos", tipo: "moeda" },
            { chave: "totalPerdas", rotulo: "Perdas", tipo: "moeda" },
            { chave: "lucroLiquido", rotulo: "Lucro líquido", tipo: "moeda" }
        ],
        registros: mensal,
        resumo: [
            { rotulo: "Vendas", valor: resumo.totalVendas, tipo: "moeda" },
            { rotulo: "Gastos", valor: resumo.totalGastos, tipo: "moeda" },
            { rotulo: "Perdas", valor: resumo.totalPerdas, tipo: "moeda" },
            { rotulo: "Lucro líquido", valor: resumo.lucroLiquido, tipo: "moeda", destaque: true }
        ]
    };
}

const TIPOS = {
    vendas: "vendas",
    gastos: "gastos",
    perdas: "perdas",
    producao: "producao",
    produtos: "produtos",
    lucros: "lucros"
};

async function gerarRelatorio(tipo, idUsuario, filtros = {}) {
    if (!TIPOS[tipo]) {
        return null;
    }

    if (tipo === "vendas") {
        const [registros, resumo] = await Promise.all([
            vendaModel.listar(idUsuario, filtros),
            vendaModel.resumo(idUsuario, filtros)
        ]);

        return relatorioVendas(registros, resumo);
    }

    if (tipo === "gastos") {
        const [registros, resumo] = await Promise.all([
            gastoModel.listar(idUsuario, filtros),
            gastoModel.resumo(idUsuario, filtros)
        ]);

        return relatorioGastos(registros, resumo);
    }

    if (tipo === "perdas") {
        const [registros, resumo] = await Promise.all([
            perdaModel.listar(idUsuario, filtros),
            perdaModel.resumo(idUsuario, filtros)
        ]);

        return relatorioPerdas(registros, resumo);
    }

    if (tipo === "producao") {
        const [registros, resumo] = await Promise.all([
            producaoModel.listar(idUsuario, filtros),
            producaoModel.resumo(idUsuario, filtros)
        ]);

        return relatorioProducao(registros, resumo);
    }

    if (tipo === "produtos") {
        const [registros, estatisticas] = await Promise.all([
            produtoModel.listar(idUsuario),
            produtoModel.obterEstatisticas(idUsuario)
        ]);

        return relatorioProdutos(registros, estatisticas);
    }

    const [resumo, mensal] = await Promise.all([
        resumoFinanceiro(idUsuario, filtros),
        resumoMensal(idUsuario, filtros)
    ]);

    return relatorioLucros(resumo, mensal);
}

async function indicadoresInicio(idUsuario) {
    const [financeiro, produtos, producao, plantio] = await Promise.all([
        resumoFinanceiro(idUsuario),
        produtoModel.obterEstatisticas(idUsuario),
        producaoModel.totalProduzido(idUsuario),
        plantioModel.resumo(idUsuario)
    ]);

    return {
        financeiro,
        produtos,
        producao: numero(producao && producao.total),
        plantio
    };
}

module.exports = {
    TIPOS,
    resumoFinanceiro,
    resumoMensal,
    gerarRelatorio,
    indicadoresInicio
};
