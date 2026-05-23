<p align="center">
  <img width="400" alt="Prince-Hunter-Background" src="https://github.com/user-attachments/assets/fd2c6ee4-ef6c-41da-a98b-a19317daacdb" />
</p>

<h1 align="center">Prince Hunter</h1>

<p align="center">
  <img src="https://github.com/DaviOts/Prince-Hunter/actions/workflows/ci.yml/badge.svg" alt="Prince-Hunter CI" />
  <br>
  <b>API de rastreamento e comparação de preços de jogos</b>
  <br>
  <a href="README.en.md">🇺🇸 Read in English</a>
</p>

---

## Sobre

Prince Hunter é uma API REST robusta construída com NestJS que monitora preços de jogos em múltiplas lojas digitais de forma assíncrona. O sistema utiliza uma arquitetura baseada em eventos e workers para garantir performance e escalabilidade.

### Funcionalidades Implementadas

- **Autenticação Segura** — Sistema de Login/Registro com JWT, Passport.js e hashing de senhas com bcrypt (cost 10).
- **Busca de preços em múltiplas lojas** — Steam (API direta) + Epic, GOG, Nuuvem, 2game (via IsThereAnyDeal API v2).
- **Processamento assíncrono** — Arquitetura de filas com BullMQ para scraping resiliente.
- **Histórico de preços** — Registro temporal de variações de preço por jogo e loja.
- **Cache Inteligente** — Redis integrado para otimização de chamadas de API externas.
- **Watchlist & Coleção Pessoal** — Relacionamento N:N otimizado. Permite aos usuários gerenciar jogos salvos com metadados estritos (Status, Notas, Reviews) e consultar os menores preços do mercado em tempo real usando JOINs que evitam queries N+1.
- **Segurança e Validação** — DTOs blindados com Zod e tratamento semântico de exceções HTTP.
- **CI/CD Integrado** — Esteira automatizada via GitHub Actions para validação de Lint, Testes e Build.

---

## Tech Stack

| Camada          | Tecnologia                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | [NestJS 11](https://nestjs.com/) (TypeScript)        |
| Autenticação    | Passport.js + JWT + Bcrypt                           |
| Banco de dados  | PostgreSQL 16 + [Prisma ORM](https://www.prisma.io/) |
| Cache & Queue   | Redis 7 + [BullMQ](https://docs.bullmq.io/)          |
| Validação       | Zod (Auth) + class-validator/class-transformer (Watchlist) |
| CI/CD           | GitHub Actions (Ubuntu + Docker Services)            |
| Documentação    | Swagger UI (`/api`)                                  |

---

## Padrões de Engenharia

O projeto segue diretrizes rigorosas de engenharia de software:

- **Clean Architecture & SOLID**: Separação clara entre Controllers, Services e Providers.
- **Strategy Pattern**: Implementação desacoplada para diferentes motores de scraping.
- **Fail-Fast**: Validação de entrada rigorosa no início do ciclo de vida da requisição.
- **Identificadores Únicos**: Uso de UUID para integridade referencial no banco de dados.

---

## Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) + Docker Compose
- Chave da [IsThereAnyDeal API](https://isthereanydeal.com/apps/my/)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/DaviOts/Prince-Hunter.git
cd Prince-Hunter

# 2. Instale as dependências
npm ci

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Gere um segredo JWT robusto: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Suba a infraestrutura
docker compose up -d

# 5. Sincronize o banco de dados
npx prisma db push

# 6. Inicie o servidor
npm run start:dev
```

---

## Endpoints Principais

### Auth
| Método | Rota             | Descrição                                 |
| ------ | ---------------- | ----------------------------------------- |
| `POST` | `/auth/register` | Registro de novo usuário                  |
| `POST` | `/auth/login`    | Autenticação e geração de JWT             |
| `GET`  | `/auth/me`       | Retorna dados do usuário logado (Guarded) |

### Games
| Método | Rota                  | Descrição                                      |
| ------ | --------------------- | ---------------------------------------------- |
| `POST` | `/games`              | Inicia busca de preços em background (Guarded) |
| `GET`  | `/games`              | Lista todos os jogos e preços atuais           |
| `GET`  | `/games/:slug/prices` | Histórico completo de preços                   |

### Watchlist
| Método   | Rota                    | Descrição                                         |
| -------- | ----------------------- | ------------------------------------------------- |
| `POST`   | `/watchlist/:slug`      | Adiciona um jogo à lista do usuário (Guarded)     |
| `GET`    | `/watchlist`            | Retorna a lista com detalhes do jogo e menor preço|
| `PATCH`  | `/watchlist/:slug`      | Atualiza status, review e nota (DTO Validated)    |
| `DELETE` | `/watchlist/:slug`      | Remove o jogo da coleção                          |

---

## Estrutura do Projeto

```
src/
├── auth/                     # JWT, Passport, Guards, Decorators
├── scraper/                  # Scraper engine & Store strategies
├── modules/                  # Business logic (Games, Stores, Prices)
├── database/                 # Prisma & Redis infrastructure
├── common/                   # Global filters, pipes and utils
└── main.ts                   # App bootstrapping
```

---

## Qualidade e CI/CD

O projeto utiliza **GitHub Actions** para garantir a saúde do código em cada contribuição:

1. **Linting**: Validação de estilo e boas práticas.
2. **Database Sync**: Validação de schema Prisma.
3. **Tests**: Execução de testes automatizados com Postgres e Redis em containers.
4. **Build**: Verificação de compilação TypeScript.

---

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](LICENSE).

<h4 align="center">Made By Otavszin א♥</h4>
<p align="center">
  <a href="https://github.com/DaviOts">github.com/DaviOts</a>
</p>
