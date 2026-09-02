const btnPesquisar = document.getElementById("btnPesquisar");
const categoria = document.getElementById("categoria");
const tipoInformacao = document.getElementById("tipoInformacao");
const busca = document.getElementById("busca");
const areaResultados = document.getElementById("areaResultados");

btnPesquisar.addEventListener("click", function (){
    if (categoria.value === "" && busca.value.trim() === ""){
        areaResultados.innerHTML  = `
        <div class="icone-resultado"
            <i class="fa-solid fa-cicle-exclamation"></i>
            </div>
            
           <h3>Informe o que deseja pesquisar</h3>

            <p>
                Selecione uma categoria ou digite algo no campo de busca.
            </p>
        `;

        return;
    }

    areaResultados.innerHTML = `
        <div class="icone-resultado">
            <i class="fa-solid fa-magnifying-glass"></i>
        </div>

        <h3>Pesquisa realizada</h3>

        <p>
            Os resultados aparecerão aqui quando a consulta estiver integrada ao banco de dados.
        </p>
    `;
});