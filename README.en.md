<p align="center">
  <img width="400" alt="Prince-Hunter-Background" src="https://github.com/user-attachments/assets/fd2c6ee4-ef6c-41da-a98b-a19317daacdb" />
</p>

<h1 align="center">Prince Hunter</h1>

<p align="center">
  <img src="https://github.com/DaviOts/Prince-Hunter/actions/workflows/ci.yml/badge.svg" alt="Prince-Hunter CI" />
  <br>
  <b>Game price tracking and comparison API — UNDER DEVELOPMENT</b>
  <br>
  <a href="README.md">🇧🇷 Leia em Português</a>
</p>

---

## About

Prince Hunter is a robust REST API built with NestJS that asynchronously monitors game prices across multiple digital storefronts. The system leverages an event-driven architecture and workers to ensure performance and scalability.

### Implemented Features

- **Secure Authentication** — Login/Registration system with JWT, Passport.js, and password hashing using bcrypt (cost 10).
- **Multi-store Price Search** — Steam (direct API) + Epic, GOG, Nuuvem, 2game (via IsThereAnyDeal API v2).
- **Asynchronous Processing** — Queue architecture with BullMQ for resilient scraping.
- **Price History** — Temporal tracking of price fluctuations per game and store.
- **Smart Caching** — Integrated Redis to optimize external API calls.
- **Watchlist & Personal Collection** — Optimized N:N relationships. Allows users to manage saved games with strict metadata (Status, Ratings, Reviews) and query the lowest market prices in real-time using JOINs to prevent N+1 queries.
- **Security & Validation** — Bulletproof DTOs with Zod and semantic HTTP exception handling.
- **Integrated CI/CD** — Automated pipeline via GitHub Actions for Linting, Testing, and Build validation.

---

## Tech Stack

| Layer           | Technology                                           |
| --------------- | ---------------------------------------------------- |
| Framework       | [NestJS 11](https://nestjs.com/) (TypeScript)        |
| Authentication  | Passport.js + JWT + Bcrypt                           |
| Database        | PostgreSQL 16 + [Prisma ORM](https://www.prisma.io/) |
| Cache & Queue   | Redis 7 + [BullMQ](https://docs.bullmq.io/)          |
| Validation      | Zod (Auth) + class-validator/class-transformer (Watchlist) |
| CI/CD           | GitHub Actions (Ubuntu + Docker Services)            |
| Documentation   | Swagger UI (`/api`)                                  |

---

## Engineering Standards

The project follows rigorous software engineering guidelines:

- **Clean Architecture & SOLID**: Clear separation between Controllers, Services, and Providers.
- **Strategy Pattern**: Decoupled implementation for different scraping engines.
- **Fail-Fast**: Strict input validation at the beginning of the request lifecycle.
- **Unique Identifiers**: Use of UUIDs for referential integrity in the database.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) + Docker Compose
- [IsThereAnyDeal API](https://isthereanydeal.com/apps/my/) Key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DaviOts/Prince-Hunter.git
cd Prince-Hunter

# 2. Install dependencies
npm ci

# 3. Configure environment variables
cp .env.example .env
# Generate a robust JWT secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Spin up the infrastructure
docker compose up -d

# 5. Synchronize the database
npx prisma db push

# 6. Start the server
npm run start:dev
```

---

## Main Endpoints

### Auth
| Method | Route            | Description                                |
| ------ | ---------------- | ------------------------------------------ |
| `POST` | `/auth/register` | Register a new user                        |
| `POST` | `/auth/login`    | Authenticate and generate JWT              |
| `GET`  | `/auth/me`       | Return authenticated user data (Guarded)   |

### Games
| Method | Route                 | Description                                      |
| ------ | --------------------- | ------------------------------------------------ |
| `POST` | `/games`              | Start background price search (Guarded)          |
| `GET`  | `/games`              | List all games and current prices                |
| `GET`  | `/games/:slug/prices` | Complete price history                           |

### Watchlist
| Method   | Route                   | Description                                       |
| -------- | ----------------------- | ------------------------------------------------- |
| `POST`   | `/watchlist/:slug`      | Add a game to the user's list (Guarded)           |
| `GET`    | `/watchlist`            | Return the list with game details and lowest price|
| `PATCH`  | `/watchlist/:slug`      | Update status, review, and rating (DTO Validated) |
| `DELETE` | `/watchlist/:slug`      | Remove the game from the collection               |

---

## Project Structure

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

## Quality and CI/CD

The project uses **GitHub Actions** to ensure code health on every contribution:

1. **Linting**: Style and best practices validation.
2. **Database Sync**: Prisma schema validation.
3. **Tests**: Automated test execution with Postgres and Redis in containers.
4. **Build**: TypeScript compilation verification.

---

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](LICENSE).

<h4 align="center">Made By Otavszin א♥</h4>
<p align="center">
  <a href="https://github.com/DaviOts">github.com/DaviOts</a>
</p>
