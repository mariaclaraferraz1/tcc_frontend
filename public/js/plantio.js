const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

let listaPlantacoes = [
    { cultura: 'Milho Híbrido', area: 'Talhão 02', dataPlantio: '2026-08-12', status: 'crescimento' },
    { cultura: 'Soja Transgênica', area: 'Talhão 05', dataPlantio: '2026-05-05', status: 'colheita' }
];

app.get('/plantio', (req, res) => {
    res.render('plantio', { plantacoes: listaPlantacoes });
});

app.post('/plantio', (req, res) => {
    const { cultura, area, dataPlantio, status } = req.body;

    const novoPlantio = {
        cultura: cultura,
        area: area,
        dataPlantio: dataPlantio,
        status: status
    };

    listaPlantacoes.push(novoPlantio);
    res.redirect('/plantio');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Rural Tech rodando em http://localhost:${PORT}/plantio`);
});