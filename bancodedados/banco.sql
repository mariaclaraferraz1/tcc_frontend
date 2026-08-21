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

CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
)

CREATE TABLE Produtos (
    id_produtos INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30),
    
)