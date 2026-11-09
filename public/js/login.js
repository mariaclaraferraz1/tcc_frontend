document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");

    if (loginForm) {
        loginForm.addEventListener("submit", function () {
            const btnPrimary = document.querySelector(".btn-primary");
            
            if (btnPrimary) {
                // Altera o texto do botão para dar um feedback visual enquanto o Node faz o login
                btnPrimary.textContent = "Entrando...";
                btnPrimary.style.opacity = "0.7";
            }
        });
    }
});