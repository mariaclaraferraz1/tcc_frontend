function selectArea(element, val) {
    document.querySelectorAll('.area-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    element.classList.add('active');
    document.getElementById('areaSelecionada').value = val;
}

document.getElementById('gastoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const descricao = document.getElementById('descricao').value;
    const categoria = document.getElementById('categoria').value;
    const data = document.getElementById('dataGasto').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const pagamento = document.getElementById('formaPagamento').value;

    const dataFormatada = data.split('-').reverse().join('/');
    const valorFormatado = valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const linha = document.createElement('tr');

    linha.innerHTML =
        '<td>' + descricao + '</td>' +
        '<td>' + categoria + '</td>' +
        '<td>' + dataFormatada + '</td>' +
        '<td>' + valorFormatado + '</td>' +
        '<td>' + pagamento + '</td>';

    document.querySelector('.table-container tbody').prepend(linha);

    this.reset();

    document.querySelectorAll('.area-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById('areaSelecionada').value = '';
});