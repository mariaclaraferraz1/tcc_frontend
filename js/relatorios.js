const tipoRelatorio = document.getElementById('tipoRelatorio');
const dataInicial = document.getElementById('dataInicial');
const dataFinal = document.getElementById('dataFinal');
const btnGerar = document.getElementById('btnGerar');
const areaRelatorio = document.getElementById('areaRelatorio');

btnGerar.addEventListener('click', async () => {

    const tipo = tipoRelatorio.value;

    if (tipo === '') {
        alert('Selecione um tipo de relatório.');
        return;
    }

    let url = '';

    if (tipo === 'producao') {
        url = 'http://localhost:3000/relatorio/producao';
    }

    if (tipo === 'vendas') {
        url = 'http://localhost:3000/relatorio/vendas';
    }

    if (tipo === 'gastos') {
        url = 'http://localhost:3000/relatorio/gastos';
    }

    if (tipo === 'produtos') {
        alert('Relatório de produtos ainda não disponível.');
        return;
    }

    try {

        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (dados.length === 0) {
            areaRelatorio.innerHTML = `
                <div class="icone-relatorio">
                    <i class="fa-solid fa-file-circle-xmark"></i>
                </div>

                <h2>Nenhum dado encontrado</h2>

                <p>
                    Não existem dados cadastrados para este relatório.
                </p>
            `;

            return;
        }

        let conteudo = '';

        if (tipo === 'producao') {

            conteudo = `
                <h2>Relatório de Produção</h2>

                ${dados.map(item => `
                    <div class="resultado">
                        <strong>${item.produto}</strong>
                        <span>Quantidade: ${item.quantidade}</span>
                        <span>Data: ${item.data_producao}</span>
                    </div>
                `).join('')}
            `;
        }

        if (tipo === 'vendas') {

            conteudo = `
                <h2>Relatório de Vendas</h2>

                ${dados.map(item => `
                    <div class="resultado">
                        <strong>${item.produto}</strong>
                        <span>Quantidade: ${item.quantidade}</span>
                        <span>Valor: R$ ${item.valor_total}</span>
                        <span>Data: ${item.data_venda}</span>
                    </div>
                `).join('')}
            `;
        }

        if (tipo === 'gastos') {

            conteudo = `
                <h2>Relatório de Gastos</h2>

                ${dados.map(item => `
                    <div class="resultado">
                        <strong>${item.descricao}</strong>
                        <span>Valor: R$ ${item.valor}</span>
                        <span>Data: ${item.data_gasto}</span>
                    </div>
                `).join('')}
            `;
        }

        areaRelatorio.innerHTML = conteudo;

    } catch (erro) {

        console.log(erro);

        areaRelatorio.innerHTML = `
            <div class="icone-relatorio">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h2>Erro ao gerar relatório</h2>

            <p>
                Não foi possível conectar ao servidor.
            </p>
        `;
    }
});