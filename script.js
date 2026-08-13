const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (email === "admin@email.com" && senha === "123456") {
        mensagem.textContent = "Login realizado com sucesso!";
        mensagem.style.color = "green";

        // Aqui você pode redirecionar para outra página
        // window.location.href = "home.html";

    } else {
        mensagem.textContent = "E-mail ou senha incorretos!";
        mensagem.style.color = "red";
    }
});