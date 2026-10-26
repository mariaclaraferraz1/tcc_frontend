# Rural Tech

Sistema web de gestão rural desenvolvido com **Node.js + Express 5 + EJS + MySQL/MariaDB**.
O painel reúne cadastro de produtos, vendas, clientes, gastos, perdas, produção
(colheita e plantio), cálculo de lucro, relatórios, consultas e configurações da conta.

---

## 1. Requisitos

- Node.js 18 ou superior
- MySQL 8+ ou MariaDB 10.4+
- XAMPP/WAMP (opcional, para o banco local)

## 2. Instalação

```bash
npm install
```

## 3. Configuração

Copie o arquivo de exemplo e ajuste os valores:

```bash
copy .env.example .env        # Windows
cp .env.example .env          # Linux/macOS
```

Variáveis disponíveis:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `DB_HOST` | `localhost` | Host do banco |
| `DB_PORT` | `3306` | Porta do banco |
| `DB_USER` | `root` | Usuário do banco |
| `DB_PASSWORD` | *(vazio)* | Senha do banco |
| `DB_NAME` | `rural_tech` | Nome do banco |
| `DB_CONNECTION_LIMIT` | `10` | Conexões simultâneas do pool |
| `PORT` | `3000` | Porta do servidor |
| `NODE_ENV` | `development` | Ambiente da aplicação |
| `SESSION_COOKIE_NAME` | `ruraltech_sessao` | Nome do cookie de sessão |
| `SESSION_MAX_AGE_DAYS` | `7` | Validade da sessão em dias |
| `COOKIE_SECURE` | `false` | Use `true` apenas com HTTPS |

> O arquivo `.env` contém credenciais e **não deve ser versionado** (já está no `.gitignore`).

### Anexos enviados

Imagens de produto e comprovantes são validados no cliente e no servidor (até 2 MB)
e gravados em `public/uploads`. O banco guarda apenas o caminho do arquivo, o que
evita o limite de pacote do MySQL. Os arquivos são servidos somente para usuários
com sessão ativa; links externos continuam aceitos e são gravados como informados.
A pasta `public/uploads` também deve entrar na rotina de backup.

## 4. Banco de dados

O arquivo `banco.sql` é **completo e idempotente**: pode ser executado em um banco
vazio ou em um banco já existente. Ele cria o que falta, adiciona colunas, índices e
relacionamentos ausentes e **não remove** tabelas, colunas ou registros.

Com o XAMPP/MariaDB em execução:

```bash
# Backup recomendado antes de migrar
C:\xampp\mysql\bin\mysqldump.exe -u root rural_tech > backup_rural_tech.sql

# Aplicar o script
C:\xampp\mysql\bin\mysql.exe -u root < banco.sql
```

Também é possível importar pelo phpMyAdmin (`Importar` → `banco.sql`).

### O que o script faz

- Cria/atualiza as tabelas `usuarios`, `sessoes`, `clientes`, `produtos`, `vendas`,
  `gastos`, `perdas`, `producao` e `plantio`.
- Adiciona as colunas usadas pela aplicação (por exemplo `produtos.id_usuario`,
  `perdas.valor_unitario`, `producao.peso`, `producao.data_plantio`).
- Normaliza tipos antigos (`INT` → `DECIMAL`) e converte valores legados.
- Atribui produtos antigos sem dono ao menor `id_usuario` existente.
- Cria índices e chaves estrangeiras somente quando ainda não existem.

### Criar o primeiro usuário

A senha é armazenada com hash **scrypt**. Crie um usuário pela tela
`/criar-conta` ou pela linha de comando:

```bash
npm run criar-usuario -- "Maria Clara" "maria@exemplo.com" "Senha123"
```

Para converter senhas antigas em texto puro para hash:

```bash
npm run migrar-senhas
```

## 5. Execução

```bash
npm start       # produção
npm run dev     # desenvolvimento (reinicia ao salvar)
npm test        # sintaxe de todos os JS + compilação de todas as views EJS
npm run validar # mesmo que npm test
npm run testar-conexao
```

Acesse: <http://localhost:3000>

## 6. Funcionalidades

| Área | Rota | Descrição |
| --- | --- | --- |
| Login/Cadastro | `/login`, `/criar-conta` | Autenticação com sessão em banco |
| Início | `/inicio` | Resumo geral e atalhos |
| Comercial | `/comercial` | Visão geral de vendas, gastos e perdas |
| Produtos | `/produtos` | Listagem, busca, filtro e ações |
| Cadastro de produto | `/cadastro-produto` | Criar/editar produto com imagem |
| Vendas | `/vendas`, `/registrar-vendas` | Listagem e registro de vendas |
| Gastos | `/controle-de-gastos` | Cadastro e filtro de gastos |
| Perdas | `/perdas` | Registro de perdas com valor calculado |
| Lucros | `/lucros` | Lucro líquido por período |
| Relatórios | `/relatorios` | Resumo, relatórios e exportação CSV |
| Consulta | `/consulta` | Consultas dinâmicas por grupo e coluna |
| Produção | `/producao`, `/dados-colheita`, `/plantio` | Colheita e plantio |
| Configurações | `/configuracoes`, `/editar-perfil`, `/alterar-senha` | Conta e preferências |

### Regras de negócio

- **Venda**: o produto é selecionado do banco; preço e unidade vêm do cadastro.
  O total é calculado no cliente para conferência e **recalculado no servidor**.
  O estoque é decrementado na venda e devolvido ao excluir.
- **Perda**: `valor_total = quantidade × valor_unitario`, calculado no cliente e
  recalculado no servidor antes de salvar.
- **Lucro líquido**: `vendas − gastos − perdas`, sempre a partir dos dados do banco.
- **Relatórios e Consulta**: usam dados reais, respeitam o usuário logado e os
  filtros de período/critério.

## 7. Segurança

- Senhas com `crypto.scrypt` e salt individual.
- Sessões com token aleatório; no banco é gravado apenas o hash SHA-256.
- Cookie `HttpOnly` e `SameSite=Lax` (use `COOKIE_SECURE=true` com HTTPS).
- Consultas SQL parametrizadas em todos os models.
- Produtos, vendas, gastos, perdas e produção isolados por `id_usuario`.
- Anexos salvos em `public/uploads` são servidos apenas com sessão ativa.
- Exclusões usam `POST` e confirmação no navegador.

## 8. Estrutura

```
app.js                 # servidor Express
banco.sql              # schema + migrações idempotentes
src/config/            # conexão e constantes
src/models/            # acesso ao banco
src/routes/            # rotas HTTP
src/middleware/        # sessão, autenticação e erros
src/utils/             # validação, formatação e segurança
src/views/             # páginas EJS e partials
public/css/            # estilos (painel.css é o padrão)
public/js/             # scripts das telas
public/uploads/        # imagens e comprovantes enviados (não versionados)
scripts/               # utilitários de linha de comando
```

## 9. Problemas comuns

- **Erro de conexão**: confira `.env`, se o MySQL está rodando e se o banco existe.
- **Porta ocupada**: altere `PORT` no `.env`.
- **Tabela/coluna ausente**: execute `banco.sql` novamente; o script é idempotente.
- **Sessão não mantida**: verifique cookies no navegador e `COOKIE_SECURE`
  (deve ser `false` em HTTP).
- **Senha antiga não funciona**: rode `npm run migrar-senhas`.

## 10. Validação

### Executado neste ambiente (MariaDB 10.4.32 + Node.js)

- `npm test`: sintaxe de todos os JS e compilação de todas as views EJS.
- `banco.sql` aplicado duas vezes seguidas sem erros (idempotência confirmada).
- Login, criação de conta, logout e rehash automático de senha legada.
- CRUD de produto (criar, editar preservando imagem, desativar).
- Venda com preço/unidade do cadastro, total recalculado no servidor, baixa e
  devolução de estoque ao excluir.
- Gasto, perda (quantidade × valor unitário), plantio e colheita.
- Filtros de produtos, vendas, gastos e perdas; limpeza de filtros.
- Relatórios, consulta e APIs JSON com dados reais.
- Exportação CSV gerada pelo navegador e conferida no arquivo baixado.
- Upload real de imagem de produto com um arquivo de exatamente 2 MB, gravação em
  `public/uploads`, exibição autenticada e persistência do caminho no banco.
- Upload real de comprovante de gasto, com remoção do arquivo ao excluir o gasto.
- Edição de perfil, preferências, alteração de senha e rejeição da senha antiga.
- Navegação pelas principais telas sem erros de console e sem rolagem horizontal
  nas larguras simuladas de 390 px, 360 px e 320 px (menu incluído).
- Dados de teste removidos ao final; a base voltou a ter apenas o usuário original.

### Pendências recomendadas antes da entrega

1. Validar o layout em aparelhos físicos, não apenas na simulação de viewport.
2. Testar em Chrome, Firefox e Edge, incluindo upload de imagem/comprovante.
3. Executar com `COOKIE_SECURE=true` em um ambiente HTTPS real.
4. Restaurar o backup em uma base separada para ensaiar uma migração completa.
5. Definir usuário de banco com permissões restritas em produção (evitar `root`).
6. Configurar backup periódico do banco e da pasta `public/uploads`.
7. Garantir disco persistente para `public/uploads` no ambiente de produção.
