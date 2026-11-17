document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("form-venda");

    if (!formulario) {
        return;
    }

    const selectProduto = document.getElementById("idProduto");
    const quantidade = document.getElementById("quantidade");
    const unidade = document.getElementById("unidade-venda");
    const preco = document.getElementById("preco-venda");
    const total = document.getElementById("valor-total");
    const estoqueInfo = document.getElementById("estoque-disponivel");
    const avisoGrupo = document.getElementById("aviso-estoque-grupo");
    const avisoTexto = document.getElementById("aviso-estoque");

    if (!selectProduto || !quantidade || !unidade || !preco || !total) {
        return;
    }

    function numero(valor) {
        const convertido = Number(valor);

        return Number.isFinite(convertido) ? convertido : 0;
    }

    function moeda(valor) {
        return numero(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function quantidadeFormatada(valor) {
        const convertido = numero(valor);

        return Number.isInteger(convertido)
            ? convertido.toLocaleString("pt-BR")
            : convertido.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
              });
    }

    function opcaoSelecionada() {
        return selectProduto.options[selectProduto.selectedIndex];
    }

    function estoqueDaOpcao(opcao) {
        return opcao && opcao.value ? numero(opcao.getAttribute("data-estoque")) : 0;
    }

    function limparAviso() {
        quantidade.setCustomValidity("");

        if (avisoGrupo && avisoTexto) {
            avisoTexto.textContent = "";
            avisoGrupo.style.display = "none";
        }
    }

    function validarEstoque() {
        const opcao = opcaoSelecionada();

        if (!opcao || !opcao.value) {
            limparAviso();
            return true;
        }

        const estoque = estoqueDaOpcao(opcao);
        const unidadeProduto = opcao.getAttribute("data-unidade") || "kg";
        const quantidadeInformada = numero(quantidade.value);

        if (quantidadeInformada > estoque + 0.000001) {
            const mensagem =
                "Estoque insuficiente. Disponível: " +
                quantidadeFormatada(estoque) +
                " " +
                unidadeProduto +
                ".";

            quantidade.setCustomValidity(mensagem);

            if (avisoGrupo && avisoTexto) {
                avisoTexto.textContent = mensagem;
                avisoGrupo.style.display = "";
            }

            return false;
        }

        limparAviso();
        return true;
    }

    function atualizarDisponibilidade(opcao) {
        const estoque = estoqueDaOpcao(opcao);
        const unidadeProduto = opcao && opcao.value
            ? (opcao.getAttribute("data-unidade") || "kg")
            : "";

        if (opcao && opcao.value) {
            if (estoque > 0) {
                quantidade.max = String(estoque);
            } else {
                quantidade.removeAttribute("max");
            }

            if (estoqueInfo) {
                estoqueInfo.textContent = estoque > 0
                    ? "Disponível em estoque: " +
                      quantidadeFormatada(estoque) +
                      " " +
                      unidadeProduto +
                      "."
                    : "Este produto está sem estoque disponível.";
            }
        } else {
            quantidade.removeAttribute("max");

            if (estoqueInfo) {
                estoqueInfo.textContent = "Selecione um produto para ver o estoque disponível.";
            }
        }
    }

    function atualizarProduto() {
        const opcao = opcaoSelecionada();

        if (!opcao || !opcao.value) {
            unidade.value = "";
            preco.value = "";
            atualizarDisponibilidade(null);
            calcularTotal();
            validarEstoque();
            return;
        }

        unidade.value = opcao.getAttribute("data-unidade") || "";
        preco.value = moeda(opcao.getAttribute("data-preco") || 0);
        atualizarDisponibilidade(opcao);
        calcularTotal();
        validarEstoque();
    }

    function calcularTotal() {
        const opcao = opcaoSelecionada();
        const valorUnitario = opcao && opcao.value
            ? numero(opcao.getAttribute("data-preco"))
            : 0;
        const qtd = numero(quantidade.value);
        const resultado = qtd * valorUnitario;

        total.value = moeda(resultado);
    }

    selectProduto.addEventListener("change", atualizarProduto);
    quantidade.addEventListener("input", function () {
        calcularTotal();
        validarEstoque();
    });

    formulario.addEventListener("submit", function (evento) {
        if (!selectProduto.value) {
            evento.preventDefault();
            window.alert("Selecione o produto da venda.");
            selectProduto.focus();
            return;
        }

        if (!quantidade.value || numero(quantidade.value) <= 0) {
            evento.preventDefault();
            window.alert("Informe uma quantidade maior que zero.");
            quantidade.focus();
            return;
        }

        if (!validarEstoque()) {
            evento.preventDefault();
            window.alert(
                avisoTexto && avisoTexto.textContent
                    ? avisoTexto.textContent
                    : "Quantidade acima do estoque disponível."
            );
            quantidade.focus();
        }
    });

    atualizarProduto();
});
