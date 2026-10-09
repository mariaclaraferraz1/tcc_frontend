
const formulario = document.querySelector("#form-produto");
const campoImagem = document.querySelector("#imagem");
const preview = document.querySelector("#preview-imagem");

let imagemSelecionada = "";

// Mostra a imagem assim que escolher o arquivo
campoImagem.addEventListener("change", function () {
    const arquivo = this.files[0];

    if (!arquivo) {
        imagemSelecionada = "";
        preview.style.display = "none";
        preview.removeAttribute("src");
        return;
    }

    if (!arquivo.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido.");
        this.value = "";
        imagemSelecionada = "";
        preview.style.display = "none";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (evento) {
        imagemSelecionada = evento.target.result;
        preview.src = imagemSelecionada;
        preview.style.display = "block";
    };

    leitor.readAsDataURL(arquivo);
});

// Salva o produto
formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.querySelector("#nome").value.trim();
    const preco = document.querySelector("#preco").value;
    const categoria = document.querySelector("#categoria").value.trim();

    if (!nome || !preco || !categoria) {
        alert("Preencha todos os campos!");
        return;
    }

    let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    const produto = {
        id: Date.now(),
        nome: nome,
        preco: Number(preco),
        categoria: categoria,
        imagem: imagemSelecionada
    };

    produtos.push(produto);

    try {
        localStorage.setItem("produtos", JSON.stringify(produtos));
    } catch (erro) {
        produtos.pop();
        alert("Não foi possível salvar. A imagem pode ser muito grande. Escolha uma imagem menor.");
        return;
    }

    alert("Produto cadastrado com sucesso!");

    window.location.href = "/produtos";
});