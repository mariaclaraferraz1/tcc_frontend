// Pega o formulário da página
const formulario = document.querySelector("form");

// Quando clicar em "Salvar Produto"
formulario.addEventListener("submit", function(event) {

    // Não deixa a página recarregar
    event.preventDefault();

    // Pega todos os inputs do formulário
    const campos = formulario.querySelectorAll("input");

    // Pega os valores dos campos
    const nome = campos[0].value;
    const preco = campos[1].value;
    const categoria = campos[2].value;

    // Pega a imagem selecionada
    const imagem = campos[3].files[0];


    // Verifica se os campos foram preenchidos
    if (nome === "" || preco === "" || categoria === "") {

        alert("Preencha todos os campos!");

        return;
    }


    // Pega os produtos que já estão salvos
    // Se não existir nenhum, cria uma lista vazia
    let produtos = JSON.parse(
        localStorage.getItem("produtos")
    ) || [];


    // Cria o novo produto
    const produto = {

        id: Date.now(),

        nome: nome,

        preco: Number(preco),

        categoria: categoria,

        imagem: imagem ? imagem.name : ""

    };


    // Adiciona o novo produto na lista
    produtos.push(produto);


    // Salva a lista atualizada
    localStorage.setItem(
        "produtos",
        JSON.stringify(produtos)
    );


    // Mostra mensagem de sucesso
    alert("Produto cadastrado com sucesso!");


    // Limpa o formulário
    formulario.reset();

});