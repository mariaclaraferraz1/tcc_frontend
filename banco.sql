-- =====================================================================
-- Rural Tech — banco MySQL
-- Como importar no outro PC (MySQL Workbench ou phpMyAdmin):
--   1. Abra o MySQL Workbench e conecte no servidor.
--   2. File > Open SQL Script > selecione este banco.sql > Execute (raio).
--   Ou no phpMyAdmin: selecione o servidor > aba "Importar" > envie o arquivo.
-- Isso cria o banco `rural_tech` com TODAS as tabelas + dados de exemplo.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS rural_tech
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rural_tech;

-- =========================
-- TABELA: USUÁRIOS
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- =========================
-- TABELA: PRODUTOS
-- =========================
CREATE TABLE IF NOT EXISTS produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    unidade VARCHAR(30),
    preco DECIMAL(10,2),
    estoque INT DEFAULT 0
) ENGINE=InnoDB;

-- =========================
-- TABELA: PRODUÇÃO
-- =========================
CREATE TABLE IF NOT EXISTS producao (
    id_producao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    data_producao DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
) ENGINE=InnoDB;

-- =========================
-- TABELA: VENDAS
-- (colunas usadas pela tela de Vendas: cliente, unidade,
--  valor unitário/total, pagamento e observações)
-- =========================
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

-- =========================
-- TABELA: GASTOS
-- (colunas usadas pela tela de Gastos: categoria, pagamento,
--  fornecedor, área e observação)
-- =========================
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

-- =========================
-- TABELA: PERDAS
-- (usada pela tela de Perdas)
-- =========================
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

-- =====================================================================
-- DADOS DE EXEMPLO (só insere se ainda não existirem)
-- =====================================================================

INSERT IGNORE INTO usuarios (id_usuario, nome, email, senha) VALUES
(1, 'Usuário Demonstração', 'demo@ruraltech.com', '123456');

INSERT IGNORE INTO produtos (id_produto, nome, descricao, unidade, preco, estoque) VALUES
(1, 'Leite Bovina B', 'Leite in natura resfriado', 'Litro', 2.50, 500),
(2, 'Queijo Frescal', 'Queijo minas frescal artesanal', 'Kg', 28.00, 40),
(3, 'Milho Verde', 'Espigas de milho verde para consumo', 'Saca 20kg', 45.00, 15),
(4, 'Soja', 'Soja em grãos', 'Saca 60kg', 150.00, 20),
(5, 'Café', 'Café beneficiado', 'Saca 60kg', 800.00, 10),
(6, 'Feijão', 'Feijão carioca', 'Saca 60kg', 320.00, 12);

INSERT IGNORE INTO producao (id_usuario, id_produto, quantidade, data_producao) VALUES
(1, 1, 250.00, '2026-09-14'),
(1, 1, 260.00, '2026-09-15'),
(1, 2, 15.50, '2026-09-14'),
(1, 2, 12.00, '2026-09-15'),
(1, 3, 5.00, '2026-09-15');

INSERT IGNORE INTO vendas (id_usuario, id_produto, cliente, quantidade, unidade, valor_unitario, valor_total, data_venda, forma_pagamento, observacoes) VALUES
(1, 1, 'João Silva', 200.00, 'Litro', 2.50, 500.00, '2026-09-14', 'Pix', NULL),
(1, 2, 'Maria Santos', 10.00, 'Kg', 28.00, 280.00, '2026-09-15', 'Dinheiro', NULL),
(1, 3, NULL, 2.00, 'Saca 20kg', 45.00, 90.00, '2026-09-15', 'Cartão', NULL);

INSERT IGNORE INTO gastos (id_usuario, descricao, categoria, valor, data_gasto, forma_pagamento, fornecedor, area, observacao) VALUES
(1, 'Ração para gado leiteiro - 5 sacos', 'Alimentação', 450.00, '2026-09-10', 'Pix', NULL, 'Produção', NULL),
(1, 'Embalagens plásticas para queijo', 'Equipamentos', 85.00, '2026-09-12', 'Cartão de Crédito', NULL, 'Produção', NULL),
(1, 'Combustível para o trator', 'Serviços Terceirizados', 200.00, '2026-09-14', 'Dinheiro', NULL, 'Transporte', NULL);

INSERT IGNORE INTO perdas (id_usuario, id_produto, produto, quantidade, unidade, motivo, local_perda, valor_estimado, data_perda, observacoes) VALUES
(1, 3, 'Milho Verde', 5.00, 'KG', 'Seca', 'Talhão 01', 225.00, '2026-09-13', 'Perda parcial pela estiagem');
