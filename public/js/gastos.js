// Form de gasto: seleção da classificação + validação leve.
// O submit é nativo (POST /gastos) — salva no banco e
// redireciona para a lista. Nada de mensagem temporária.
function selectArea(element) {
    document.querySelectorAll(".area-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });
    element.classList.add("active");
    document.getElementById("areaSelecionada").value = element.dataset.area || element.textContent.trim();
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".area-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            selectArea(btn);
        });
    });

    const form = document.getElementById("gastoForm");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        const descricao = document.getElementById("descricao").value.trim();
        const data = document.getElementById("dataGasto").value;
        const valor = parseFloat(document.getElementById("valor").value);

        if (!descricao) {
            alert("Informe a descrição do gasto.");
            event.preventDefault();
            return;
        }
        if (!data) {
            alert("Informe a data do gasto.");
            event.preventDefault();
            return;
        }
        if (!Number.isFinite(valor) || valor <= 0) {
            alert("Informe um valor válido maior que zero.");
            event.preventDefault();
        }
        // deixa enviar -> POST /gastos
    });
});
