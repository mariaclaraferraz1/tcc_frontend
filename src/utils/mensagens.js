const mensagens = {
    "login-necessario": {
        tipo: "erro",
        texto: "Faça login para continuar."
    },
    "sessao-expirada": {
        tipo: "erro",
        texto: "Sua sessão expirou. Entre novamente."
    },
    "login-ok": {
        tipo: "sucesso",
        texto: "Login realizado com sucesso."
    },
    "logout-ok": {
        tipo: "sucesso",
        texto: "Sessão encerrada com sucesso."
    },
    "credenciais-invalidas": {
        tipo: "erro",
        texto: "E-mail ou senha incorretos."
    },
    "conta-criada": {
        tipo: "sucesso",
        texto: "Conta criada com sucesso! Faça login para continuar."
    },
    "usuario-ja-existe": {
        tipo: "erro",
        texto: "Este e-mail já está cadastrado."
    },
    "email-em-uso": {
        tipo: "erro",
        texto: "Este e-mail já está sendo usado por outra conta."
    },
    "dados-invalidos": {
        tipo: "erro",
        texto: "Preencha todos os campos corretamente."
    },
    "produto-criado": {
        tipo: "sucesso",
        texto: "Produto cadastrado com sucesso."
    },
    "produto-atualizado": {
        tipo: "sucesso",
        texto: "Produto atualizado com sucesso."
    },
    "produto-removido": {
        tipo: "sucesso",
        texto: "Produto removido do catálogo. As movimentações já registradas foram preservadas."
    },
    "produto-nao-encontrado": {
        tipo: "erro",
        texto: "Produto não encontrado."
    },
    "produto-com-movimentacao": {
        tipo: "erro",
        texto: "Este produto possui movimentações e foi apenas desativado."
    },
    "venda-criada": {
        tipo: "sucesso",
        texto: "Venda registrada com sucesso."
    },
    "venda-removida": {
        tipo: "sucesso",
        texto: "Venda excluída e estoque devolvido com sucesso."
    },
    "venda-nao-encontrada": {
        tipo: "erro",
        texto: "Venda não encontrada."
    },
    "gasto-criado": {
        tipo: "sucesso",
        texto: "Gasto registrado com sucesso."
    },
    "gasto-removido": {
        tipo: "sucesso",
        texto: "Gasto excluído com sucesso."
    },
    "gasto-nao-encontrado": {
        tipo: "erro",
        texto: "Gasto não encontrado."
    },
    "perda-criada": {
        tipo: "sucesso",
        texto: "Perda registrada com sucesso."
    },
    "perda-removida": {
        tipo: "sucesso",
        texto: "Perda excluída com sucesso."
    },
    "perda-nao-encontrada": {
        tipo: "erro",
        texto: "Perda não encontrada."
    },
    "perfil-atualizado": {
        tipo: "sucesso",
        texto: "Perfil atualizado com sucesso."
    },
    "senha-atualizada": {
        tipo: "sucesso",
        texto: "Senha alterada com sucesso. Utilize a nova senha no próximo login."
    },
    "senha-atual-incorreta": {
        tipo: "erro",
        texto: "A senha atual informada está incorreta."
    },
    "senhas-diferentes": {
        tipo: "erro",
        texto: "A nova senha e a confirmação não são iguais."
    },
    "senha-fraca": {
        tipo: "erro",
        texto: "A nova senha deve ter pelo menos 8 caracteres, com letras e números."
    },
    "senha-igual": {
        tipo: "erro",
        texto: "A nova senha deve ser diferente da senha atual."
    },
    "preferencias-atualizadas": {
        tipo: "sucesso",
        texto: "Preferências atualizadas com sucesso."
    },
    "colheita-criada": {
        tipo: "sucesso",
        texto: "Colheita registrada com sucesso."
    },
    "colheita-removida": {
        tipo: "sucesso",
        texto: "Registro de colheita excluído com sucesso."
    },
    "colheita-nao-encontrada": {
        tipo: "erro",
        texto: "Registro de colheita não encontrado."
    },
    "plantio-criado": {
        tipo: "sucesso",
        texto: "Plantio registrado com sucesso."
    },
    "plantio-removido": {
        tipo: "sucesso",
        texto: "Plantio excluído com sucesso."
    },
    "plantio-nao-encontrado": {
        tipo: "erro",
        texto: "Plantio não encontrado."
    },
    "sem-registros": {
        tipo: "erro",
        texto: "Nenhum registro disponível para a operação."
    },
    "nao-autorizado": {
        tipo: "erro",
        texto: "Você não tem permissão para acessar este registro."
    }
};

function obterMensagem(chave) {
    if (!chave) {
        return null;
    }

    return mensagens[String(chave)] || {
        tipo: "erro",
        texto: String(chave)
    };
}

function mensagem(tipo, texto) {
    return { tipo, texto };
}

module.exports = {
    obterMensagem,
    mensagem
};
