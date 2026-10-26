document.addEventListener("DOMContentLoaded", function () {
    const botoes = document.querySelectorAll("[data-exportar]");

    if (!botoes.length) {
        return;
    }

    function limparTexto(valor) {
        return String(valor || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function celulaCsv(valor) {
        const texto = limparTexto(valor).replace(/"/g, '""');

        return '"' + texto + '"';
    }

    function exportar(tabela) {
        if (!tabela) {
            window.alert("Gere o relatório antes de exportar.");
            return;
        }

        const linhas = [];
        const titulo = tabela.getAttribute("data-titulo") || "Relatório";

        const cabecalhos = Array.from(tabela.querySelectorAll("thead th"))
            .map(function (th) { return celulaCsv(th.textContent); });

        if (cabecalhos.length) {
            linhas.push(cabecalhos.join(";"));
        }

        tabela.querySelectorAll("tbody tr").forEach(function (linha) {
            const colunas = Array.from(linha.querySelectorAll("td"))
                .map(function (td) { return celulaCsv(td.textContent); });

            if (colunas.length) {
                linhas.push(colunas.join(";"));
            }
        });

        const conteudo = "\uFEFF" + linhas.join("\r\n");
        const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const data = new Date().toISOString().slice(0, 10);
        const nome = titulo
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        link.href = url;
        link.download = (nome || "relatorio") + "-" + data + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    botoes.forEach(function (botao) {
        botao.addEventListener("click", function () {
            const id = botao.getAttribute("data-exportar");
            exportar(document.getElementById(id));
        });
    });
});
