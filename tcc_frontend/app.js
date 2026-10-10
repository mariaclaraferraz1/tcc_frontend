const express = require("express");
const path = require("path");
const conexao = require("./src/config/db");
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

// ==========================================
// LOGIN
// ==========================================

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;

    if (!email || !senha) {
        return res.send("Digite o e-mail e a senha.");
    }

    const sql = `
        SELECT id_usuario, nome, email
        FROM usuarios
        WHERE email = ? AND senha = ?
    `;

    conexao.query(sql, [email, senha], (erro, resultados) => {
        if (erro) {
            console.log("Erro ao fazer login:", erro);
            return res.status(500).send("Erro ao consultar o banco de dados.");
        }

        if (resultados.length === 0) {
            return res.send("E-mail ou senha incorretos.");
        }

        const usuario = resultados[0];

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome
        };

        console.log("Login realizado com sucesso!");
        console.log("Usuário:", usuario.nome);

        res.redirect("/inicio");
    });
});

// ==========================================
// CRIAR CONTA
// ==========================================

app.get("/criar-conta", (req, res) => {
    res.render("criar_conta");
});

app.post("/criar-conta", (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;

    if (!nome || !email || !senha) {
        return res.send("Preencha todos os campos do cadastro.");
    }

    const sql = `
        INSERT INTO usuarios (nome, email, senha)
        VALUES (?, ?, ?)
    `;

    conexao.query(sql, [nome, email, senha], (erro, resultado) => {
        if (erro) {
            console.log("Erro ao cadastrar usuário:", erro);

            if (erro.code === "ER_DUP_ENTRY") {
                return res.send("Este e-mail já está cadastrado.");
            }

            return res.status(500).send("Erro ao cadastrar usuário.");
        }

        req.session.usuario = {
            id_usuario: resultado.insertId,
            nome: nome
        };

        res.redirect("/inicio");
    });
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

app.get("/inicio", (req, res) => {
    res.render("inicio");
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

app.get("/controle-de-gastos", (req, res) => {
    res.render("controle_de_gastos");
});

app.get("/dados-colheita", (req, res) => {
    res.render("dados_colheita");
});

app.get("/editar-perfil", (req, res) => {
    res.render("editar_perfil");
});

app.get("/perdas", (req, res) => {
    res.render("perdas");
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
// LISTA DE VENDAS
// ==========================================

app.get("/registrar-vendas", (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const sql = `
        SELECT
            v.id_venda,
            v.cliente,
            v.quantidade,
            v.unidade,
            v.valor_total,
            v.data_venda,
            p.nome AS produto
        FROM vendas v
        INNER JOIN produtos p
            ON v.id_produto = p.id_produto
        WHERE v.id_usuario = ?
        ORDER BY v.data_venda DESC, v.id_venda DESC
    `;

    conexao.query(
        sql,
        [req.session.usuario.id_usuario],
        (erro, vendas) => {
            if (erro) {
                console.log("Erro ao carregar vendas:", erro);
                return res.status(500).send(
                    "Não foi possível carregar as vendas. Confira as colunas da tabela vendas."
                );
            }

            res.render("registrar_vendas", {
                vendas: vendas,
                mensagem: req.query.mensagem || ""
            });
        }
    );
});

// ==========================================
// FORMULÁRIO DE NOVA VENDA
// ==========================================

app.get("/vendas", (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const sql = `
        SELECT id_produto, nome, unidade, preco
        FROM produtos
        ORDER BY nome
    `;

    conexao.query(sql, (erro, produtos) => {
        if (erro) {
            console.log("Erro ao carregar produtos:", erro);
            return res.status(500).send(
                "Não foi possível carregar os produtos."
            );
        }

        res.render("vendas", {
            produtos: produtos
        });
    });
});

// ==========================================
// SALVAR NOVA VENDA
// ==========================================

app.post("/vendas", (req, res) => {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

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

    const id_usuario = req.session.usuario.id_usuario;
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
        return res.status(400).send(
            "Confira os campos da venda e tente novamente."
        );
    }

    const valor_total = Number((qtd * preco).toFixed(2));

    const sql = `
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
    `;

    const valores = [
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
    ];

    conexao.query(sql, valores, (erro) => {
        if (erro) {
            console.log("Erro ao salvar venda:", erro);
            return res.status(500).send(
                "Não foi possível salvar a venda. Confira as colunas da tabela vendas."
            );
        }

        res.redirect(
            "/registrar-vendas?mensagem=" +
            encodeURIComponent("Venda cadastrada com sucesso!")
        );
    });
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
    console.log("Servidor rodando em http://localhost:3000");
});
