# TASKS - API

Tasks - API é uma aplicação backend robusta para gerenciamento de tarefas e usuários em um ambiente empresarial. Esta API oferece funcionalidades para autenticação, gerenciamento de empresas, usuários e tarefas, com controle de acesso baseado em funções.

## Sumário

- [Instalação](#instalação)
- [Executar Projeto](#executar-projeto)
- [Executar com Docker Compose](#executar-com-docker-compose)
- [Executar Tests](#executar-tests)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Gestão de Empresas (Tenants)](#gestão-de-empresas-tenants)
- [Gestão de Usuários](#gestão-de-usuários)
- [Gestão de Tarefas](#gestão-de-tarefas)
- [Diagrama de Entidade-Relacionamento](#diagrama-de-entidade-relacionamento)
- [Segurança e Performance](#segurança-e-performance)
- [Códigos de Erro por Entidade](#códigos-de-erro-por-entidade)

## Instalação

```bash
$ npm install
$ npm run seed # Executar seed do banco de dados
```

#### Variáveis de Ambiente

A aplicação utiliza diversas variáveis de ambiente para configurar parâmetros essenciais. A seguir, estão listadas as variáveis necessárias:

| Variável               | Descrição                                                                 |
|------------------------|---------------------------------------------------------------------------|
| `PORT`                 | Porta na qual a aplicação será executada.                                 |
| `NODE_ENV`             | Ambiente de execução (`development`, `production`, etc.).                 |
| `MYSQL_PASSWORD`       | Senha do usuário do banco de dados MySQL.                                 |
| `MYSQL_ROOT_PASSWORD`  | Senha do usuário root do banco de dados MySQL.                            |
| `MYSQL_DATABASE`       | Nome do banco de dados a ser utilizado.                                   |
| `MYSQL_USER`           | Nome do usuário do banco de dados MySQL.                                  |
| `DATABASE_URL`         | URL de conexão com o banco de dados.                                      |
| `PASSPHASE`            | Frase secreta utilizada para proteger a chave privada RSA.                 |
| `SECRET_KEY`           | Chave secreta utilizada para criptografia de dados sensíveis.              |
| `PRIVATE_KEY`          | Chave privada RSA.                                          |
| `PUBLIC_KEY`           | Chave pública RSA.                                           |

**Exemplo de arquivo `.env`:**

```env
PORT=3000
NODE_ENV=development
MYSQL_PASSWORD=seu_password_mysql
MYSQL_ROOT_PASSWORD=seu_root_password_mysql
MYSQL_DATABASE=tasks_db
MYSQL_USER=usuario_mysql
DATABASE_URL=mysql://usuario_mysql:seu_password_mysql@localhost:3306/tasks_db
PASSPHASE=sua_passphrase_secreta
SECRET_KEY=sua_chave_secreta
PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----..."
PUBLIC_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----..."
```

#### Geração de Chaves RSA

Para gerar o par de chaves RSA necessárias para a autenticação JWT, utilize o Makefile incluído no projeto. Siga os passos abaixo:

1. **Configurar os Parâmetros no Makefile**

   As variáveis `KEY_NAME` e `KEY_DIR` no Makefile determinam o nome e o diretório onde as chaves serão armazenadas. Por padrão, estão configuradas da seguinte forma:

   ```makefile
   KEY_NAME=task-jwt
   KEY_DIR=keys
   ```

   Você pode ajustar esses valores conforme necessário antes de gerar as chaves.

2. **Executar a Geração das Chaves**

   Abra o terminal na raiz do projeto e execute o comando:

   ```bash
   make 
   # or
   make generate_keys
   ```

   Este comando executa a tarefa `generate_keys`, que realiza os seguintes passos:

   - Cria o diretório definido em `KEY_DIR` se ele não existir.
   - Solicita ao usuário que insira uma passphrase para proteger a chave privada.
   - Gera uma chave privada RSA de 4096 bits protegida pela passphrase fornecida.
   - Gera a chave pública correspondente.

## Executar Projeto

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Executar com Docker Compose

Para executar a aplicação utilizando Docker Compose, siga os passos abaixo:

1. **Instale o Docker e o Docker Compose**: Certifique-se de que o Docker e o Docker Compose estão instalados em sua máquina. Você pode baixar o Docker [aqui](https://www.docker.com/get-started).

2. **Configurar variáveis de ambiente**: Crie um arquivo `.env` na raiz do projeto com as variáveis de ambiente necessárias.

3. **Construir e iniciar os containers**:

    ```bash
    $ docker-compose up --build
    ```

    Isso irá construir as imagens necessárias e iniciar os containers definidos no `docker-compose.yml`.

4. **Acessar a aplicação**: A API estará disponível em `http://localhost:3000` ou na porta definida no seu `docker-compose.yml`.

## Executar Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Autenticação e Autorização

- **SUPER_ADMIN** - Tem Acesso a tudo!

### `POST /v1/auth/login`

- **Descrição**: Autentica o usuário e retorna um token JWT.
- **Acesso**: **Público**
- **Permissões**: Qualquer usuário pode acessar para realizar login.

### `GET /v1/auth/me`

- **Descrição**: Retorna as informações do usuário autenticado.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode acessar.
  - `USER`: Pode acessar.

## Gestão de Empresas (Tenants)

### `POST /v1/company`

- **Descrição**: Cria uma nova empresa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode criar empresas.
  - `USER`: **Não tem permissão**.

### `GET /v1/company`

- **Descrição**: Lista todas as empresas.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode listar todas as empresas.
  - `USER`: **Não tem permissão** ou pode ver apenas sua própria empresa, dependendo das regras de negócio.

### `GET /v1/company/:id`

- **Descrição**: Visualiza detalhes de uma empresa específica.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode visualizar qualquer empresa.
  - `USER`: Pode visualizar apenas a empresa à qual está associado.

### `PUT /v1/company/:id`

- **Descrição**: Atualiza dados de uma empresa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode atualizar qualquer empresa.
  - `USER`: **Não tem permissão**.

### `DELETE /v1/company/:id`

- **Descrição**: Exclui uma empresa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode excluir empresas.
  - `USER`: **Não tem permissão**.

## Gestão de Usuários

### `POST /v1/company/:company_id/users`

- **Descrição**: Registra um usuário em uma empresa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode registrar usuários em qualquer empresa.
  - `USER`: **Não tem permissão**.

### `GET /v1/company/:company_id/users`

- **Descrição**: Lista todos os usuários de uma empresa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode listar usuários de qualquer empresa.
  - `USER`: Pode listar usuários apenas da sua própria empresa.

### `GET /v1/company/:company_id/users/:id`

- **Descrição**: Visualiza detalhes de um usuário específico.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode visualizar qualquer usuário.
  - `USER`: Pode visualizar apenas seus próprios dados.

### `PUT /v1/company/:company_id/users/:id`

- **Descrição**: Atualiza dados de um usuário.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode atualizar qualquer usuário.
  - `USER`: Pode atualizar apenas seus próprios dados.

### `DELETE /v1/company/:company_id/users/:id`

- **Descrição**: Exclui um usuário.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode excluir qualquer usuário.
  - `USER`: **Não tem permissão**.

## Gestão de Tarefas

### `POST /v1/company/:company_id/tasks`

- **Descrição**: Cria uma nova tarefa para uma empresa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode criar tarefas em qualquer empresa.
  - `USER`: Pode criar tarefas apenas na empresa à qual está associado.

### `GET /v1/company/:company_id/tasks`

- **Descrição**: Lista todas as tarefas de uma empresa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode listar tarefas de qualquer empresa.
  - `USER`: Pode listar tarefas apenas da sua própria empresa.

### `GET /v1/company/:company_id/tasks/:id`

- **Descrição**: Visualiza detalhes de uma tarefa específica.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode visualizar qualquer tarefa.
  - `USER`: Pode visualizar tarefas da sua empresa.

### `PUT /v1/company/:company_id/tasks/:id`

- **Descrição**: Atualiza uma tarefa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode atualizar qualquer tarefa.
  - `USER`: Pode atualizar tarefas atribuídas a si ou conforme regras da empresa.

### `DELETE /v1/company/:company_id/tasks/:id`

- **Descrição**: Exclui uma tarefa.
- **Acesso**: **Privado**
- **Permissões**:
  - `ADMIN`: Pode excluir qualquer tarefa.
  - `USER`: **Não tem permissão** ou conforme políticas da empresa.

## Diagrama de Entidade-Relacionamento

![Diagrama de Entidade-Relacionamento](http://www.plantuml.com/plantuml/png/fL51QiCm4Bpd5SB7GZxWKqfYGg1nZ9sSpH8jhgWb6Mb52Kd_tbrCQvCM0kt5dj6CTcViLIG8b6o_G4U6BYfRUpk0ksJgkb3goUXS6KS2Kn8IAHZNCNTWSKRF0O5Gjq2vqep8MEJZDEYVnn-BxssdYE7XAhHW-XaV8CPt7-QMu7jEK_DJiemLscdY7zCT8RuzJCVM7cTSOpm7Cv3nRZfb09HYhcHaGuB5ch2LlTFsNzDpNTCvpad-FvsILPbyeR5HSwgAkdtUx7Sbiw_tgIdgoJs57UzKHRdPbLj6kxAjwiEsBfg6sVgmhrwAOx6Hg-inlxhTbaj_LVA7SvMzGipk9HdFaWK77R8irZjjhCxQ2frEjly4)

## Segurança e Performance

### Segurança

- **Autenticação e Autorização**:
  - Todas as rotas privadas implementam middleware de autenticação para verificar a validade do token JWT.
  - A autorização é implementada para garantir que os usuários só acessem recursos aos quais têm permissão.
  
- **Proteção contra Ataques**:
  - Implementação de mecanismos de prevenção contra ataques comuns, como injeção de SQL, XSS e CSRF.

- **Gestão de Senhas**:
  - As senhas dos usuários são armazenadas de forma segura utilizando hashing bcrypt.
  
- **Validação de Dados**:
  - Todos os inputs são validados para evitar dados maliciosos e garantir a integridade das informações.

Claro! Abaixo está a seção de **Segurança** revisada com explicações mais técnicas, incorporando os detalhes da sua implementação de JWT e outros aspectos de segurança, sem mencionar diretamente as ferramentas utilizadas.

```markdown
## Segurança

### Autenticação e Autorização

A aplicação implementa um sistema robusto de autenticação e autorização utilizando tokens JWT (JSON Web Tokens). O fluxo de autenticação envolve a geração de um token no momento do login, que encapsula as informações do usuário e suas permissões. Esse token é então enviado nas requisições subsequentes para validar a identidade e as permissões do usuário.

**Gerenciamento de JWT:**

- **Geração de Tokens**:
  - **Chave Secreta e Chaves Pública/Privada**: Utilizo chaves configuradas via variáveis de ambiente para assinar os tokens, garantindo que apenas a aplicação possa gerar e verificar a autenticidade dos tokens.

  - **Algoritmo de Assinatura**: Utilizo o algoritmo `HS256` para assinar os tokens, proporcionando uma camada adicional de segurança.
  - **Tempo de Expiração**: Tempo de expiração de 1 hora para os tokens, limitando a janela de oportunidade para uso indevido em caso de comprometimento.
  - **Codificação**: Asseguro que os tokens sejam codificados em `utf-8` para compatibilidade e segurança na transmissão.

- **Verificação de Tokens**:
  - **Validação da Assinatura**: Verifica a assinatura do token utilizando a chave pública, garantindo que o token não foi adulterado.
  - **Algoritmos Permitidos**: Restringe a verificação aos algoritmos especificados para evitar ataques de troca de algoritmo.
  - **Retorno Tipado**: Retorna os dados decodificados do token com tipagem forte, facilitando o uso seguro das informações contidas no token.


- **Encerramento Gracioso**:
  - **Gestão de Conexões**: Implementação de procedimentos para finalizar conexões de maneira ordenada durante a manutenção ou em caso de falhas, evitando estados inconsistentes e potencial exposição a ataques durante o processo de shutdown.

### Performance

- **Otimização de Consultas**:
  - As consultas ao banco de dados são otimizadas para reduzir a latência e melhorar o tempo de resposta.
  
- **Escalabilidade**:
  - A aplicação está preparada para escalar horizontalmente, suportando aumento de carga através de containers Docker.
  


## Códigos de Erro por Entidade

A seguir estão os códigos de erro organizados por entidade, incluindo seus identificadores, descrições e códigos de status HTTP correspondentes.

### Autenticação e Autorização

| CÓDIGO | IDENTIFICADOR          | DESCRIÇÃO                                                   | HTTP STATUS       |
|--------|------------------------|-------------------------------------------------------------|-------------------|
| 1000   | AUTHENTICATION_FAILED  | Credenciais inválidas. O e-mail ou senha estão incorretos.  | 401 Unauthorized  |
| 1001   | TOKEN_EXPIRED          | Token JWT expirado. Faça login novamente.                   | 401 Unauthorized  |
| 1002   | TOKEN_INVALID          | Token JWT inválido.                                         | 401 Unauthorized  |
| 1030   | SESSION_EXPIRED        | Sessão expirada. Por favor, faça login novamente.           | 401 Unauthorized  |
| 1003   | ACCESS_DENIED          | Acesso negado. Você não tem permissão para este recurso.    | 403 Forbidden     |

### Gestão de Empresas (Tenants)

| CÓDIGO | IDENTIFICADOR          | DESCRIÇÃO                                                       | HTTP STATUS       |
|--------|------------------------|-----------------------------------------------------------------|-------------------|
| 1007   | COMPANY_NOT_FOUND      | Empresa não encontrada.                                         | 404 Not Found     |
| 1020   | INVALID_UUID_FORMAT    | Formato de UUID inválido para a empresa.                        | 400 Bad Request   |
| 1006   | DUPLICATE_ENTRY        | A empresa que você está tentando criar já existe.               | 409 Conflict      |
| 1021   | COMPANY_ID_MISMATCH    | ID da empresa não corresponde ao seu.                           | 403 Forbidden     |
| 1023   | DATABASE_ERROR         | Erro no banco de dados ao acessar empresas.                     | 500 Internal Server Error |
| 1005   | VALIDATION_ERROR       | Erro de validação nos dados da empresa.                         | 400 Bad Request   |
| 1003   | ACCESS_DENIED          | Acesso negado ao gerenciar empresas.                            | 403 Forbidden     |

### Gestão de Usuários

| CÓDIGO | IDENTIFICADOR           | DESCRIÇÃO                                                      | HTTP STATUS       |
|--------|-------------------------|----------------------------------------------------------------|-------------------|
| 1008   | USER_NOT_FOUND          | Usuário não encontrado.                                        | 404 Not Found     |
| 1011   | INVALID_ROLE            | Papel inválido ao criar ou atualizar um usuário.               | 400 Bad Request   |
| 1006   | DUPLICATE_ENTRY         | O usuário que você está tentando criar já existe.              | 409 Conflict      |
| 1019   | EMAIL_ALREADY_IN_USE    | O endereço de e-mail fornecido já está registrado.             | 409 Conflict      |
| 1022   | USER_ID_MISMATCH        | Você não tem permissão para acessar dados de outro usuário.    | 403 Forbidden     |
| 1027   | ASSIGNED_USER_NOT_FOUND | Usuário atribuído não encontrado.                              | 404 Not Found     |
| 1005   | VALIDATION_ERROR        | Erro de validação nos dados do usuário.                        | 400 Bad Request   |
| 1003   | ACCESS_DENIED           | Acesso negado ao gerenciar usuários.                           | 403 Forbidden     |
| 1028   | INSUFFICIENT_PERMISSIONS| Permissões insuficientes para esta operação.                   | 403 Forbidden     |
| 1029   | INVALID_CREDENTIALS_FORMAT | Formato de credenciais inválido.                            | 400 Bad Request   |
| 1018   | PASSWORD_TOO_WEAK       | A senha fornecida é muito fraca.                               | 400 Bad Request   |

### Gestão de Tarefas

| CÓDIGO | IDENTIFICADOR           | DESCRIÇÃO                                                       | HTTP STATUS       |
|--------|-------------------------|-----------------------------------------------------------------|-------------------|
| 1009   | TASK_NOT_FOUND          | Tarefa não encontrada.                                          | 404 Not Found     |
| 1026   | TASK_ALREADY_COMPLETED  | A tarefa já foi concluída. Não pode ser alterada.               | 400 Bad Request   |
| 1012   | INVALID_STATUS          | Status da tarefa inválido.                                      | 400 Bad Request   |
| 1020   | INVALID_UUID_FORMAT     | Formato de UUID inválido para a tarefa.                         | 400 Bad Request   |
| 1005   | VALIDATION_ERROR        | Erro de validação nos dados da tarefa.                          | 400 Bad Request   |
| 1027   | ASSIGNED_USER_NOT_FOUND | Usuário atribuído à tarefa não encontrado.                      | 404 Not Found     |
| 1003   | ACCESS_DENIED           | Acesso negado ao gerenciar tarefas.                             | 403 Forbidden     |
| 1028   | INSUFFICIENT_PERMISSIONS| Permissões insuficientes para esta operação.                    | 403 Forbidden     |

### Erros Gerais

| CÓDIGO | IDENTIFICADOR          | DESCRIÇÃO                                                       | HTTP STATUS       |
|--------|------------------------|-----------------------------------------------------------------|-------------------|
| 1004   | RESOURCE_NOT_FOUND     | Recurso não encontrado.                                         | 404 Not Found     |
| 1005   | VALIDATION_ERROR       | Erro de validação.                                              | 400 Bad Request   |
| 1013   | MISSING_PARAMETERS     | Parâmetros obrigatórios não fornecidos.                         | 400 Bad Request   |
| 1014   | INTERNAL_SERVER_ERROR  | Erro interno do servidor.                                       | 500 Internal Server Error |
| 1015   | METHOD_NOT_ALLOWED     | Método HTTP não permitido para este endpoint.                   | 405 Method Not Allowed |
| 1016   | UNSUPPORTED_MEDIA_TYPE | Tipo de mídia não suportado.                                    | 415 Unsupported Media Type |
| 1017   | RATE_LIMIT_EXCEEDED    | Limite de requisições excedido.                                 | 429 Too Many Requests |
| 1023   | DATABASE_ERROR         | Erro no banco de dados.                                         | 500 Internal Server Error |
| 1024   | SERVICE_UNAVAILABLE    | Serviço indisponível.                                           | 503 Service Unavailable |
| 1025   | INVALID_DATE_FORMAT    | Formato de data inválido.                                       | 400 Bad Request   |