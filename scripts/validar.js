/**
 * Validação estática do projeto:
 *   - checa a sintaxe de todos os arquivos JavaScript;
 *   - compila todas as views EJS.
 *
 * Uso:
 *   npm test
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ejs = require("ejs");

const raiz = path.join(__dirname, "..");
const ignorar = new Set(["node_modules", ".git", "dist", "build", "coverage"]);
const falhas = [];
let arquivosJs = 0;
let arquivosEjs = 0;

function caminhar(diretorio, aoEncontrar) {
    fs.readdirSync(diretorio, { withFileTypes: true }).forEach((entrada) => {
        if (ignorar.has(entrada.name)) {
            return;
        }

        const completo = path.join(diretorio, entrada.name);

        if (entrada.isDirectory()) {
            caminhar(completo, aoEncontrar);
        } else {
            aoEncontrar(completo);
        }
    });
}

function verificarJavaScript(arquivo) {
    if (!arquivo.endsWith(".js")) {
        return;
    }

    arquivosJs += 1;

    const resultado = spawnSync(process.execPath, ["--check", arquivo], {
        encoding: "utf8"
    });

    if (resultado.status !== 0) {
        falhas.push(`JavaScript: ${path.relative(raiz, arquivo)}\n${resultado.stderr.trim()}`);
    }
}

function verificarEjs(arquivo) {
    if (!arquivo.endsWith(".ejs")) {
        return;
    }

    arquivosEjs += 1;

    try {
        ejs.compile(fs.readFileSync(arquivo, "utf8"), { filename: arquivo });
    } catch (erro) {
        falhas.push(`EJS: ${path.relative(raiz, arquivo)}\n${erro.message}`);
    }
}

caminhar(raiz, (arquivo) => {
    verificarJavaScript(arquivo);
    verificarEjs(arquivo);
});

console.log(`JavaScript verificado: ${arquivosJs} arquivo(s).`);
console.log(`Views EJS compiladas: ${arquivosEjs} arquivo(s).`);

if (falhas.length > 0) {
    console.error(`\n${falhas.length} falha(s) encontrada(s):\n`);
    falhas.forEach((falha) => console.error(`- ${falha}\n`));
    process.exitCode = 1;
} else {
    console.log("Nenhuma falha de sintaxe encontrada.");
}
