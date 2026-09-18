const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {

        const resposta = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        if (resposta.redirected) {

            mensagem.textContent = "Login realizado com sucesso!";
            mensagem.style.color = "green";

            window.location.href = resposta.url;

        } else {

            const mensagemErro = await resposta.text();

            mensagem.textContent = mensagemErro;
            mensagem.style.color = "red";
        }

    } catch (erro) {

        console.error("Erro no login:", erro);

        mensagem.textContent = "Erro ao conectar com o servidor.";
        mensagem.style.color = "red";
    }
});