document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("form-perda");

    if (!formulario) {
        return;
    }

    const selectProduto = document.getElementById("idProduto");
    const quantidade = document.getElementById("quantidade");
    const unidade = document.getElementById("unidade");
    const valorUnitario = document.getElementById("valorUnitario");
    const valorTotal = document.getElementById("valor-total-perda");

    if (!selectProduto || !quantidade || !unidade || !valorUnitario || !valorTotal) {
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

    function calcularTotal() {
        const total = numero(quantidade.value) * numero(valorUnitario.value);

        valorTotal.value = moeda(total);
    }

    selectProduto.addEventListener("change", function () {
        const opcao = selectProduto.options[selectProduto.selectedIndex];

        if (!opcao || !opcao.value) {
            return;
        }

        const preco = opcao.getAttribute("data-preco");
        const unidadeProduto = opcao.getAttribute("data-unidade");

        if (preco !== null) {
            valorUnitario.value = Number(preco).toFixed(2);
        }

        if (unidadeProduto) {
            const existe = Array.from(unidade.options).some(function (item) {
                return item.value === unidadeProduto;
            });

            if (existe) {
                unidade.value = unidadeProduto;
            }
        }

        calcularTotal();
    });

    quantidade.addEventListener("input", calcularTotal);
    valorUnitario.addEventListener("input", calcularTotal);

    formulario.addEventListener("reset", function () {
        window.setTimeout(function () {
            unidade.value = "kg";
            calcularTotal();
        }, 0);
    });

    formulario.addEventListener("submit", function (evento) {
        if (!selectProduto.value) {
            evento.preventDefault();
            window.alert("Selecione o produto da perda.");
            selectProduto.focus();
            return;
        }

        if (!quantidade.value || numero(quantidade.value) <= 0) {
            evento.preventDefault();
            window.alert("Informe uma quantidade maior que zero.");
            quantidade.focus();
            return;
        }

        if (valorUnitario.value === "" || numero(valorUnitario.value) < 0) {
            evento.preventDefault();
            window.alert("Informe um valor unitário válido.");
            valorUnitario.focus();
            return;
        }

        calcularTotal();
    });

    calcularTotal();
});
