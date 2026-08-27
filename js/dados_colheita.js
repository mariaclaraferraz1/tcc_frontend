// Pega o campo de seleção de produto
const selectProduto = document.getElementById("produto");

// Pega os produtos que foram cadastrados
const produtos = JSON.parse(
    localStorage.getItem("produtos")
) || [];


// Adiciona cada produto no campo de seleção
produtos.forEach(function(produto) {

    // Cria uma opção
    const option = document.createElement("option");

    // O valor da opção será o ID do produto
    option.value = produto.id;

    // O nome que aparece para o produtor
    option.textContent = produto.nome;

    // Adiciona a opção no select
    selectProduto.appendChild(option);

});


// --------------------------------------------------
// SALVAR A COLHEITA
// --------------------------------------------------

// Pega o formulário
const formulario = document.querySelector("form");

// Quando clicar em "Salvar Colheita"
formulario.addEventListener("submit", function(event) {

    // Impede a página de recarregar
    event.preventDefault();

    // Pega os dados preenchidos
    const produto = selectProduto.value;
    const dataPlantio = document.getElementById("dataPlantio").value;
    const quantidade = document.getElementById("quantidade").value;
    const peso = document.getElementById("peso").value;
    const dataColheita = document.getElementById("dataColheita").value;
    const observacoes = document.getElementById("observacoes").value;


    // Verifica se os campos obrigatórios foram preenchidos
    if (
        produto === "" ||
        dataPlantio === "" ||
        quantidade === "" ||
        peso === "" ||
        dataColheita === ""
    ) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }


    // Pega as colheitas que já estão salvas
    // Se não existir nenhuma, começa com uma lista vazia
    let colheitas = JSON.parse(
        localStorage.getItem("colheitas")
    ) || [];


    // Cria a nova colheita
    const colheita = {

        id: Date.now(),

        produtoId: produto,

        dataPlantio: dataPlantio,

        quantidade: Number(quantidade),

        peso: Number(peso),

        dataColheita: dataColheita,

        observacoes: observacoes

    };


    // Adiciona a colheita na lista
    colheitas.push(colheita);


    // Salva as colheitas
    localStorage.setItem(
        "colheitas",
        JSON.stringify(colheitas)
    );


    // Mostra mensagem
    alert("Colheita cadastrada com sucesso!");


    // Limpa o formulário
    formulario.reset();

});