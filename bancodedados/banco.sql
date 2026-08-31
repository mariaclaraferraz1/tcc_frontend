/*
============Tabelas============
>usuários
>produtos
>produção
>vendas
>gastos
*/
CREATE DATABASE rural_tech;

USE rural_tech;

-- =========================
-- TABELA: USUÁRIOS
-- =========================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- =========================
-- TABELA: PRODUTOS
-- =========================
CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    unidade VARCHAR(30),
    preco DECIMAL(10,2),
    estoque INT DEFAULT 0
);

-- =========================
-- TABELA: PRODUÇÃO
-- =========================
CREATE TABLE producao (
    id_producao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    data_producao DATE NOT NULL,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_produto)
        REFERENCES produtos(id_produto)
);

-- =========================
-- TABELA: VENDAS
-- =========================
CREATE TABLE vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    data_venda DATE NOT NULL,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_produto)
        REFERENCES produtos(id_produto)
);

-- =========================
-- TABELA: GASTOS
-- =========================
CREATE TABLE gastos (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_gasto DATE NOT NULL,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);

USE rural_tech
-- =========================
-- SELECT -- RELATORIOS 
-- =========================
-- PRODUÇÃO
SELECT 
    p.nome AS produto,
    pr.quantidade,
    pr.data_producao
FROM producao pr
INNER JOIN produtos p
    ON pr.id_produto = p.id_produto
ORDER BY pr.data_producao DESC;

--VENDAS
SELECT 
    p.nome AS produto,
    v.quantidade,
    v.valor_total,
    v.data_venda
FROM vendas v
INNER JOIN produtos p
    ON v.id_produto = p.id_produto
ORDER BY v.data_venda DESC;

--GASTOS
SELECT 
    descricao,
    valor,
    data_gasto
FROM gastos
ORDER BY data_gasto DESC;
