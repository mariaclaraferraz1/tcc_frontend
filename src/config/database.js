// Camada de dados com 2 modos (independe de src/config/db.js,
/// que continua sendo a conexão MySQL original do projeto):
// - Padrão (neste PC, sem MySQL): banco em ARQUIVO (data/database.sqlite).
// - No outro PC com MySQL: importe o banco.sql e rode com:
//     PowerShell:  $env:USE_MYSQL='1'; node app.js
//     CMD:         set USE_MYSQL=1 && node app.js
//   (opcional: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
const USE_MYSQL = process.env.USE_MYSQL === "1";

let all;
let get;
let run;

if (USE_MYSQL) {
    const mysql = require("mysql2/promise");

    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "rural_tech",
        waitForConnections: true,
        connectionLimit: 10
    });

    const SCHEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    unidade VARCHAR(30),
    preco DECIMAL(10,2),
    estoque INT DEFAULT 0
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS producao (
    id_producao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    data_producao DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    cliente VARCHAR(150),
    quantidade DECIMAL(10,2) NOT NULL,
    unidade VARCHAR(30) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    data_venda DATE NOT NULL,
    forma_pagamento VARCHAR(30) NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS gastos (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(60),
    valor DECIMAL(10,2) NOT NULL,
    data_gasto DATE NOT NULL,
    forma_pagamento VARCHAR(40),
    fornecedor VARCHAR(150),
    area VARCHAR(30),
    observacao TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS perdas (
    id_perda INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT,
    produto VARCHAR(100) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    unidade VARCHAR(30) NOT NULL,
    motivo VARCHAR(60) NOT NULL,
    local_perda VARCHAR(150),
    valor_estimado DECIMAL(10,2) NOT NULL DEFAULT 0,
    data_perda DATE NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
) ENGINE=InnoDB;
`;

    // Cria as tabelas e o seed mínimo (sem derrubar o app se o MySQL falhar).
    const ready = (async () => {
        const conn = await pool.getConnection();
        try {
            for (const stmt of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
                await conn.query(stmt);
            }
            await conn.query(
                "INSERT IGNORE INTO usuarios (id_usuario, nome, email, senha) VALUES (1, 'Usuário Demonstração', 'demo@ruraltech.com', '123456')"
            );
            await conn.query(
                `INSERT IGNORE INTO produtos (id_produto, nome, descricao, unidade, preco, estoque) VALUES
                (1, 'Leite Bovina B', 'Leite in natura resfriado', 'Litro', 2.50, 500),
                (2, 'Queijo Frescal', 'Queijo minas frescal artesanal', 'Kg', 28.00, 40),
                (3, 'Milho Verde', 'Espigas de milho verde para consumo', 'Saca 20kg', 45.00, 15),
                (4, 'Soja', 'Soja em grãos', 'Saca 60kg', 150.00, 20),
                (5, 'Café', 'Café beneficiado', 'Saca 60kg', 800.00, 10),
                (6, 'Feijão', 'Feijão carioca', 'Saca 60kg', 320.00, 12)`
            );
            console.log("MySQL pronto (banco verificado).");
        } finally {
            conn.release();
        }
    })().catch((erro) => {
        console.log("Aviso: não foi possível preparar o MySQL:", erro.message);
    });

    all = async (sql, params = []) => {
        await ready;
        const [rows] = await pool.execute(sql, params);
        return rows;
    };
    get = async (sql, params = []) => {
        const rows = await all(sql, params);
        return rows[0];
    };
    run = async (sql, params = []) => {
        await ready;
        const [res] = await pool.execute(sql, params);
        return {
            lastInsertRowid: Number(res.insertId || 0),
            changes: Number(res.affectedRows || 0)
        };
    };
} else {
    // Modo arquivo (sem MySQL): SQLite em data/database.sqlite.
    const path = require("path");
    const fs = require("fs");
    const { DatabaseSync } = require("node:sqlite");

    const dataDir = path.join(__dirname, "..", "..", "data");
    fs.mkdirSync(dataDir, { recursive: true });

    const sqlite = new DatabaseSync(path.join(dataDir, "database.sqlite"));

    sqlite.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS produtos (
    id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    unidade TEXT,
    preco REAL,
    estoque INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS producao (
    id_producao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    quantidade REAL NOT NULL,
    data_producao TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

CREATE TABLE IF NOT EXISTS vendas (
    id_venda INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    cliente TEXT,
    quantidade REAL NOT NULL,
    unidade TEXT NOT NULL,
    valor_unitario REAL NOT NULL,
    valor_total REAL NOT NULL,
    data_venda TEXT NOT NULL,
    forma_pagamento TEXT NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

CREATE TABLE IF NOT EXISTS gastos (
    id_gasto INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT,
    valor REAL NOT NULL,
    data_gasto TEXT NOT NULL,
    forma_pagamento TEXT,
    fornecedor TEXT,
    area TEXT,
    observacao TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS perdas (
    id_perda INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_produto INTEGER,
    produto TEXT NOT NULL,
    quantidade REAL NOT NULL,
    unidade TEXT NOT NULL,
    motivo TEXT NOT NULL,
    local_perda TEXT,
    valor_estimado REAL NOT NULL DEFAULT 0,
    data_perda TEXT NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);
`);

    if (sqlite.prepare("SELECT COUNT(*) AS total FROM usuarios").get().total === 0) {
        sqlite.prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)").run(
            "Usuário Demonstração",
            "demo@ruraltech.com",
            "123456"
        );
    }

    if (sqlite.prepare("SELECT COUNT(*) AS total FROM produtos").get().total === 0) {
        const inserir = sqlite.prepare(
            "INSERT INTO produtos (nome, descricao, unidade, preco, estoque) VALUES (?, ?, ?, ?, ?)"
        );
        inserir.run("Leite Bovina B", "Leite in natura resfriado", "Litro", 2.5, 500);
        inserir.run("Queijo Frescal", "Queijo minas frescal artesanal", "Kg", 28.0, 40);
        inserir.run("Milho Verde", "Espigas de milho verde para consumo", "Saca 20kg", 45.0, 15);
        inserir.run("Soja", "Soja em grãos", "Saca 60kg", 150.0, 20);
        inserir.run("Café", "Café beneficiado", "Saca 60kg", 800.0, 10);
        inserir.run("Feijão", "Feijão carioca", "Saca 60kg", 320.0, 12);
    }

    all = async (sql, params = []) => sqlite.prepare(sql).all(...params);
    get = async (sql, params = []) => sqlite.prepare(sql).get(...params);
    run = async (sql, params = []) => {
        const info = sqlite.prepare(sql).run(...params);
        return {
            lastInsertRowid: Number(info.lastInsertRowid),
            changes: Number(info.changes)
        };
    };
}

module.exports = { all, get, run, USE_MYSQL };
