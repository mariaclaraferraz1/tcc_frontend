document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // ELEMENTOS
    // ==============================

    const quantidade = document.querySelector(
        'input[type="number"][placeholder="Ex: 50"]'
    );

    const valorUnitario = document.querySelector(
        'input[type="number"][placeholder="Ex: 5,50"]'
    );

    const valorTotal = document.querySelector('input[readonly]');

    const btnSalvar = document.querySelector(".btn-salvar");

    const btnCancelar = document.querySelector(".btn-cancelar");

    const btnNovoCliente = document.querySelector(".btn-novo-cliente");


    // ==============================
    // CALCULAR VALOR TOTAL
    // ==============================

    function calcularTotal() {

        const qtd = parseFloat(quantidade.value) || 0;

        const valor = parseFloat(valorUnitario.value) || 0;

        const total = qtd * valor;

        valorTotal.value = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    }


    // Atualiza o valor total enquanto digita
    quantidade.addEventListener("input", calcularTotal);

    valorUnitario.addEventListener("input", calcularTotal);


    // ==============================
    // SALVAR VENDA
    // ==============================

    btnSalvar.addEventListener("click", function () {

        if (quantidade.value === "" || valorUnitario.value === "") {

            alert("Preencha a quantidade e o valor unitário.");

            return;

        }


        calcularTotal();


        // Redireciona para a tela Comercial
        window.location.href = "comercial.html";

    });


    // ==============================
    // CANCELAR
    // ==============================

    btnCancelar.addEventListener("click", function () {

        const confirmar = confirm(
            "Deseja cancelar o registro da venda?"
        );


        if (confirmar) {

            window.location.href = "comercial.html";

        }

    });


    // ==============================
    // NOVO CLIENTE
    // ==============================

    btnNovoCliente.addEventListener("click", function () {

        const nome = prompt(
            "Digite o nome do novo cliente:"
        );


        if (nome && nome.trim() !== "") {

            const selectCliente =
                document.querySelector(".cliente select");


            const novaOpcao =
                document.createElement("option");


            novaOpcao.textContent = nome.trim();

            novaOpcao.value = nome.trim();


            selectCliente.appendChild(novaOpcao);

            selectCliente.value = nome.trim();


            alert("Cliente adicionado com sucesso! ✅");

        }

    });

});