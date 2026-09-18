document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // ELEMENTOS DO MENU
    // ==============================

    const menuLateral = document.querySelector(".menu-lateral");
    const fundoMenu = document.querySelector(".fundo-menu");
    const menuBtn = document.getElementById("menuBtn");

    // Verifica se os elementos existem
    if (!menuLateral || !fundoMenu || !menuBtn) {

        console.error("Elementos do menu não encontrados.");

        return;
    }


    // ==============================
    // ABRIR / FECHAR MENU
    // ==============================

    menuBtn.addEventListener("click", function () {

        menuLateral.classList.toggle("aberto");
        fundoMenu.classList.toggle("ativo");

    });


    // ==============================
    // FECHAR CLICANDO NO FUNDO
    // ==============================

    fundoMenu.addEventListener("click", function () {

        menuLateral.classList.remove("aberto");
        fundoMenu.classList.remove("ativo");

    });


    // ==============================
    // IDENTIFICAR PÁGINA ATUAL
    // ==============================

    const paginaAtual = window.location.pathname
        .split("/")
        .pop();


    // ==============================
    // MARCAR PÁGINA ATUAL
    // ==============================

    const links = menuLateral.querySelectorAll("a");

    links.forEach(function (link) {

        const href = link.getAttribute("href");

        if (!href) {
            return;
        }

        const paginaLink = href
            .split("/")
            .pop()
            .split("?")[0];

        if (paginaLink === paginaAtual) {

            link.classList.add("ativo");

        }

    });

});