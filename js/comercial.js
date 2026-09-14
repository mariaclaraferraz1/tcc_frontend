let vendas = [
    {
        cliente: "Mariana",
        produto: "Milho",
        quantidade: 10,
        valor: 500,
        data: "31/08/2026"
    },
    {
        cliente: "João",
        produto: "Soja",
        quantidade: 5,
        valor: 350,
        data: "30/08/2026"
    }
];

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function carregarVendas() {

    const tabela = document.querySelector(".tabela-vendas tbody");

    tabela.innerHTML = "";

    vendas.forEach(function(venda) {

        const linha = document.createElement("tr");

        linha.innerHTML =
            "<td>" + venda.cliente + "</td>" +
            "<td>" + venda.produto + "</td>" +
            "<td>" + venda.quantidade + "</td>" +
            "<td>" + formatarMoeda(venda.valor) + "</td>" +
            "<td>" + venda.data + "</td>";

        tabela.appendChild(linha);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    carregarVendas();
});