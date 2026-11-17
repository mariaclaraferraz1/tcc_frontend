document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("form-plantio");
    const culturaSelect = document.getElementById("cultura-plantio");
    const variedadeSelect = document.getElementById("variedade-plantio");
    const dataPlantio = document.getElementById("dataPlantio");
    const cicloCampo = document.getElementById("ciclo-plantio");
    const previsaoCampo = document.getElementById("previsao-colheita");
    const avisoCiclo = document.getElementById("aviso-ciclo");

    if (
        !formulario ||
        !culturaSelect ||
        !variedadeSelect ||
        !dataPlantio ||
        !cicloCampo ||
        !previsaoCampo
    ) {
        return;
    }

    // Copia os produtos renderizados pelo servidor antes de filtrar o select.
    const produtos = Array.from(variedadeSelect.querySelectorAll("option[value]"))
        .filter(function (opcao) {
            return Boolean(opcao.value);
        })
        .map(function (opcao) {
            return {
                valor: opcao.value,
                cultura: opcao.getAttribute("data-cultura") || "",
                variedade: opcao.getAttribute("data-variedade") || "",
                ciclo: opcao.getAttribute("data-ciclo") || "",
                rotulo: opcao.textContent.trim()
            };
        });

    const valorInicial = variedadeSelect.value;
    const produtoInicial = produtos.find(function (produto) {
        return produto.valor === valorInicial;
    });

    if (produtoInicial) {
        culturaSelect.value = produtoInicial.cultura;
    }

    function formatarDataBR(dataISO) {
        const partes = String(dataISO).split("-");

        if (partes.length !== 3) {
            return "";
        }

        return partes[2] + "/" + partes[1] + "/" + partes[0];
    }

    function somarDias(dataISO, dias) {
        const partes = String(dataISO).split("-").map(Number);

        if (partes.length !== 3 || partes.some(Number.isNaN)) {
            return "";
        }

        const resultado = new Date(Date.UTC(partes[0], partes[1] - 1, partes[2] + dias));

        return resultado.toISOString().slice(0, 10);
    }

    function produtoSelecionado() {
        return produtos.find(function (produto) {
            return produto.valor === variedadeSelect.value;
        }) || null;
    }

    function preencherVariedades(cultura, valorManter) {
        const selecionado = valorManter === undefined ? variedadeSelect.value : valorManter;

        variedadeSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = cultura
            ? "Selecione a variedade"
            : "Selecione a cultura primeiro";
        variedadeSelect.appendChild(placeholder);

        if (cultura) {
            produtos
                .filter(function (produto) {
                    return produto.cultura === cultura;
                })
                .forEach(function (produto) {
                    const opcao = document.createElement("option");
                    opcao.value = produto.valor;
                    opcao.textContent = produto.rotulo;
                    opcao.setAttribute("data-cultura", produto.cultura);
                    opcao.setAttribute("data-variedade", produto.variedade);
                    opcao.setAttribute("data-ciclo", produto.ciclo);
                    variedadeSelect.appendChild(opcao);
                });
        }

        variedadeSelect.disabled = !cultura;

        if (selecionado) {
            const existe = Array.from(variedadeSelect.options).some(function (opcao) {
                return opcao.value === selecionado;
            });

            if (existe) {
                variedadeSelect.value = selecionado;
            }
        }

        if (!variedadeSelect.value) {
            variedadeSelect.selectedIndex = 0;
        }
    }

    function atualizarPrevisao() {
        const produto = produtoSelecionado();
        const ciclo = produto && produto.ciclo ? Number(produto.ciclo) : NaN;
        const temCiclo = Number.isFinite(ciclo) && ciclo > 0;

        cicloCampo.value = produto
            ? (temCiclo ? Math.trunc(ciclo) + " dias" : "Sem ciclo cadastrado")
            : "";

        const data = dataPlantio.value;

        if (produto && temCiclo && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
            previsaoCampo.value = formatarDataBR(somarDias(data, Math.trunc(ciclo)));

            if (avisoCiclo) {
                avisoCiclo.textContent =
                    "Previsão automática (data do plantio + ciclo). É apenas uma estimativa, não uma garantia de colheita.";
            }

            return;
        }

        previsaoCampo.value = "";

        if (avisoCiclo) {
            avisoCiclo.textContent = produto
                ? "Este produto não possui ciclo cadastrado; não é possível estimar a colheita."
                : "Selecione um produto com ciclo cadastrado para gerar a previsão.";
        }
    }

    preencherVariedades(culturaSelect.value, valorInicial);
    atualizarPrevisao();

    // ---------------------------------------------------------------------
    // Colheita: o plantio fica em progresso até o usuário informar a data real.
    // ---------------------------------------------------------------------
    const statusCampo = document.getElementById("status");
    const grupoDataColheita = document.getElementById("grupo-data-colheita");
    const dataColheita = document.getElementById("dataColheita");

    function atualizarCamposColheita() {
        if (!statusCampo || !grupoDataColheita || !dataColheita) {
            return;
        }

        const colhido = statusCampo.value === "colhido";
        grupoDataColheita.hidden = !colhido;
        dataColheita.required = colhido;

        if (colhido && dataPlantio.value) {
            dataColheita.min = somarDias(dataPlantio.value, 1);
        } else {
            dataColheita.removeAttribute("min");
        }
    }

    if (statusCampo && grupoDataColheita && dataColheita) {
        statusCampo.addEventListener("change", atualizarCamposColheita);
        dataColheita.addEventListener("input", function () {
            dataColheita.setCustomValidity("");
        });

        formulario.addEventListener("submit", function (evento) {
            if (statusCampo.value !== "colhido") {
                return;
            }

            if (
                dataColheita.value &&
                dataPlantio.value &&
                dataColheita.value <= dataPlantio.value
            ) {
                evento.preventDefault();
                dataColheita.setCustomValidity(
                    "A data da colheita deve ser posterior à data do plantio."
                );
                dataColheita.reportValidity();

                return;
            }

            dataColheita.setCustomValidity("");
        });

        atualizarCamposColheita();
    }

    culturaSelect.addEventListener("change", function () {
        preencherVariedades(culturaSelect.value, "");
        atualizarPrevisao();
    });

    variedadeSelect.addEventListener("change", atualizarPrevisao);
    dataPlantio.addEventListener("change", function () {
        atualizarPrevisao();
        atualizarCamposColheita();
    });
    dataPlantio.addEventListener("input", function () {
        atualizarPrevisao();
        atualizarCamposColheita();
    });
});
