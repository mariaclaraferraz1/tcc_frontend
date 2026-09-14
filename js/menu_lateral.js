document.addEventListener("DOMContentLoaded", function () {

    const menuContainer = document.getElementById("menu-container");

    if (!menuContainer) {
        return;
    }

    fetch("../menu.html")
        .then(function (response) {

            if (!response.ok) {
                throw new Error("Nao foi possivel carregar o menu.html");
            }

            return response.text();

        })
        .then(function (data) {

            // Coloca o menu na pagina
            menuContainer.innerHTML = data;


            // ==============================
            // CORRIGIR CAMINHO DA LOGO
            // ==============================

            const logo = menuContainer.querySelector(".menu-topo img");

            if (logo) {
                logo.src = "../img/logotcc.png";
            }


            // ==============================
            // ELEMENTOS DO MENU
            // ==============================

            const menuLateral =
                menuContainer.querySelector(".menu-lateral");

            const fundoMenu =
                menuContainer.querySelector(".fundo-menu");

            const menuBtn =
                document.getElementById("menuBtn");


            // Verifica se encontrou os elementos
            if (!menuLateral || !fundoMenu || !menuBtn) {

                console.error("Elementos do menu nao encontrados.");

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
            // CORRIGIR OS LINKS DO MENU
            // ==============================

            const links =
                menuLateral.querySelectorAll("a");

            links.forEach(function (link) {

                const href = link.getAttribute("href");

                if (href && href.startsWith("pages/")) {

                    link.setAttribute(
                        "href",
                        "../" + href
                    );

                }

            });


            // ==============================
            // IDENTIFICAR PAGINA ATUAL
            // ==============================

            const paginaAtual =
                window.location.pathname.split("/").pop();


            // ==============================
            // MARCAR PAGINA ATUAL
            // ==============================

            links.forEach(function (link) {

                const href = link.getAttribute("href");

                if (href && href.endsWith(paginaAtual)) {

                    link.classList.add("ativo");

                }

            });

        })
        .catch(function (error) {

            console.error(
                "Erro ao carregar o menu:",
                error
            );

        });

});