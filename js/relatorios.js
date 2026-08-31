const btnGerar = document.getElementById("btnGerar");
const areaRelatorio = document.getElementById("areaRelatorio");
const tipoRelatorio = document.getElementById("tipoRelatorio");
const dataInicial = document.getElementById("dataInicial");
const dataFinal = document.getElementById("dataFinal");

btnGerar.addEventListener("click", function () {
    if (tipoRelatorio.value === "") {
        alert("Selecione o tipo de relatório.");
        return;

    }

    if (dataInicial.value === "" || dataFinal.value === "") {
        alert("Selecione a data inicial e a data final.");
        return;

    }


    areaRelatorio.innerHTML = `

        <div class="icone-relatorio">
            <i class="fa-solid fa-chart-column"></i>
        </div>

        <h2>Relatório gerado!</h2>

        <p>
            O relatório de
            <strong>${tipoRelatorio.options[tipoRelatorio.selectedIndex].text}</strong>
            foi gerado para o período selecionado.

        </p>

    `;

});