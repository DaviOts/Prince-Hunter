<p align="center">
  <img width="400" alt="Prince-Hunter-Background" src="https://github.com/user-attachments/assets/fd2c6ee4-ef6c-41da-a98b-a19317daacdb" />
</p>

<h1 align="center">🎯 Prince Hunter</h1>

<p align="center">
  <b>API de rastreamento e comparação de preços de jogos — EM DESENVOLVIMENTO</b>
</p>

---

## Sobre

Prince Hunter é uma API REST que monitora preços de jogos em múltiplas lojas digitais de forma assíncrona. Ao cadastrar um jogo, o sistema busca preços automaticamente em background via fila de processamento e mantém um histórico completo de variações de preço.

### Funcionalidades

- 🔍 **Busca de preços em múltiplas lojas** — Steam (API direta) + Epic, GOG, Nuuvem, 2game (via IsThereAnyDeal API v2)
- ⚡ **Processamento assíncrono** — scraping via BullMQ, response imediato ao cliente
- 📊 **Histórico de preços** — registra variações ao longo do tempo por jogo/loja
- 🧠 **Cache com Redis** — evita chamadas desnecessárias às APIs externas (TTL 1h)
- 🛡️ **Rate Limiting** — proteção contra abuso (100 req/min por IP)
- ✅ **Validação com Zod** — DTOs blindados na entrada

---

## Tech Stack

| Camada          | Tecnologia                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | [NestJS 11](https://nestjs.com/) (TypeScript)        |
| Banco de dados  | PostgreSQL 16 + [Prisma ORM](https://www.prisma.io/) |
| Cache & Queue   | Redis 7 + [BullMQ](https://docs.bullmq.io/)          |
| Validação       | [Zod](https://zod.dev/) via `nestjs-zod`             |
| Rate Limiting   | `@nestjs/throttler`                                  |
| Documentação    | Swagger UI (`/api`)                                  |
| Containerização | Docker Compose                                       |

---

## Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) + Docker Compose
- Chave da [IsThereAnyDeal API](https://isthereanydeal.com/apps/my/)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/DaviOts/Prince-Hunter.git
cd Prince-Hunter

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Preencha as variáveis no .env

# 4. Suba os containers (Postgres + Redis)
docker compose up -d

# 5. Execute as migrations e seed
npx prisma migrate dev
npx prisma db seed

# 6. Inicie o servidor
npm run start:dev
```

A API estará disponível em `http://localhost:3000` e o Swagger em `http://localhost:3000/api`.

---

## Endpoints

### Games

| Método | Rota                  | Descrição                                               |
| ------ | --------------------- | ------------------------------------------------------- |
| `POST` | `/games`              | Cadastra um jogo e inicia busca de preços em background |
| `GET`  | `/games`              | Lista todos os jogos com último preço por loja          |
| `GET`  | `/games?search=`      | Busca jogos por título (case-insensitive)               |
| `GET`  | `/games/:slug/prices` | Retorna histórico completo de preços de um jogo         |

### Stores

| Método | Rota      | Descrição                        |
| ------ | --------- | -------------------------------- |
| `GET`  | `/stores` | Lista todas as lojas cadastradas |

### Scraper

| Método | Rota                  | Descrição                             |
| ------ | --------------------- | ------------------------------------- |
| `GET`  | `/scraper/:gameTitle` | Busca preços diretamente (sem salvar) |

---

## Arquitetura

```
POST /games { title: "Cyberpunk 2077" }
    │
    ▼
GamesService
    ├── prisma.game.upsert()    → Salva game provisório
    ├── queue.add(job)          → Enfileira no BullMQ
    └── return 202              → Responde em ~50ms

    (Background - ScraperProcessor)
    ├── SteamStrategy.getPrice()    → Steam Store API
    ├── ItadStrategy.getPrice()     → ITAD v2 (Epic, GOG, Nuuvem, 2game)
    ├── prisma.game.update()        → Atualiza título canônico
    └── prisma.price.create()       → Salva preços no banco
```

### Strategy Pattern

Cada loja é uma implementação de `ScraperStrategy`:

```typescript
interface ScraperStrategy {
  readonly storeSlug: string;
  getPrice(gameTitle: string): Promise<PriceResult[]>;
}
```

Adicionar uma nova loja = criar uma nova strategy + registrar no module.

---

## Modelo de Dados

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│   Game   │       │  Price   │       │  Store   │
├──────────┤       ├──────────┤       ├──────────┤
│ id       │──┐    │ id       │    ┌──│ id       │
│ title    │  └───>│ gameId   │    │  │ name     │
│ slug     │       │ storeId  │<───┘  │ slug     │
│ imageUrl │       │ finalPrice│      │ url      │
│ createdAt│       │ original │       │ iconUrl  │
│ updatedAt│       │ discount │       └──────────┘
└──────────┘       │ currency │
                   │ url      │
                   │ createdAt│
                   └──────────┘
```

---

## Estrutura do Projeto

```
src/
├── cache/                    # CacheService (Redis abstraction)
├── common/
│   ├── filters/              # HttpExceptionFilter
│   └── utils/                # generateSlug utility
├── database/
│   ├── prisma/               # Schema, migrations, seed
│   └── redis/                # RedisService (ioredis wrapper)
├── modules/
│   ├── games/                # GamesModule (Controller, Service, DTO)
│   └── stores/               # StoresModule
├── scraper/
│   ├── strategies/           # SteamStrategy, ItadStrategy
│   ├── scraper.service.ts    # Orquestra strategies + cache
│   ├── scraper.processor.ts  # BullMQ worker (background)
│   └── scraper.module.ts
├── app.module.ts
└── main.ts
```

---

## Variáveis de Ambiente

| Variável       | Descrição                          |
| -------------- | ---------------------------------- |
| `PORT`         | Porta do servidor (default: 3000)  |
| `NODE_ENV`     | Ambiente (development/production)  |
| `POSTGRES_*`   | Credenciais do PostgreSQL          |
| `DATABASE_URL` | URL de conexão do Prisma           |
| `REDIS_HOST`   | Host do Redis (default: localhost) |
| `REDIS_PORT`   | Porta do Redis (default: 6379)     |
| `ITAD_API_KEY` | Chave da IsThereAnyDeal API        |
| `ORIGIN`       | Origem permitida no CORS           |

---

## License

This project is [MIT licensed](LICENSE).

---

<h4 align="center">Made By Otavszin א♥</h4>
<p align="center">
  <a href="https://github.com/DaviOts">github.com/DaviOts</a>
</p>
