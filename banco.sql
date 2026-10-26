-- ===========================================================================
-- RURAL TECH - BANCO DE DADOS
-- ===========================================================================
-- Script completo e IDEMPOTENTE para MySQL 8+ e MariaDB 10.4+.
-- Pode ser executado em uma base vazia ou em uma base já existente:
--   * cria somente o que falta;
--   * adiciona colunas/índices/relacionamentos ausentes;
--   * NÃO remove tabelas, colunas ou registros existentes;
--   * converte tipos antigos (ex.: produtos.estoque INT -> DECIMAL).
--
-- Como executar (XAMPP):
--   C:\xampp\mysql\bin\mysql.exe -u root < banco.sql
--
-- Recomenda-se fazer backup antes:
--   C:\xampp\mysql\bin\mysqldump.exe -u root rural_tech > backup_rural_tech.sql
-- ===========================================================================

CREATE DATABASE IF NOT EXISTS rural_tech
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE rural_tech;

-- ===========================================================================
-- 1. TABELAS BASE
-- ===========================================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(30) DEFAULT NULL,
    notificacoes_sistema TINYINT(1) NOT NULL DEFAULT 1,
    lembretes TINYINT(1) NOT NULL DEFAULT 1,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessoes (
    id_sessao INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expira_em DATETIME NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_sessao),
    UNIQUE KEY uq_sessoes_token (token_hash),
    KEY idx_sessoes_usuario (id_usuario),
    KEY idx_sessoes_expira (expira_em),
    CONSTRAINT fk_sessoes_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(30) DEFAULT NULL,
    email VARCHAR(150) DEFAULT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cliente),
    UNIQUE KEY uq_clientes_usuario_nome (id_usuario, nome),
    KEY idx_clientes_usuario (id_usuario),
    CONSTRAINT fk_clientes_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produtos (
    id_produto INT NOT NULL AUTO_INCREMENT,
    id_usuario INT DEFAULT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) DEFAULT NULL,
    unidade VARCHAR(30) NOT NULL DEFAULT 'kg',
    preco DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    estoque DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    categoria VARCHAR(100) NOT NULL DEFAULT 'Outros',
    imagem MEDIUMTEXT DEFAULT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_produto),
    KEY idx_produtos_usuario (id_usuario),
    KEY idx_produtos_ativo (ativo),
    KEY idx_produtos_categoria (categoria),
    CONSTRAINT fk_produtos_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendas (
    id_venda INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    id_cliente INT DEFAULT NULL,
    quantidade DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    preco_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    unidade VARCHAR(30) NOT NULL DEFAULT 'kg',
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    forma_pagamento VARCHAR(50) DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    data_venda DATE NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_venda),
    KEY idx_vendas_usuario (id_usuario),
    KEY idx_vendas_produto (id_produto),
    KEY idx_vendas_cliente (id_cliente),
    KEY idx_vendas_data (data_venda),
    CONSTRAINT fk_vendas_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_vendas_produto
        FOREIGN KEY (id_produto) REFERENCES produtos (id_produto)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_vendas_cliente
        FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gastos (
    id_gasto INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    data_gasto DATE NOT NULL,
    categoria VARCHAR(100) DEFAULT NULL,
    forma_pagamento VARCHAR(50) DEFAULT NULL,
    fornecedor VARCHAR(150) DEFAULT NULL,
    classificacao VARCHAR(50) DEFAULT NULL,
    observacao TEXT DEFAULT NULL,
    comprovante MEDIUMTEXT DEFAULT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_gasto),
    KEY idx_gastos_usuario (id_usuario),
    KEY idx_gastos_data (data_gasto),
    KEY idx_gastos_categoria (categoria),
    CONSTRAINT fk_gastos_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS perdas (
    id_perda INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    unidade VARCHAR(30) NOT NULL DEFAULT 'kg',
    motivo VARCHAR(100) NOT NULL,
    local_perda VARCHAR(150) DEFAULT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    valor_estimado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    data_perda DATE NOT NULL,
    observacoes TEXT DEFAULT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_perda),
    KEY idx_perdas_usuario (id_usuario),
    KEY idx_perdas_produto (id_produto),
    KEY idx_perdas_data (data_perda),
    KEY idx_perdas_motivo (motivo),
    CONSTRAINT fk_perdas_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_perdas_produto
        FOREIGN KEY (id_produto) REFERENCES produtos (id_produto)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS producao (
    id_producao INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    peso DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    data_plantio DATE DEFAULT NULL,
    data_producao DATE NOT NULL,
    observacoes TEXT DEFAULT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_producao),
    KEY idx_producao_usuario (id_usuario),
    KEY idx_producao_produto (id_produto),
    KEY idx_producao_data (data_producao),
    CONSTRAINT fk_producao_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_producao_produto
        FOREIGN KEY (id_produto) REFERENCES produtos (id_produto)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS plantio (
    id_plantio INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    cultura VARCHAR(150) NOT NULL,
    area VARCHAR(150) NOT NULL,
    data_plantio DATE NOT NULL,
    status ENUM('germinacao', 'crescimento', 'colheita') NOT NULL DEFAULT 'germinacao',
    observacoes TEXT DEFAULT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_plantio),
    KEY idx_plantio_usuario (id_usuario),
    KEY idx_plantio_data (data_plantio),
    KEY idx_plantio_status (status),
    CONSTRAINT fk_plantio_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- 2. MIGRAÇÕES NÃO DESTRUTIVAS
-- ===========================================================================
-- Procedures auxiliares: só alteram quando o objeto ainda não existe.
-- Compatível com MySQL 8 (que não aceita ADD COLUMN IF NOT EXISTS) e MariaDB.
-- ===========================================================================

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DROP PROCEDURE IF EXISTS add_fk_if_not_exists;

DELIMITER $$

CREATE PROCEDURE add_column_if_not_exists(
    IN p_tabela VARCHAR(64),
    IN p_coluna VARCHAR(64),
    IN p_definicao TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_tabela
          AND COLUMN_NAME = p_coluna
    ) THEN
        SET @sql_migracao = CONCAT(
            'ALTER TABLE `', p_tabela, '` ADD COLUMN `', p_coluna, '` ', p_definicao
        );
        PREPARE stmt_migracao FROM @sql_migracao;
        EXECUTE stmt_migracao;
        DEALLOCATE PREPARE stmt_migracao;
    END IF;
END$$

CREATE PROCEDURE add_index_if_not_exists(
    IN p_tabela VARCHAR(64),
    IN p_indice VARCHAR(64),
    IN p_definicao TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_tabela
          AND INDEX_NAME = p_indice
    ) THEN
        SET @sql_migracao = CONCAT(
            'ALTER TABLE `', p_tabela, '` ADD ', p_definicao
        );
        PREPARE stmt_migracao FROM @sql_migracao;
        EXECUTE stmt_migracao;
        DEALLOCATE PREPARE stmt_migracao;
    END IF;
END$$

CREATE PROCEDURE add_fk_if_not_exists(
    IN p_tabela VARCHAR(64),
    IN p_nome VARCHAR(64),
    IN p_coluna VARCHAR(64),
    IN p_referencia VARCHAR(64),
    IN p_coluna_ref VARCHAR(64),
    IN p_acao_delete VARCHAR(20)
)
BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_tabela
          AND COLUMN_NAME = p_coluna
          AND REFERENCED_TABLE_NAME IS NOT NULL
    ) THEN
        SET @sql_migracao = CONCAT(
            'ALTER TABLE `', p_tabela, '` ADD CONSTRAINT `', p_nome,
            '` FOREIGN KEY (`', p_coluna, '`) REFERENCES `', p_referencia,
            '` (`', p_coluna_ref, '`) ON DELETE ', p_acao_delete,
            ' ON UPDATE CASCADE'
        );
        PREPARE stmt_migracao FROM @sql_migracao;
        EXECUTE stmt_migracao;
        DEALLOCATE PREPARE stmt_migracao;
    END IF;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------------
-- usuarios
-- ---------------------------------------------------------------------------
CALL add_column_if_not_exists('usuarios', 'telefone', 'VARCHAR(30) DEFAULT NULL');
CALL add_column_if_not_exists('usuarios', 'notificacoes_sistema', 'TINYINT(1) NOT NULL DEFAULT 1');
CALL add_column_if_not_exists('usuarios', 'lembretes', 'TINYINT(1) NOT NULL DEFAULT 1');
CALL add_column_if_not_exists('usuarios', 'criado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('usuarios', 'atualizado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_index_if_not_exists('usuarios', 'uq_usuarios_email', 'UNIQUE KEY `uq_usuarios_email` (`email`)');

-- ---------------------------------------------------------------------------
-- produtos
-- ---------------------------------------------------------------------------
CALL add_column_if_not_exists('produtos', 'id_usuario', 'INT DEFAULT NULL');
CALL add_column_if_not_exists('produtos', 'descricao', 'VARCHAR(255) DEFAULT NULL');
CALL add_column_if_not_exists('produtos', 'unidade', 'VARCHAR(30) NOT NULL DEFAULT ''kg''');
CALL add_column_if_not_exists('produtos', 'preco', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
CALL add_column_if_not_exists('produtos', 'estoque', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
CALL add_column_if_not_exists('produtos', 'categoria', 'VARCHAR(100) NOT NULL DEFAULT ''Outros''');
CALL add_column_if_not_exists('produtos', 'imagem', 'MEDIUMTEXT DEFAULT NULL');
CALL add_column_if_not_exists('produtos', 'ativo', 'TINYINT(1) NOT NULL DEFAULT 1');
CALL add_column_if_not_exists('produtos', 'criado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('produtos', 'atualizado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

ALTER TABLE produtos
    MODIFY COLUMN preco DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    MODIFY COLUMN estoque DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    MODIFY COLUMN unidade VARCHAR(30) NOT NULL DEFAULT 'kg',
    MODIFY COLUMN categoria VARCHAR(100) NOT NULL DEFAULT 'Outros',
    MODIFY COLUMN ativo TINYINT(1) NOT NULL DEFAULT 1;

CALL add_index_if_not_exists('produtos', 'idx_produtos_usuario', 'KEY `idx_produtos_usuario` (`id_usuario`)');
CALL add_index_if_not_exists('produtos', 'idx_produtos_ativo', 'KEY `idx_produtos_ativo` (`ativo`)');
CALL add_index_if_not_exists('produtos', 'idx_produtos_categoria', 'KEY `idx_produtos_categoria` (`categoria`)');

-- ---------------------------------------------------------------------------
-- vendas
-- ---------------------------------------------------------------------------
CALL add_column_if_not_exists('vendas', 'id_cliente', 'INT DEFAULT NULL');
CALL add_column_if_not_exists('vendas', 'preco_unitario', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
CALL add_column_if_not_exists('vendas', 'unidade', 'VARCHAR(30) NOT NULL DEFAULT ''kg''');
CALL add_column_if_not_exists('vendas', 'forma_pagamento', 'VARCHAR(50) DEFAULT NULL');
CALL add_column_if_not_exists('vendas', 'observacoes', 'TEXT DEFAULT NULL');
CALL add_column_if_not_exists('vendas', 'criado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');

ALTER TABLE vendas
    MODIFY COLUMN quantidade DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    MODIFY COLUMN valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00;

CALL add_index_if_not_exists('vendas', 'idx_vendas_usuario', 'KEY `idx_vendas_usuario` (`id_usuario`)');
CALL add_index_if_not_exists('vendas', 'idx_vendas_produto', 'KEY `idx_vendas_produto` (`id_produto`)');
CALL add_index_if_not_exists('vendas', 'idx_vendas_cliente', 'KEY `idx_vendas_cliente` (`id_cliente`)');
CALL add_index_if_not_exists('vendas', 'idx_vendas_data', 'KEY `idx_vendas_data` (`data_venda`)');

-- ---------------------------------------------------------------------------
-- gastos
-- ---------------------------------------------------------------------------
CALL add_column_if_not_exists('gastos', 'categoria', 'VARCHAR(100) DEFAULT NULL');
CALL add_column_if_not_exists('gastos', 'forma_pagamento', 'VARCHAR(50) DEFAULT NULL');
CALL add_column_if_not_exists('gastos', 'fornecedor', 'VARCHAR(150) DEFAULT NULL');
CALL add_column_if_not_exists('gastos', 'classificacao', 'VARCHAR(50) DEFAULT NULL');
CALL add_column_if_not_exists('gastos', 'observacao', 'TEXT DEFAULT NULL');
CALL add_column_if_not_exists('gastos', 'comprovante', 'MEDIUMTEXT DEFAULT NULL');
CALL add_column_if_not_exists('gastos', 'criado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('gastos', 'atualizado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

ALTER TABLE gastos
    MODIFY COLUMN valor DECIMAL(12,2) NOT NULL DEFAULT 0.00;

CALL add_index_if_not_exists('gastos', 'idx_gastos_usuario', 'KEY `idx_gastos_usuario` (`id_usuario`)');
CALL add_index_if_not_exists('gastos', 'idx_gastos_data', 'KEY `idx_gastos_data` (`data_gasto`)');
CALL add_index_if_not_exists('gastos', 'idx_gastos_categoria', 'KEY `idx_gastos_categoria` (`categoria`)');

-- ---------------------------------------------------------------------------
-- perdas
-- ---------------------------------------------------------------------------
CALL add_column_if_not_exists('perdas', 'unidade', 'VARCHAR(30) NOT NULL DEFAULT ''kg''');
CALL add_column_if_not_exists('perdas', 'motivo', 'VARCHAR(100) NOT NULL DEFAULT ''Outros''');
CALL add_column_if_not_exists('perdas', 'local_perda', 'VARCHAR(150) DEFAULT NULL');
CALL add_column_if_not_exists('perdas', 'valor_unitario', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
CALL add_column_if_not_exists('perdas', 'valor_estimado', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
CALL add_column_if_not_exists('perdas', 'observacoes', 'TEXT DEFAULT NULL');
CALL add_column_if_not_exists('perdas', 'criado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');

ALTER TABLE perdas
    MODIFY COLUMN quantidade DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    MODIFY COLUMN valor_unitario DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    MODIFY COLUMN valor_estimado DECIMAL(12,2) NOT NULL DEFAULT 0.00;

CALL add_index_if_not_exists('perdas', 'idx_perdas_usuario', 'KEY `idx_perdas_usuario` (`id_usuario`)');
CALL add_index_if_not_exists('perdas', 'idx_perdas_produto', 'KEY `idx_perdas_produto` (`id_produto`)');
CALL add_index_if_not_exists('perdas', 'idx_perdas_data', 'KEY `idx_perdas_data` (`data_perda`)');
CALL add_index_if_not_exists('perdas', 'idx_perdas_motivo', 'KEY `idx_perdas_motivo` (`motivo`)');

-- ---------------------------------------------------------------------------
-- producao (colheita)
-- ---------------------------------------------------------------------------
CALL add_column_if_not_exists('producao', 'quantidade', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
CALL add_column_if_not_exists('producao', 'peso', 'DECIMAL(12,2) NOT NULL DEFAULT 0.00');
CALL add_column_if_not_exists('producao', 'data_plantio', 'DATE DEFAULT NULL');
CALL add_column_if_not_exists('producao', 'data_producao', 'DATE NULL');
CALL add_column_if_not_exists('producao', 'observacoes', 'TEXT DEFAULT NULL');
CALL add_column_if_not_exists('producao', 'criado_em', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');

ALTER TABLE producao
    MODIFY COLUMN quantidade DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    MODIFY COLUMN peso DECIMAL(12,2) NOT NULL DEFAULT 0.00;

CALL add_index_if_not_exists('producao', 'idx_producao_usuario', 'KEY `idx_producao_usuario` (`id_usuario`)');
CALL add_index_if_not_exists('producao', 'idx_producao_produto', 'KEY `idx_producao_produto` (`id_produto`)');
CALL add_index_if_not_exists('producao', 'idx_producao_data', 'KEY `idx_producao_data` (`data_producao`)');

-- ---------------------------------------------------------------------------
-- Normalização de dados legados (não remove nada)
-- ---------------------------------------------------------------------------
-- Produtos antigos passam a pertencer ao usuário mais antigo da base.
SET @usuario_padrao = (SELECT MIN(id_usuario) FROM usuarios);

UPDATE produtos
SET id_usuario = @usuario_padrao
WHERE id_usuario IS NULL
  AND @usuario_padrao IS NOT NULL;

UPDATE produtos SET descricao = NULL WHERE descricao = '';
UPDATE produtos SET unidade = 'kg' WHERE unidade IS NULL OR unidade = '';
UPDATE produtos SET categoria = 'Outros' WHERE categoria IS NULL OR categoria = '';
UPDATE produtos SET preco = 0 WHERE preco IS NULL;
UPDATE produtos SET estoque = 0 WHERE estoque IS NULL;
UPDATE produtos SET ativo = 1 WHERE ativo IS NULL;

UPDATE vendas SET unidade = 'kg' WHERE unidade IS NULL OR unidade = '';

UPDATE vendas v
INNER JOIN produtos p ON p.id_produto = v.id_produto
SET v.unidade = p.unidade
WHERE v.unidade = 'kg' AND p.unidade IS NOT NULL AND p.unidade <> '';

UPDATE vendas
SET preco_unitario = ROUND(valor_total / NULLIF(quantidade, 0), 2)
WHERE (preco_unitario IS NULL OR preco_unitario = 0)
  AND quantidade IS NOT NULL
  AND quantidade > 0
  AND valor_total IS NOT NULL;

UPDATE perdas
SET valor_unitario = ROUND(valor_estimado / NULLIF(quantidade, 0), 2)
WHERE (valor_unitario IS NULL OR valor_unitario = 0)
  AND quantidade IS NOT NULL
  AND quantidade > 0
  AND valor_estimado IS NOT NULL;

UPDATE perdas
SET valor_estimado = ROUND(quantidade * valor_unitario, 2)
WHERE (valor_estimado IS NULL OR valor_estimado = 0)
  AND quantidade IS NOT NULL
  AND valor_unitario IS NOT NULL
  AND valor_unitario > 0;

UPDATE producao SET peso = 0 WHERE peso IS NULL;
UPDATE producao SET data_producao = DATE(criado_em) WHERE data_producao IS NULL AND criado_em IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Relacionamentos (criados apenas se ainda não existirem)
-- ---------------------------------------------------------------------------
CALL add_fk_if_not_exists('produtos', 'fk_produtos_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');
CALL add_fk_if_not_exists('vendas', 'fk_vendas_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');
CALL add_fk_if_not_exists('vendas', 'fk_vendas_produto', 'id_produto', 'produtos', 'id_produto', 'RESTRICT');
CALL add_fk_if_not_exists('vendas', 'fk_vendas_cliente', 'id_cliente', 'clientes', 'id_cliente', 'SET NULL');
CALL add_fk_if_not_exists('gastos', 'fk_gastos_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');
CALL add_fk_if_not_exists('perdas', 'fk_perdas_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');
CALL add_fk_if_not_exists('perdas', 'fk_perdas_produto', 'id_produto', 'produtos', 'id_produto', 'RESTRICT');
CALL add_fk_if_not_exists('producao', 'fk_producao_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');
CALL add_fk_if_not_exists('producao', 'fk_producao_produto', 'id_produto', 'produtos', 'id_produto', 'RESTRICT');
CALL add_fk_if_not_exists('plantio', 'fk_plantio_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');
CALL add_fk_if_not_exists('sessoes', 'fk_sessoes_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');
CALL add_fk_if_not_exists('clientes', 'fk_clientes_usuario', 'id_usuario', 'usuarios', 'id_usuario', 'CASCADE');

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DROP PROCEDURE IF EXISTS add_fk_if_not_exists;

-- ===========================================================================
-- 3. DADOS INICIAIS (OPCIONAL)
-- ===========================================================================
-- Não criamos usuário/senha padrão por segurança. Cadastre-se pela tela
-- "Criar conta" ou use: npm run criar-usuario -- "Nome" "email@exemplo.com" "Senha123"
--
-- Para migrar senhas legadas em texto puro para hash scrypt:
--   npm run migrar-senhas
-- ===========================================================================
