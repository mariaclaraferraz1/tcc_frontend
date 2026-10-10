const express = require("express");
const path = require("path");
const db = require("./src/config/database");
const session = require("express-session");
const app = express();

// ==========================================
// CONFIGURAÇÃO DO EJS
// ==========================================

app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// ==========================================
// ARQUIVOS ESTÁTICOS
// ==========================================

app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// PROCESSAMENTO DE FORMULÁRIOS
// ==========================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "rural-tech-chave-sessao",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));

// Usuário da sessão ou usuário demonstração (id 1, criado pelo seed).
// Garante que as telas funcionem mesmo sem login.
function getUsuarioId(req) {
    if (req.session.usuario && req.session.usuario.id_usuario) {
        return req.session.usuario.id_usuario;
    }
    return 1;
}

// MySQL devolve DATE como objeto Date; o SQLite, como texto.
// Normaliza para "AAAA-MM-DD" para as telas funcionarem nos dois bancos.
function dataISO(valor) {
    if (!valor) return valor;
    if (valor instanceof Date) return valor.toISOString().slice(0, 10);
    return String(valor).slice(0, 10);
}

// ==========================================
// LOGIN
// ==========================================

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;

    if (!email || !senha) {
        return res.send("Digite o e-mail e a senha.");
    }

    try {
        const usuario = await db.get(
            "SELECT id_usuario, nome, email FROM usuarios WHERE email = ? AND senha = ?",
            [email, senha]
        );

        if (!usuario) {
            return res.send("E-mail ou senha incorretos.");
        }

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome
        };

        console.log("Login realizado com sucesso!");
        console.log("Usuário:", usuario.nome);

        res.redirect("/inicio");
    } catch (erro) {
        console.log("Erro ao fazer login:", erro);
        res.status(500).send("Erro ao consultar o banco de dados.");
    }
});

// ==========================================
// CRIAR CONTA
// ==========================================

app.get("/criar-conta", (req, res) => {
    res.render("criar_conta");
});

app.post("/criar-conta", async (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;

    if (!nome || !email || !senha) {
        return res.send("Preencha todos os campos do cadastro.");
    }

    try {
        const info = await db.run(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            [nome, email, senha]
        );

        req.session.usuario = {
            id_usuario: Number(info.lastInsertRowid),
            nome: nome
        };

        res.redirect("/inicio");
    } catch (erro) {
        console.log("Erro ao cadastrar usuário:", erro);

        if (String(erro.message).includes("UNIQUE") || erro.code === "ER_DUP_ENTRY") {
            return res.send("Este e-mail já está cadastrado.");
        }

        res.status(500).send("Erro ao cadastrar usuário.");
    }
});

// ==========================================
// ALTERAR SENHA
// ==========================================

app.get("/alterar-senha", (req, res) => {
    res.render("alterar_senha");
});

// ==========================================
// INÍCIO
// ==========================================

app.get("/inicio", async (req, res) => {
    try {
        const id_usuario = getUsuarioId(req);

        const v = await db.get("SELECT COALESCE(SUM(valor_total), 0) AS total, COUNT(*) AS qtd FROM vendas WHERE id_usuario = ?", [id_usuario]);
        const g = await db.get("SELECT COALESCE(SUM(valor), 0) AS total FROM gastos WHERE id_usuario = ?", [id_usuario]);
        const p = await db.get("SELECT COALESCE(SUM(quantidade), 0) AS total FROM producao WHERE id_usuario = ?", [id_usuario]);
        const pr = await db.get("SELECT COUNT(*) AS total FROM produtos");

        const totalVendas = Number(v.total || 0);
        const totalGastos = Number(g.total || 0);

        res.render("inicio", {
            totalProducao: Number(p.total || 0),
            totalProdutos: Number(pr.total || 0),
            totalVendas: totalVendas,
            totalGastos: totalGastos,
            lucro: Number((totalVendas - totalGastos).toFixed(2))
        });
    } catch (erro) {
        console.log("Erro ao carregar resumo do início:", erro);
        res.render("inicio", {
            totalProducao: 0,
            totalProdutos: 0,
            totalVendas: 0,
            totalGastos: 0,
            lucro: 0
        });
    }
});

// ==========================================
// OUTRAS PÁGINAS
// ==========================================

app.get("/cadastro-produto", (req, res) => {
    res.render("cadastro_produto");
});

app.get("/comercial", (req, res) => {
    res.render("comercial");
});

app.get("/configuracoes", (req, res) => {
    res.render("configuracoes");
});

app.get("/consulta", (req, res) => {
    res.render("consulta");
});

app.get("/dados-colheita", (req, res) => {
    res.render("dados_colheita");
});

app.get("/editar-perfil", (req, res) => {
    res.render("editar_perfil");
});

app.get("/producao", (req, res) => {
    res.render("producao");
});

app.get("/produtos", (req, res) => {
    res.render("produtos");
});

app.get("/relatorios", (req, res) => {
    res.render("relatorios");
});

// ==========================================
// VENDAS — LISTA (tela principal de Vendas)
// O botão "Nova venda" fica dentro desta tela.
// ==========================================

app.get("/vendas", async (req, res) => {
    try {
        const vendas = await db.all(`
            SELECT
                v.id_venda,
                v.cliente,
                v.quantidade,
                v.unidade,
                v.valor_unitario,
                v.valor_total,
                v.data_venda,
                v.forma_pagamento,
                p.nome AS produto
            FROM vendas v
            INNER JOIN produtos p
                ON v.id_produto = p.id_produto
            WHERE v.id_usuario = ?
            ORDER BY v.data_venda DESC, v.id_venda DESC
        `, [getUsuarioId(req)]);

        vendas.forEach((v) => { v.data_venda = dataISO(v.data_venda); });

        res.render("vendas", {
            vendas: vendas,
            mensagem: req.query.mensagem || ""
        });
    } catch (erro) {
        console.log("Erro ao carregar vendas:", erro);
        res.status(500).send("Não foi possível carregar as vendas.");
    }
});

// Rota antiga (nomes estavam invertidos): redireciona para a lista atual.
app.get("/registrar-vendas", (req, res) => {
    const qs = req.query.mensagem ? "?mensagem=" + encodeURIComponent(req.query.mensagem) : "";
    res.redirect("/vendas" + qs);
});

// ==========================================
// VENDAS — FORMULÁRIO DE NOVA VENDA
// ==========================================

app.get("/vendas/nova", async (req, res) => {
    try {
        const produtos = await db.all(`
            SELECT id_produto, nome, unidade, preco
            FROM produtos
            ORDER BY nome
        `);

        res.render("venda_form", { produtos: produtos });
    } catch (erro) {
        console.log("Erro ao carregar produtos:", erro);
        res.status(500).send("Não foi possível carregar os produtos.");
    }
});

// ==========================================
// VENDAS — SALVAR
// ==========================================

app.post("/vendas", async (req, res) => {
    const {
        id_produto,
        cliente,
        data_venda,
        quantidade,
        unidade,
        valor_unitario,
        forma_pagamento,
        observacoes
    } = req.body;

    const id_usuario = getUsuarioId(req);
    const idProduto = Number(id_produto);
    const qtd = Number(quantidade);
    const preco = Number(valor_unitario);

    if (
        !idProduto ||
        !data_venda ||
        !unidade ||
        !forma_pagamento ||
        !Number.isFinite(qtd) ||
        qtd <= 0 ||
        !Number.isFinite(preco) ||
        preco < 0
    ) {
        return res.status(400).send("Confira os campos da venda e tente novamente.");
    }

    const valor_total = Number((qtd * preco).toFixed(2));

    try {
        await db.run(`
            INSERT INTO vendas (
                id_usuario,
                id_produto,
                cliente,
                quantidade,
                unidade,
                valor_unitario,
                valor_total,
                data_venda,
                forma_pagamento,
                observacoes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id_usuario,
            idProduto,
            cliente || null,
            qtd,
            unidade,
            preco,
            valor_total,
            data_venda,
            forma_pagamento,
            observacoes || null
        ]);

        res.redirect("/vendas?mensagem=" + encodeURIComponent("Venda cadastrada com sucesso!"));
    } catch (erro) {
        console.log("Erro ao salvar venda:", erro);
        res.status(500).send("Não foi possível salvar a venda.");
    }
});

// ==========================================
// GASTOS — LISTA (visualiza antes de registrar)
// ==========================================

app.get("/gastos", async (req, res) => {
    try {
        const gastos = await db.all(`
            SELECT id_gasto, descricao, categoria, valor, data_gasto,
                   forma_pagamento, fornecedor, area, observacao
            FROM gastos
            WHERE id_usuario = ?
            ORDER BY data_gasto DESC, id_gasto DESC
        `, [getUsuarioId(req)]);

        gastos.forEach((g) => { g.data_gasto = dataISO(g.data_gasto); });

        const total = gastos.reduce((soma, g) => soma + Number(g.valor || 0), 0);

        res.render("gastos", {
            gastos: gastos,
            total: total,
            mensagem: req.query.mensagem || ""
        });
    } catch (erro) {
        console.log("Erro ao carregar gastos:", erro);
        res.status(500).send("Não foi possível carregar os gastos.");
    }
});

// Rota antiga do menu: vai para a lista atual.
app.get("/controle-de-gastos", (req, res) => {
    res.redirect("/gastos");
});

// ==========================================
// GASTOS — FORMULÁRIO
// ==========================================

app.get("/gastos/novo", (req, res) => {
    res.render("gasto_form");
});

// ==========================================
// GASTOS — SALVAR
// ==========================================

app.post("/gastos", async (req, res) => {
    const {
        descricao,
        categoria,
        data_gasto,
        valor,
        forma_pagamento,
        fornecedor,
        area,
        observacao
    } = req.body;

    const valorNum = Number(valor);

    if (!descricao || !data_gasto || !Number.isFinite(valorNum) || valorNum <= 0) {
        return res.status(400).send("Confira os campos do gasto e tente novamente.");
    }

    try {
        await db.run(`
            INSERT INTO gastos (
                id_usuario, descricao, categoria, valor, data_gasto,
                forma_pagamento, fornecedor, area, observacao
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            getUsuarioId(req),
            descricao,
            categoria || null,
            valorNum,
            data_gasto,
            forma_pagamento || null,
            fornecedor || null,
            area || null,
            observacao || null
        ]);

        res.redirect("/gastos?mensagem=" + encodeURIComponent("Gasto cadastrado com sucesso!"));
    } catch (erro) {
        console.log("Erro ao salvar gasto:", erro);
        res.status(500).send("Não foi possível salvar o gasto.");
    }
});

// ==========================================
// PERDAS — LISTA (visualiza antes de registrar)
// ==========================================

app.get("/perdas", async (req, res) => {
    try {
        const perdas = await db.all(`
            SELECT id_perda, produto, quantidade, unidade, motivo,
                   local_perda, valor_estimado, data_perda, observacoes
            FROM perdas
            WHERE id_usuario = ?
            ORDER BY data_perda DESC, id_perda DESC
        `, [getUsuarioId(req)]);

        perdas.forEach((p) => { p.data_perda = dataISO(p.data_perda); });

        const total = perdas.reduce((soma, p) => soma + Number(p.valor_estimado || 0), 0);

        res.render("perdas", {
            perdas: perdas,
            total: total,
            mensagem: req.query.mensagem || ""
        });
    } catch (erro) {
        console.log("Erro ao carregar perdas:", erro);
        res.status(500).send("Não foi possível carregar as perdas.");
    }
});

// ==========================================
// PERDAS — FORMULÁRIO
// ==========================================

app.get("/perdas/nova", async (req, res) => {
    try {
        const produtos = await db.all(`
            SELECT id_produto, nome, unidade
            FROM produtos
            ORDER BY nome
        `);

        res.render("perda_form", { produtos: produtos });
    } catch (erro) {
        console.log("Erro ao carregar produtos:", erro);
        res.status(500).send("Não foi possível carregar os produtos.");
    }
});

// ==========================================
// PERDAS — SALVAR
// ==========================================

app.post("/perdas", async (req, res) => {
    const {
        id_produto,
        produto,
        data_perda,
        quantidade,
        unidade,
        motivo,
        local_perda,
        valor_estimado,
        observacoes
    } = req.body;

    const qtd = Number(quantidade);
    const valor = Number(valor_estimado || 0);

    if (!data_perda || !Number.isFinite(qtd) || qtd <= 0 || !unidade || !motivo) {
        return res.status(400).send("Confira os campos da perda e tente novamente.");
    }

    // Produto pode vir do select (id) ou do nome; garante um nome para exibir.
    let idProduto = id_produto ? Number(id_produto) : null;
    let nomeProduto = (produto || "").trim();
    if (idProduto) {
        try {
            const encontrado = await db.get("SELECT nome FROM produtos WHERE id_produto = ?", [idProduto]);
            if (encontrado) nomeProduto = encontrado.nome;
        } catch (e) { /* mantém o nome digitado */ }
    }
    if (!nomeProduto) {
        return res.status(400).send("Selecione ou informe o produto.");
    }

    if (!Number.isFinite(valor) || valor < 0) {
        return res.status(400).send("Informe um valor estimado válido.");
    }

    try {
        await db.run(`
            INSERT INTO perdas (
                id_usuario, id_produto, produto, quantidade, unidade,
                motivo, local_perda, valor_estimado, data_perda, observacoes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            getUsuarioId(req),
            idProduto,
            nomeProduto,
            qtd,
            unidade,
            motivo,
            local_perda || null,
            valor,
            data_perda,
            observacoes || null
        ]);

        res.redirect("/perdas?mensagem=" + encodeURIComponent("Perda registrada com sucesso!"));
    } catch (erro) {
        console.log("Erro ao salvar perda:", erro);
        res.status(500).send("Não foi possível salvar a perda.");
    }
});

// ==========================================
// LUCROS — cálculo com base em vendas e gastos
// Lucro = total de vendas − total de gastos
// (perdas entram como valor estimado informativo)
// ==========================================

app.get("/lucros", async (req, res) => {
    try {
        const id_usuario = getUsuarioId(req);

        const v = await db.get("SELECT COALESCE(SUM(valor_total), 0) AS total FROM vendas WHERE id_usuario = ?", [id_usuario]);
        const g = await db.get("SELECT COALESCE(SUM(valor), 0) AS total FROM gastos WHERE id_usuario = ?", [id_usuario]);
        const p = await db.get("SELECT COALESCE(SUM(valor_estimado), 0) AS total FROM perdas WHERE id_usuario = ?", [id_usuario]);

        const totalVendas = Number(v.total || 0);
        const totalGastos = Number(g.total || 0);
        const totalPerdas = Number(p.total || 0);
        const lucro = Number((totalVendas - totalGastos).toFixed(2));

        const vendasPorMes = await db.all(`
            SELECT substr(data_venda, 1, 7) AS mes, COALESCE(SUM(valor_total), 0) AS total
            FROM vendas WHERE id_usuario = ?
            GROUP BY mes ORDER BY mes DESC LIMIT 6
        `, [id_usuario]);

        const gastosPorMes = await db.all(`
            SELECT substr(data_gasto, 1, 7) AS mes, COALESCE(SUM(valor), 0) AS total
            FROM gastos WHERE id_usuario = ?
            GROUP BY mes ORDER BY mes DESC LIMIT 6
        `, [id_usuario]);

        res.render("lucros", {
            totalVendas: totalVendas,
            totalGastos: totalGastos,
            totalPerdas: totalPerdas,
            lucro: lucro,
            vendasPorMes: vendasPorMes,
            gastosPorMes: gastosPorMes
        });
    } catch (erro) {
        console.log("Erro ao calcular lucros:", erro);
        res.status(500).send("Não foi possível calcular os lucros.");
    }
});

app.get('/plantio', (req, res) => {
    res.render('plantio', {
        plantacoes: []
    });
});

// ==========================================
// ERRO 404
// ==========================================

app.use((req, res) => {
    res.status(404).send("Página não encontrada!");
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(3000, () => {
    if (db.USE_MYSQL) {
        console.log("Servidor rodando em http://localhost:3000 (MySQL)");
    } else {
        console.log("Servidor rodando em http://localhost:3000");
    }
});
