document.addEventListener("DOMContentLoaded", function () {
    const menuLateral = document.querySelector(".menu-lateral");
    const fundoMenu = document.querySelector(".fundo-menu");
    const menuBtn = document.getElementById("menuBtn");

    function fecharMenu() {
        if (!menuLateral || !fundoMenu || !menuBtn) {
            return;
        }

        menuLateral.classList.remove("aberto");
        fundoMenu.classList.remove("ativo");
        menuBtn.setAttribute("aria-expanded", "false");
    }

    if (menuLateral && fundoMenu && menuBtn) {
        menuBtn.setAttribute("aria-expanded", "false");

        menuBtn.addEventListener("click", function () {
            const aberto = menuLateral.classList.toggle("aberto");

            fundoMenu.classList.toggle("ativo", aberto);
            menuBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
        });

        fundoMenu.addEventListener("click", fecharMenu);

        menuLateral.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", fecharMenu);
        });

        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape") {
                fecharMenu();
            }
        });
    }

    // Fecha menus de ações (detalhes) ao clicar fora deles.
    document.addEventListener("click", function (evento) {
        document.querySelectorAll("details.produto-acoes[open]").forEach(function (detalhe) {
            if (!detalhe.contains(evento.target)) {
                detalhe.removeAttribute("open");
            }
        });
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key !== "Escape") {
            return;
        }

        document.querySelectorAll("details.produto-acoes[open]").forEach(function (detalhe) {
            detalhe.removeAttribute("open");
        });
    });

    // Confirmação centralizada para formulários destrutivos.
    document.querySelectorAll("form[data-confirmar]").forEach(function (formulario) {
        formulario.addEventListener("submit", function (evento) {
            const texto = formulario.getAttribute("data-confirmar");

            if (texto && !window.confirm(texto)) {
                evento.preventDefault();
            }
        });
    });

    // Evita envio duplicado após o primeiro clique.
    document.querySelectorAll("form").forEach(function (formulario) {
        formulario.addEventListener("submit", function (evento) {
            if (evento.defaultPrevented) {
                return;
            }

            const botoes = formulario.querySelectorAll('button[type="submit"]');

            window.setTimeout(function () {
                botoes.forEach(function (botao) {
                    botao.disabled = true;
                });
            }, 0);
        });
    });
});
