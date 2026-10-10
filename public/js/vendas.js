// Compat: arquivo antigo referenciado por páginas legadas.
// Mantém o cálculo do total sem impedir o envio do formulário (POST /vendas).
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("vendaForm");
    const quantidade = document.getElementById("quantidade");
    const valorUnitario = document.getElementById("valor_unitario");
    const valorTotalExibido = document.getElementById("valor_total_exibido");

    function calcularTotal() {
        if (!quantidade || !valorUnitario || !valorTotalExibido) return;
        const qtd = parseFloat(quantidade.value) || 0;
        const valor = parseFloat(valorUnitario.value) || 0;
        valorTotalExibido.value = (qtd * valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    if (quantidade) quantidade.addEventListener("input", calcularTotal);
    if (valorUnitario) valorUnitario.addEventListener("input", calcularTotal);
    if (form) {
        form.addEventListener("submit", function (event) {
            const qtd = parseFloat(quantidade.value);
            const valor = parseFloat(valorUnitario.value);
            if (!quantidade.value || !(qtd > 0) || valorUnitario.value === "" || !(valor >= 0)) {
                alert("Preencha a quantidade e o valor unitário.");
                event.preventDefault();
            }
        });
    }
    calcularTotal();
});
