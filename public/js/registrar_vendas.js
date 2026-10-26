document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("form-venda");

    if (!formulario) {
        return;
    }

    const selectProduto = document.getElementById("idProduto");
    const quantidade = document.getElementById("quantidade");
    const unidade = document.getElementById("unidade-venda");
    const preco = document.getElementById("preco-venda");
    const total = document.getElementById("valor-total");

    if (!selectProduto || !quantidade || !unidade || !preco || !total) {
        return;
    }

    function numero(valor) {
        const convertido = Number(valor);

        return Number.isFinite(convertido) ? convertido : 0;
    }

    function moeda(valor) {
        return numero(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function opcaoSelecionada() {
        return selectProduto.options[selectProduto.selectedIndex];
    }

    function atualizarProduto() {
        const opcao = opcaoSelecionada();

        if (!opcao || !opcao.value) {
            unidade.value = "";
            preco.value = "";
            calcularTotal();
            return;
        }

        unidade.value = opcao.getAttribute("data-unidade") || "";
        preco.value = moeda(opcao.getAttribute("data-preco") || 0);
        calcularTotal();
    }

    function calcularTotal() {
        const opcao = opcaoSelecionada();
        const valorUnitario = opcao && opcao.value
            ? numero(opcao.getAttribute("data-preco"))
            : 0;
        const qtd = numero(quantidade.value);
        const resultado = qtd * valorUnitario;

        total.value = moeda(resultado);
    }

    selectProduto.addEventListener("change", atualizarProduto);
    quantidade.addEventListener("input", calcularTotal);

    formulario.addEventListener("submit", function (evento) {
        if (!selectProduto.value) {
            evento.preventDefault();
            window.alert("Selecione o produto da venda.");
            selectProduto.focus();
            return;
        }

        if (!quantidade.value || numero(quantidade.value) <= 0) {
            evento.preventDefault();
            window.alert("Informe uma quantidade maior que zero.");
            quantidade.focus();
        }
    });

    atualizarProduto();
});
