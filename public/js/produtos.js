// Pega a área onde os produtos aparecem
const listaProdutos = document.querySelector(".lista-produtos");

// Pega os produtos salvos no navegador
const produtos = JSON.parse(
    localStorage.getItem("produtos")
) || [];


// Limpa os produtos que estão escritos diretamente no HTML
// (Milho, Soja e Hortaliças)
const cards = listaProdutos.querySelectorAll(".produto-card");

cards.forEach(function(card) {
    card.remove();
});


// Cria um card para cada produto cadastrado
produtos.forEach(function(produto) {

    // Cria o card
    const card = document.createElement("div");
    card.classList.add("produto-card");

    // Cria a área da imagem
    const imagem = document.createElement("div");
    imagem.classList.add("produto-imagem");

    imagem.innerHTML = `
        <i class="fa-solid fa-seedling"></i>
    `;


    // Cria as informações do produto
    const info = document.createElement("div");
    info.classList.add("produto-info");

    info.innerHTML = `
        <h3>${produto.nome}</h3>
        <p>${produto.categoria}</p>
        <span>Estoque: 0 kg</span>
    `;


    // Cria o botão de opções
    const opcoes = document.createElement("button");
    opcoes.classList.add("btn-opcoes");

    opcoes.innerHTML = `
        <i class="fa-solid fa-ellipsis-vertical"></i>
    `;


    // Junta tudo dentro do card
    card.appendChild(imagem);
    card.appendChild(info);
    card.appendChild(opcoes);


    // Coloca o card na lista
    listaProdutos.appendChild(card);

});