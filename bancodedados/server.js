const express = require('express');
const conexao = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Rural Tech funcionando!');
});

app.get('/relatorio/producao', (req, res) => {
    const sql = `
        SELECT 
            p.nome AS produto,
            pr.quantidade,
            pr.data_producao
        FROM producao pr
        INNER JOIN produtos p
            ON pr.id_produto = p.id_produto
        ORDER BY pr.data_producao DESC
    `;

    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({
                erro: 'Erro ao buscar produção'
            });
        }

        res.json(resultado);
    });
});

app.get('/relatorio/vendas', (req, res) => {
    const sql = `
        SELECT 
            p.nome AS produto,
            v.quantidade,
            v.valor_total,
            v.data_venda
        FROM vendas v
        INNER JOIN produtos p
            ON v.id_produto = p.id_produto
        ORDER BY v.data_venda DESC
    `;

    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({
                erro: 'Erro ao buscar vendas'
            });
        }
        res.json(resultado);
    });
});

app.get('/relatorio/gastos', (req, res) => {
    const sql = `
        SELECT 
            descricao,
            valor,
            data_gasto
        FROM gastos
        ORDER BY data_gasto DESC
    `;

    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({
                erro: 'Erro ao buscar gastos'
            });
        }
        res.json(resultado);
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});