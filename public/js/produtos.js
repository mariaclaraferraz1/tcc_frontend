//
const listaProdutos = document.querySelector(".lista-produtos");

if (listaProdutos) {
    const produtos = JSON.parse(
        localStorage.getItem("produtos")
    ) || [];

    // Remove os cards antigos do HTML, mantendo o título
    listaProdutos.querySelectorAll(".produto-card").forEach(card => {
        card.remove();
    });

    // Cria um card para cada produto cadastrado
    produtos.forEach(function (produto) {
        const card = document.createElement("div");
        card.classList.add("produto-card");

        // Área da imagem
        const imagem = document.createElement("div");
        imagem.classList.add("produto-imagem");

        if (produto.imagem && produto.imagem.startsWith("data:image/")) {
            const foto = document.createElement("img");
            foto.src = produto.imagem;
            foto.alt = produto.nome;
            foto.classList.add("foto-produto");
            imagem.appendChild(foto);
        } else {
            imagem.innerHTML = '<i class="fa-solid fa-seedling"></i>';
        }

        // Informações do produto
        const info = document.createElement("div");
        info.classList.add("produto-info");

        const titulo = document.createElement("h3");
        titulo.textContent = produto.nome;

        const categoria = document.createElement("p");
        categoria.textContent = produto.categoria;

        const preco = document.createElement("span");
        preco.textContent = "Preço: R$ " +
            Number(produto.preco || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2
            });

        info.append(titulo, categoria, preco);

        // Botão de opções
        const opcoes = document.createElement("button");
        opcoes.classList.add("btn-opcoes");
        opcoes.type = "button";
        opcoes.innerHTML =
            '<i class="fa-solid fa-ellipsis-vertical"></i>';

        // Monta o card
        card.append(imagem, info, opcoes);
        listaProdutos.appendChild(card);
    });
}