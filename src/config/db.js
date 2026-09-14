const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rural_tech'
});

conexao.connect((erro) => {
    if (erro) {
        console.log('Erro completo ao conectar:', erro);
        return;
    }

    console.log('Banco de dados conectado com sucesso!');
});

module.exports = conexao;