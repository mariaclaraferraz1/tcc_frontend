document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("gastoForm");

    if (!formulario) {
        return;
    }

    const campoArquivo = document.getElementById("arquivo-comprovante");
    const campoHidden = document.getElementById("comprovante-data");
    const campoLink = document.getElementById("comprovanteLink");

    if (!campoArquivo || !campoHidden) {
        return;
    }

    const LIMITE_BYTES = 2 * 1024 * 1024;
    const TIPOS_PERMITIDOS = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "application/pdf"
    ];

    campoArquivo.addEventListener("change", function () {
        const arquivo = campoArquivo.files && campoArquivo.files[0];

        campoHidden.value = "";

        if (!arquivo) {
            return;
        }

        if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
            window.alert("Envie uma imagem (PNG, JPG, WEBP, GIF) ou um PDF.");
            campoArquivo.value = "";
            return;
        }

        if (arquivo.size > LIMITE_BYTES) {
            window.alert("O comprovante deve ter no máximo 2 MB.");
            campoArquivo.value = "";
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (evento) {
            campoHidden.value = String(evento.target.result || "");
            if (campoLink) {
                campoLink.value = "";
            }
        };

        leitor.onerror = function () {
            window.alert("Não foi possível ler o comprovante selecionado.");
            campoArquivo.value = "";
            campoHidden.value = "";
        };

        leitor.readAsDataURL(arquivo);
    });

    if (campoLink) {
        campoLink.addEventListener("input", function () {
            if (campoLink.value.trim()) {
                campoHidden.value = "";
                campoArquivo.value = "";
            }
        });
    }

    formulario.addEventListener("reset", function () {
        campoHidden.value = "";

        if (campoLink) {
            campoLink.value = "";
        }
    });
});
