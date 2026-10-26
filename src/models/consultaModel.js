const { query } = require("../config/db");

const LIMITE = 200;

function paraNumero(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    const normalizado = String(valor)
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(\D|$))/g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

    const convertido = Number(normalizado);

    return Number.isFinite(convertido) ? convertido : null;
}

function montarFiltros(filtros, configuracao) {
    const condicoes = [];
    const parametros = [];

    if (configuracao.condicaoBase) {
        condicoes.push(configuracao.condicaoBase);
    }

    const tipo = String(filtros.tipo || "").trim();
    const busca = String(filtros.q || "").trim();

    if (busca && tipo !== "data") {
        if (tipo === "quantidade" && configuracao.campoQuantidade) {
            const valor = paraNumero(busca);

            if (valor !== null) {
                condicoes.push(`${configuracao.campoQuantidade} >= ?`);
                parametros.push(valor);
            }
        } else if (tipo === "valor" && configuracao.campoValor) {
            const valor = paraNumero(busca);

            if (valor !== null) {
                condicoes.push(`${configuracao.campoValor} >= ?`);
                parametros.push(valor);
            }
        } else if (configuracao.camposTexto && configuracao.camposTexto.length > 0) {
            condicoes.push(`(${configuracao.camposTexto.map((campo) => `${campo} LIKE ?`).join(" OR ")})`);
            const termo = `%${busca}%`;
            for (let i = 0; i < configuracao.camposTexto.length; i++) {
                parametros.push(termo);
            }
        }
    }

    if (configuracao.campoData) {
        if (filtros.inicio) {
            condicoes.push(`${configuracao.campoData} >= ?`);
            parametros.push(filtros.inicio);
        }

        if (filtros.fim) {
            condicoes.push(`${configuracao.campoData} <= ?`);
            parametros.push(filtros.fim);
        }
    }

    return {
        where: condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "",
        parametros
    };
}

function grupo(categoria, titulo, icone, colunas, registros, total) {
    return {
        categoria,
        titulo,
        icone,
        colunas,
        registros,
        total: total === undefined ? registros.length : total
    };
}

async function buscarProdutos(idUsuario, filtros) {
    const base = ["id_usuario = ?", "ativo = 1"];
    const { where, parametros } = montarFiltros(filtros, {
        condicaoBase: base.join(" AND "),
        camposTexto: ["nome", "categoria", "descricao"],
        campoData: "DATE(criado_em)",
        campoQuantidade: "estoque",
        campoValor: "preco"
    });

    const registros = await query(
        `SELECT nome, categoria, unidade, preco, estoque, criado_em
         FROM produtos
         ${where}
         ORDER BY nome ASC
         LIMIT ${LIMITE}`,
        [idUsuario, ...parametros]
    );

    return grupo(
        "produtos",
        "Produtos",
        "fa-box",
        [
            { chave: "nome", rotulo: "Produto", tipo: "texto" },
            { chave: "categoria", rotulo: "Categoria", tipo: "texto" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "preco", rotulo: "Preço", tipo: "moeda" },
            { chave: "estoque", rotulo: "Estoque", tipo: "quantidade" },
            { chave: "criado_em", rotulo: "Cadastro", tipo: "data" }
        ],
        registros
    );
}

async function buscarVendas(idUsuario, filtros) {
    const { where, parametros } = montarFiltros(filtros, {
        condicaoBase: "v.id_usuario = ?",
        camposTexto: ["p.nome", "c.nome", "v.forma_pagamento", "v.observacoes"],
        campoData: "v.data_venda",
        campoQuantidade: "v.quantidade",
        campoValor: "v.valor_total"
    });

    const registros = await query(
        `SELECT v.data_venda, p.nome AS produto, c.nome AS cliente,
                v.quantidade, v.unidade, v.preco_unitario, v.valor_total,
                v.forma_pagamento
         FROM vendas v
         INNER JOIN produtos p ON p.id_produto = v.id_produto
         LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
         ${where}
         ORDER BY v.data_venda DESC, v.id_venda DESC
         LIMIT ${LIMITE}`,
        [idUsuario, ...parametros]
    );

    return grupo(
        "vendas",
        "Vendas",
        "fa-cart-shopping",
        [
            { chave: "data_venda", rotulo: "Data", tipo: "data" },
            { chave: "produto", rotulo: "Produto", tipo: "texto" },
            { chave: "cliente", rotulo: "Cliente", tipo: "texto" },
            { chave: "quantidade", rotulo: "Qtd.", tipo: "quantidade" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "valor_total", rotulo: "Total", tipo: "moeda" }
        ],
        registros
    );
}

async function buscarGastos(idUsuario, filtros) {
    const { where, parametros } = montarFiltros(filtros, {
        condicaoBase: "id_usuario = ?",
        camposTexto: ["descricao", "categoria", "fornecedor", "classificacao", "observacao"],
        campoData: "data_gasto",
        campoValor: "valor"
    });

    const registros = await query(
        `SELECT data_gasto, descricao, categoria, classificacao, fornecedor,
                forma_pagamento, valor
         FROM gastos
         ${where}
         ORDER BY data_gasto DESC, id_gasto DESC
         LIMIT ${LIMITE}`,
        [idUsuario, ...parametros]
    );

    return grupo(
        "gastos",
        "Gastos",
        "fa-receipt",
        [
            { chave: "data_gasto", rotulo: "Data", tipo: "data" },
            { chave: "descricao", rotulo: "Descrição", tipo: "texto" },
            { chave: "categoria", rotulo: "Categoria", tipo: "texto" },
            { chave: "classificacao", rotulo: "Classificação", tipo: "texto" },
            { chave: "fornecedor", rotulo: "Fornecedor", tipo: "texto" },
            { chave: "valor", rotulo: "Valor", tipo: "moeda" }
        ],
        registros
    );
}

async function buscarPerdas(idUsuario, filtros) {
    const { where, parametros } = montarFiltros(filtros, {
        condicaoBase: "pe.id_usuario = ?",
        camposTexto: ["p.nome", "pe.motivo", "pe.local_perda", "pe.observacoes"],
        campoData: "pe.data_perda",
        campoQuantidade: "pe.quantidade",
        campoValor: "pe.valor_estimado"
    });

    const registros = await query(
        `SELECT pe.data_perda, p.nome AS produto, pe.quantidade, pe.unidade,
                pe.motivo, pe.local_perda, pe.valor_unitario, pe.valor_estimado
         FROM perdas pe
         INNER JOIN produtos p ON p.id_produto = pe.id_produto
         ${where}
         ORDER BY pe.data_perda DESC, pe.id_perda DESC
         LIMIT ${LIMITE}`,
        [idUsuario, ...parametros]
    );

    return grupo(
        "perdas",
        "Perdas",
        "fa-triangle-exclamation",
        [
            { chave: "data_perda", rotulo: "Data", tipo: "data" },
            { chave: "produto", rotulo: "Produto", tipo: "texto" },
            { chave: "quantidade", rotulo: "Qtd.", tipo: "quantidade" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "motivo", rotulo: "Motivo", tipo: "texto" },
            { chave: "valor_estimado", rotulo: "Valor", tipo: "moeda" }
        ],
        registros
    );
}

async function buscarProducao(idUsuario, filtros) {
    const { where, parametros } = montarFiltros(filtros, {
        condicaoBase: "pr.id_usuario = ?",
        camposTexto: ["p.nome", "pr.observacoes"],
        campoData: "pr.data_producao",
        campoQuantidade: "pr.quantidade"
    });

    const registros = await query(
        `SELECT pr.data_producao, p.nome AS produto, pr.quantidade,
                p.unidade, pr.peso, pr.data_plantio, pr.observacoes
         FROM producao pr
         INNER JOIN produtos p ON p.id_produto = pr.id_produto
         ${where}
         ORDER BY pr.data_producao DESC, pr.id_producao DESC
         LIMIT ${LIMITE}`,
        [idUsuario, ...parametros]
    );

    return grupo(
        "producao",
        "Produção",
        "fa-seedling",
        [
            { chave: "data_producao", rotulo: "Colheita", tipo: "data" },
            { chave: "produto", rotulo: "Produto", tipo: "texto" },
            { chave: "quantidade", rotulo: "Qtd.", tipo: "quantidade" },
            { chave: "unidade", rotulo: "Unidade", tipo: "texto" },
            { chave: "peso", rotulo: "Peso (kg)", tipo: "quantidade" },
            { chave: "data_plantio", rotulo: "Plantio", tipo: "data" }
        ],
        registros
    );
}

async function buscarPlantio(idUsuario, filtros) {
    const { where, parametros } = montarFiltros(filtros, {
        condicaoBase: "id_usuario = ?",
        camposTexto: ["cultura", "area", "observacoes"],
        campoData: "data_plantio"
    });

    const registros = await query(
        `SELECT cultura, area, data_plantio, status, observacoes
         FROM plantio
         ${where}
         ORDER BY data_plantio DESC, id_plantio DESC
         LIMIT ${LIMITE}`,
        [idUsuario, ...parametros]
    );

    return grupo(
        "plantio",
        "Plantio",
        "fa-wheat-awn",
        [
            { chave: "cultura", rotulo: "Cultura", tipo: "texto" },
            { chave: "area", rotulo: "Área / Talhão", tipo: "texto" },
            { chave: "data_plantio", rotulo: "Plantio", tipo: "data" },
            { chave: "status", rotulo: "Status", tipo: "statusPlantio" }
        ],
        registros.map((registro) => ({
            ...registro,
            status: registro.status
        }))
    );
}

async function buscarClientes(idUsuario, filtros) {
    const { where, parametros } = montarFiltros(filtros, {
        condicaoBase: "id_usuario = ?",
        camposTexto: ["nome", "telefone", "email"],
        campoData: "DATE(criado_em)"
    });

    const registros = await query(
        `SELECT nome, telefone, email, criado_em
         FROM clientes
         ${where}
         ORDER BY nome ASC
         LIMIT ${LIMITE}`,
        [idUsuario, ...parametros]
    );

    return grupo(
        "clientes",
        "Clientes",
        "fa-users",
        [
            { chave: "nome", rotulo: "Cliente", tipo: "texto" },
            { chave: "telefone", rotulo: "Telefone", tipo: "texto" },
            { chave: "email", rotulo: "E-mail", tipo: "texto" },
            { chave: "criado_em", rotulo: "Cadastro", tipo: "data" }
        ],
        registros
    );
}

const BUSCADORES = {
    produtos: buscarProdutos,
    vendas: buscarVendas,
    gastos: buscarGastos,
    perdas: buscarPerdas,
    producao: buscarProducao,
    plantio: buscarPlantio,
    clientes: buscarClientes
};

function temFiltro(filtros) {
    return Boolean(filtros.q || filtros.inicio || filtros.fim || filtros.categoria);
}

async function buscar(idUsuario, filtros = {}) {
    if (!temFiltro(filtros)) {
        return {
            grupos: [],
            filtrou: false,
            aviso: "Informe uma categoria, um termo de busca ou um período para consultar."
        };
    }

    const categoria = String(filtros.categoria || "").trim();

    if (categoria) {
        const buscador = BUSCADORES[categoria];

        if (!buscador) {
            return {
                grupos: [],
                filtrou: true,
                aviso: "Categoria de consulta inválida."
            };
        }

        const resultado = await buscador(idUsuario, filtros);

        return {
            grupos: [resultado],
            filtrou: true,
            aviso: resultado.registros.length === 0 ? "Nenhum registro encontrado para os filtros informados." : null
        };
    }

    const grupos = await Promise.all(
        Object.values(BUSCADORES).map((buscador) => buscador(idUsuario, filtros))
    );

    const comRegistros = grupos.filter((item) => item.registros.length > 0);

    return {
        grupos: comRegistros,
        filtrou: true,
        aviso: comRegistros.length === 0 ? "Nenhum registro encontrado para os filtros informados." : null
    };
}

module.exports = {
    CATEGORIAS: Object.keys(BUSCADORES),
    buscar
};
