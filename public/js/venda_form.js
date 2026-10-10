// Form de nova venda: cálculo automático + preenchimento de unidade/preço.
// O submit é nativo (POST /vendas) — este script NÃO cancela o envio.
document.addEventListener("DOMContentLoaded", function () {
    const selectProduto = document.getElementById("id_produto");
    const quantidade = document.getElementById("quantidade");
    const valorUnitario = document.getElementById("valor_unitario");
    const valorTotalExibido = document.getElementById("valor_total_exibido");
    const unidade = document.getElementById("unidade");
    const form = document.getElementById("vendaForm");

    if (!form) return;

    function calcularTotal() {
        const qtd = parseFloat(quantidade.value) || 0;
        const valor = parseFloat(valorUnitario.value) || 0;
        const total = qtd * valor;
        if (valorTotalExibido) {
            valorTotalExibido.value = total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
        }
    }

    if (selectProduto) {
        selectProduto.addEventListener("change", function () {
            const opcao = selectProduto.selectedOptions[0];
            if (!opcao) return;
            if (opcao.dataset.preco && valorUnitario && !valorUnitario.value) {
                valorUnitario.value = opcao.dataset.preco;
            }
            if (opcao.dataset.unidade && unidade && !unidade.value) {
                unidade.value = opcao.dataset.unidade;
            }
            calcularTotal();
        });
    }

    if (quantidade) quantidade.addEventListener("input", calcularTotal);
    if (valorUnitario) valorUnitario.addEventListener("input", calcularTotal);

    form.addEventListener("submit", function (event) {
        const qtd = parseFloat(quantidade.value);
        const valor = parseFloat(valorUnitario.value);
        if (!selectProduto.value) {
            alert("Selecione o produto.");
            event.preventDefault();
            return;
        }
        if (!quantidade.value || !(qtd > 0)) {
            alert("Informe uma quantidade válida.");
            event.preventDefault();
            return;
        }
        if (valorUnitario.value === "" || !(valor >= 0)) {
            alert("Informe um valor unitário válido.");
            event.preventDefault();
            return;
        }
        // deixa o formulário enviar (POST /vendas -> salva no banco em arquivo)
    });

    calcularTotal();
});
