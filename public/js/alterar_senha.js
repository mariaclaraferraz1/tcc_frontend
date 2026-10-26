document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("form-senha");

    if (!formulario) {
        return;
    }

    const senhaAtual = document.getElementById("senhaAtual");
    const novaSenha = document.getElementById("novaSenha");
    const confirmarSenha = document.getElementById("confirmarSenha");

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        if (novaSenha.value.length < 8) {
            evento.preventDefault();
            window.alert("A nova senha deve ter pelo menos 8 caracteres.");
            novaSenha.focus();
            return;
        }

        if (!/[A-Za-z]/.test(novaSenha.value) || !/\d/.test(novaSenha.value)) {
            evento.preventDefault();
            window.alert("A nova senha deve conter letras e números.");
            novaSenha.focus();
            return;
        }

        if (novaSenha.value === senhaAtual.value) {
            evento.preventDefault();
            window.alert("A nova senha deve ser diferente da senha atual.");
            novaSenha.focus();
            return;
        }

        if (novaSenha.value !== confirmarSenha.value) {
            evento.preventDefault();
            window.alert("A nova senha e a confirmação não são iguais.");
            confirmarSenha.focus();
        }
    });
});
