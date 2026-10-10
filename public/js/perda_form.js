// Form de perda: validação leve. Submit nativo (POST /perdas).
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("perdaForm");
    if (!form) return;

    const produto = document.getElementById("produto");
    const dataPerda = document.getElementById("data-perda");
    const quantidade = document.getElementById("quantidade");
    const motivo = document.getElementById("motivo");
    const valorPerda = document.getElementById("valor-perda");

    [quantidade, valorPerda].forEach(function (campo) {
        if (!campo) return;
        campo.addEventListener("input", function () {
            if (this.value !== "" && Number(this.value) < 0) this.value = "";
        });
    });

    form.addEventListener("submit", function (event) {
        if (!produto.value) {
            alert("Selecione o produto.");
            produto.focus();
            event.preventDefault();
            return;
        }
        if (!dataPerda.value) {
            alert("Informe a data da perda.");
            dataPerda.focus();
            event.preventDefault();
            return;
        }
        if (!quantidade.value || Number(quantidade.value) <= 0) {
            alert("Informe uma quantidade válida.");
            quantidade.focus();
            event.preventDefault();
            return;
        }
        if (!motivo.value) {
            alert("Selecione o motivo da perda.");
            motivo.focus();
            event.preventDefault();
            return;
        }
        if (valorPerda.value === "" || Number(valorPerda.value) < 0) {
            alert("Informe um valor estimado válido.");
            valorPerda.focus();
            event.preventDefault();
        }
        // deixa enviar -> POST /perdas
    });
});
