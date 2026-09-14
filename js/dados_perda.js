document.addEventListener("DOMContentLoaded", function () {

```
const produto = document.getElementById("produto");
const dataPerda = document.getElementById("data-perda");
const quantidade = document.getElementById("quantidade");
const unidade = document.getElementById("unidade");
const motivo = document.getElementById("motivo");
const localPerda = document.getElementById("local-perda");
const valorPerda = document.getElementById("valor-perda");
const observacoes = document.getElementById("observacoes");

const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");


// SALVAR PERDA
btnSalvar.addEventListener("click", function () {

    // Verifica os campos obrigatórios
    if (produto.value === "") {
        alert("Selecione o produto.");
        produto.focus();
        return;
    }

    if (dataPerda.value === "") {
        alert("Informe a data da perda.");
        dataPerda.focus();
        return;
    }

    if (quantidade.value === "" || Number(quantidade.value) <= 0) {
        alert("Informe uma quantidade válida.");
        quantidade.focus();
        return;
    }

    if (motivo.value === "") {
        alert("Selecione o motivo da perda.");
        motivo.focus();
        return;
    }

    if (localPerda.value.trim() === "") {
        alert("Informe o local da perda.");
        localPerda.focus();
        return;
    }

    if (valorPerda.value === "" || Number(valorPerda.value) < 0) {
        alert("Informe um valor estimado válido.");
        valorPerda.focus();
        return;
    }


    // Cria o objeto com os dados da perda
    const novaPerda = {
        id: Date.now(),
        produto: produto.value,
        data: dataPerda.value,
        quantidade: Number(quantidade.value),
        unidade: unidade.value,
        motivo: motivo.value,
        local: localPerda.value.trim(),
        valor: Number(valorPerda.value),
        observacoes: observacoes.value.trim()
    };


    // Busca as perdas já salvas
    let perdas = JSON.parse(localStorage.getItem("perdas")) || [];


    // Adiciona a nova perda
    perdas.push(novaPerda);


    // Salva novamente no navegador
    localStorage.setItem("perdas", JSON.stringify(perdas));


    // Mensagem de sucesso
    alert("Perda registrada com sucesso!");


    // Limpa o formulário
    limparFormulario();

});


// BOTÃO CANCELAR
btnCancelar.addEventListener("click", function () {

    const confirmar = confirm(
        "Deseja realmente cancelar? Os dados preenchidos serão apagados."
    );

    if (confirmar) {
        limparFormulario();
    }

});


// FUNÇÃO PARA LIMPAR O FORMULÁRIO
function limparFormulario() {

    produto.value = "";
    dataPerda.value = "";
    quantidade.value = "";
    unidade.value = "kg";
    motivo.value = "";
    localPerda.value = "";
    valorPerda.value = "";
    observacoes.value = "";

    produto.focus();

}


// IMPEDE VALORES NEGATIVOS
quantidade.addEventListener("input", function () {

    if (Number(this.value) < 0) {
        this.value = "";
    }

});


valorPerda.addEventListener("input", function () {

    if (Number(this.value) < 0) {
        this.value = "";
    }

});
```

});
