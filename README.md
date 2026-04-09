# Steward

**Christian values-based financial advisory & portfolio screening platform.**

## What it does

- **Investment Screening** — analyse funds and look through to underlying holdings, categorising exposure into values categories (Alcohol, Tobacco, Gambling, Abortion, etc.), outputting a clean vs compromised breakdown
- **Portfolio Analysis** — combine multiple funds, aggregate exposure, support strict and weighted modes
- **Replacement Engine** — suggest alternative funds that reduce compromised exposure while maintaining similar risk/return profiles
- **Full Financial Planning (FNA)** — risk profiling, behavioural analysis, SA tax calculations (CGT, income tax, estate duty), estate & liquidity modelling
- **Compliance Layer** — FAIS-aligned, advice gating, Record of Advice (ROA) generation, full audit trail
- **Branded PDF Reports** — white-label, per-advisor branding on all client documents
- **Client Portal** — read-only portal for clients to view their reports and portfolio snapshot

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | NestJS, TypeORM, PostgreSQL |
| PDF Ingestion | Python (FastAPI, pdfplumber) |
| Hosting | AWS / Azure |
| Containerisation | Docker Compose (dev), ECS/AKS (prod) |

## Monorepo Structure

```
steward/
├── apps/
│   ├── web/          # Next.js 14 — advisor dashboard + client portal
│   └── api/          # NestJS — REST API + business logic
├── packages/
│   └── shared/       # Shared TypeScript types and DTOs
├── services/
│   └── ingestion/    # Python FastAPI microservice — PDF parsing
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Node.js >= 20
- Python >= 3.11
- Docker + Docker Compose

### Local Development

```bash
# Start all services (database, api, web, ingestion)
docker compose up

# Or run individually
npm run dev:api    # NestJS on :3001
npm run dev:web    # Next.js on :3000
# Python ingestion: cd services/ingestion && uvicorn main:app --reload
```

### Environment Variables

Copy `.env.example` to `.env` in each app directory and fill in the values. See each app's `README.md` for required variables.

## Development Partners

This repo is shared. See `CONTRIBUTING.md` for branch strategy and PR conventions.

## License

Private — all rights reserved.
