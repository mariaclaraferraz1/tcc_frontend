const express = require('express');
const conexao = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Rural Tech funcionando!');
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});