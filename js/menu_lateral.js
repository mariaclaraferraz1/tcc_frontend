const menuBtn = document.getElementById("menuBtn");
const menuLateral = document.querySelector(".menu-lateral");
const fundoMenu = document.querySelector(".fundo-menu");

// Abre e fecha o menu lateral no celular
if (menuBtn) {

    menuBtn.addEventListener("click", function () {

        menuLateral.classList.toggle("aberto");
        fundoMenu.classList.toggle("ativo");

    });

}


// ==============================
// MENU DE PRODUÇÃO
// ==============================

const menuProducao = document.getElementById("menuProducao");

if (menuProducao) {

    menuProducao.innerHTML = `

        <div class="menu-producao">

            <a href="#" id="btnProducao">

                <i class="fa-solid fa-seedling"></i>

                <span>Produção</span>

                <i class="fa-solid fa-chevron-down seta"></i>

            </a>


            <ul class="submenu">

                <li>

                    <a href="dados_colheita.html">

                        <i class="fa-solid fa-wheat-awn"></i>

                        <span>Dados da Colheita</span>

                    </a>

                </li>

            </ul>

        </div>

    `;


    const btnProducao = document.getElementById("btnProducao");

    const producao = menuProducao.querySelector(".menu-producao");


    btnProducao.addEventListener("click", function (event) {

        event.preventDefault();

        producao.classList.toggle("aberto");

    });

}
