const formSenha = document.getElementById("formSenha");

formSenha.addEventListener("submit", function(event) {

    event.preventDefault();

    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senhaAtual === "") {
        alert("Digite sua senha atual.");
        return;
    }

    if (novaSenha === "") {
        alert("Digite uma nova senha.");
        return;
    }

    if (novaSenha !== confirmarSenha) {
        alert("As novas senhas não são iguais.");
        return;
    }

    alert("Senha alterada com sucesso!");

    formSenha.reset();

});