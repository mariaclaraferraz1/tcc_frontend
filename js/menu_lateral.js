const menuBtn = document.getElementById("menuBtn");
const menuLateral = document.querySelector(".menu-lateral");
const fundoMenu = document.querySelector(".fundo-menu");

menuBtn.addEventListener("click", function () {

    menuLateral.classList.toggle("aberto");
    fundoMenu.classList.toggle("ativo");

});