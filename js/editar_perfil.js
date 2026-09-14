const formPerfil = document.getElementById("formPerfil");

formPerfil.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;

    console.log("Nome:", nome);
    console.log("E-mail:", email);
    console.log("Telefone:", telefone);

    alert("Perfil atualizado com sucesso!");

});