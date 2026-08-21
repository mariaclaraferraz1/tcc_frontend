const cadastroForm = document.getElementById("cadastroForm");
const mensagem = document.getElementById("mensagem");

function validarNomeSobrenome(nomeCompleto) {
    const partes = nomeCompleto.trim().split(/\s+/);
    return partes.length >= 2 && partes !== "" && partes !== "";
}

cadastroForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (!validarNomeSobrenome(nome)) {
        mensagem.textContent = "Por favor, digite seu nome e pelo menos um sobrenome!";
        mensagem.style.color = "red";
        return;
    }

    // ALTERADO: Validação manual de senha (Sem Regex)
    let temMaiuscula = false;
    let temEspecial = false;
    const caracteresEspeciais = "!@#$%^&*(),.?\":{}|<>-";

    if (senha.length < 8) {
        mensagem.textContent = "A senha deve ter pelo menos 8 caracteres!";
        mensagem.style.color = "red";
        return;
    }

    for (let i = 0; i < senha.length; i++) {
        const caractere = senha[i];
        if (caractere >= 'A' && caractere <= 'Z') {
            temMaiuscula = true;
        } else if (caracteresEspeciais.includes(caractere)) {
            temEspecial = true;
        }
    }

    if (!temMaiuscula || !temEspecial) {
        mensagem.textContent = "A senha deve conter pelo menos 1 letra maiúscula e 1 caractere especial!";
        mensagem.style.color = "red";
        return;
    }

    if (senha !== confirmarSenha) {
        mensagem.textContent = "As senhas não são iguais!";
        mensagem.style.color = "red";
        return;
    }

    // Salva os dados para usar no login
    localStorage.setItem("nome", nome);
    localStorage.setItem("email", email);
    localStorage.setItem("senha", senha);

    mensagem.textContent = "Conta criada com sucesso!";
    mensagem.style.color = "green";

    setTimeout(function() {
        window.location.href = "login.html";
    }, 1000);
});
