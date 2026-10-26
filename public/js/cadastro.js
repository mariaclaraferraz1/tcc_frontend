document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("form-produto");
    const campoArquivo = document.getElementById("arquivo-imagem");
    const campoLink = document.getElementById("imagemLink");
    const campoHidden = document.getElementById("imagem-data");
    const preview = document.getElementById("preview-imagem");

    if (!formulario || !campoArquivo || !campoHidden || !preview) {
        return;
    }

    const LIMITE_BYTES = 2 * 1024 * 1024;

    function mostrarPreview(src) {
        if (src) {
            preview.src = src;
            preview.style.display = "block";
            return;
        }

        preview.removeAttribute("src");
        preview.style.display = "none";
    }

    campoArquivo.addEventListener("change", function () {
        const arquivo = campoArquivo.files && campoArquivo.files[0];

        campoHidden.value = "";

        if (!arquivo) {
            const link = campoLink ? campoLink.value.trim() : "";
            mostrarPreview(link);
            return;
        }

        if (!arquivo.type.startsWith("image/")) {
            window.alert("Selecione um arquivo de imagem válido (PNG, JPG, WEBP ou GIF).");
            campoArquivo.value = "";
            return;
        }

        if (arquivo.size > LIMITE_BYTES) {
            window.alert("A imagem deve ter no máximo 2 MB.");
            campoArquivo.value = "";
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (evento) {
            campoHidden.value = String(evento.target.result || "");
            if (campoLink) {
                campoLink.value = "";
            }
            mostrarPreview(campoHidden.value);
        };

        leitor.onerror = function () {
            window.alert("Não foi possível ler a imagem selecionada.");
            campoArquivo.value = "";
            campoHidden.value = "";
        };

        leitor.readAsDataURL(arquivo);
    });

    if (campoLink) {
        campoLink.addEventListener("input", function () {
            const link = campoLink.value.trim();

            if (link) {
                campoHidden.value = "";
                campoArquivo.value = "";
                mostrarPreview(link);
            } else if (!campoArquivo.files.length) {
                mostrarPreview("");
            }
        });
    }

    formulario.addEventListener("submit", function (evento) {
        const nome = formulario.querySelector("#nome");
        const preco = formulario.querySelector("#preco");
        const estoque = formulario.querySelector("#estoque");

        if (!nome || !nome.value.trim()) {
            evento.preventDefault();
            window.alert("Informe o nome do produto.");
            return;
        }

        if (!preco || preco.value === "" || Number(preco.value) < 0) {
            evento.preventDefault();
            window.alert("Informe um preço válido.");
            return;
        }

        if (!estoque || estoque.value === "" || Number(estoque.value) < 0) {
            evento.preventDefault();
            window.alert("Informe um estoque válido.");
        }
    });
});
