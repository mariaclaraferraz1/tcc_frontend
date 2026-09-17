const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const emailCadastrado = localStorage.getItem("email");
    const senhaCadastrada = localStorage.getItem("senha");

    if (email === emailCadastrado && senha === senhaCadastrada) {

        mensagem.textContent = "Login realizado com sucesso!";
        mensagem.style.color = "green";

        setTimeout(function() {
            window.location.href = "../pages/inicio.html";
        }, 500);

    } else {

        mensagem.textContent = "E-mail ou senha incorretos!";
        mensagem.style.color = "red";
    }
});