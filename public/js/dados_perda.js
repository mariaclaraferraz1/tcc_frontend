// Compat: página legada de perda. Apenas validação; o form atual
// (perda_form.ejs) usa perda_form.js e POST /perdas.
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("perdaForm");
    if (!form) return;
    form.addEventListener("submit", function (event) {
        const produto = document.getElementById("produto");
        const dataPerda = document.getElementById("data-perda");
        const quantidade = document.getElementById("quantidade");
        if (produto && !produto.value) {
            alert("Selecione o produto.");
            event.preventDefault();
            return;
        }
        if (dataPerda && !dataPerda.value) {
            alert("Informe a data da perda.");
            event.preventDefault();
            return;
        }
        if (quantidade && (!quantidade.value || Number(quantidade.value) <= 0)) {
            alert("Informe uma quantidade válida.");
            event.preventDefault();
        }
    });
});
