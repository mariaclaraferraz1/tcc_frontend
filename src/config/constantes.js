const CATEGORIAS_PRODUTO = [
    "Grãos",
    "Hortaliças",
    "Frutas",
    "Leite e Derivados",
    "Carnes",
    "Insumos",
    "Outros"
];

const UNIDADES = [
    "kg",
    "sacas",
    "toneladas",
    "litros",
    "unidades",
    "caixas"
];

const FORMAS_PAGAMENTO = [
    "Pix",
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
    "Boleto Bancário",
    "Transferência (TED/DOC)",
    "Outro"
];

const CATEGORIAS_GASTO = [
    "Alimentação",
    "Aluguel/Espaço",
    "Equipamentos",
    "Impostos/Taxas",
    "Marketing/Anúncios",
    "Serviços Terceirizados",
    "Utilidades (Água/Luz/Internet)",
    "Outros"
];

const CLASSIFICACOES_GASTO = [
    "Produção",
    "Infraestrutura",
    "Transporte",
    "Outros"
];

const MOTIVOS_PERDA = [
    "Pragas",
    "Doenças",
    "Condições climáticas",
    "Seca",
    "Excesso de chuva",
    "Geada",
    "Problemas no armazenamento",
    "Problemas no transporte",
    "Outros"
];

const STATUS_PLANTIO = [
    { valor: "germinacao", rotulo: "Germinação" },
    { valor: "crescimento", rotulo: "Em crescimento" },
    { valor: "colheita", rotulo: "Pronto para colheita" }
];

module.exports = {
    CATEGORIAS_PRODUTO,
    UNIDADES,
    FORMAS_PAGAMENTO,
    CATEGORIAS_GASTO,
    CLASSIFICACOES_GASTO,
    MOTIVOS_PERDA,
    STATUS_PLANTIO
};
