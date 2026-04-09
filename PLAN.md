# Steward — Build Plan

**Christian Values-Based Financial Advisory & Portfolio Screening Platform**

> This document is the single source of truth for the Steward build. All implementation decisions, stage definitions, setup requirements, and deployment processes are recorded here.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Tech Stack](#2-tech-stack)
3. [Setup Requirements](#3-setup-requirements)
4. [Stage 0 — Project Scaffolding](#stage-0--project-scaffolding)
5. [Stage 1 — Database Schema](#stage-1--database-schema)
6. [Stage 2 — Investment Screening Engine](#stage-2--investment-screening-engine)
7. [Stage 3 — Portfolio Analysis Engine](#stage-3--portfolio-analysis-engine)
8. [Stage 4 — Replacement Engine](#stage-4--replacement-engine)
9. [Stage 5 — Financial Planning (FNA)](#stage-5--financial-planning-fna)
10. [Stage 6 — Compliance Layer](#stage-6--compliance-layer)
11. [Stage 7 — Report Generation](#stage-7--report-generation)
12. [Stage 8 — PDF Ingestion Service](#stage-8--pdf-ingestion-service)
13. [Stage 9 — Frontend (Next.js)](#stage-9--frontend-nextjs)
14. [Stage 10 — Client Portal](#stage-10--client-portal)
15. [Implementation Phases & Timeline](#implementation-phases--timeline)
16. [Deployment — Vercel & GitHub](#deployment--vercel--github)

---

## 1. App Overview

Steward is a structured advisory system built for South African financial advisors who screen investment portfolios against Christian ethical values. It is **not** a basic dashboard — it is a full end-to-end advisory workflow platform.

### What the platform does

| # | Feature | Summary |
|---|---------|---------|
| 1 | **Investment Screening** | Analyse fund holdings and categorise exposure (Alcohol, Tobacco, Gambling, Abortion, Weapons, Pornography, Cannabis). Output: % Clean vs % Compromised. |
| 2 | **Portfolio Analysis** | Combine multiple funds, calculate total exposure per category. Strict mode (fail if any) or Weighted mode (% exposure). |
| 3 | **Replacement Engine** | Suggest alternative funds that reduce compromised exposure while maintaining similar risk + return profiles. |
| 4 | **Full Financial Planning (FNA)** | Risk profiling, behavioural analysis, SA tax calculations (CGT, income tax, estate duty), estate + liquidity modelling. |
| 5 | **Compliance Layer** | FAIS-aligned. No advice without full client data. Record of Advice (ROA) generation. Full audit trail. |
| 6 | **Report Generation** | Branded PDF reports including portfolio analysis, clean vs compromised, tax, estate, and recommendations. |
| 7 | **Data Ingestion** | Upload PDF fund fact sheets, extract holdings automatically. Scheduled updates later. |

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS + Shadcn/ui | Port 3000 |
| **Backend API** | NestJS + TypeORM | Port 3001 |
| **PDF Ingestion** | Python 3.11 + FastAPI + pdfplumber | Port 8000 |
| **Database** | PostgreSQL 16 | Port 5432 |
| **Auth** | JWT (API) + NextAuth.js (Web) | |
| **File Storage** | AWS S3 | PDFs, reports, logos |
| **CDN** | CloudFront | Report delivery |
| **Containerisation** | Docker Compose (dev) | ECS / Azure Container Apps (prod) |
| **Hosting — Web** | Vercel | Next.js deployment |
| **Hosting — API** | AWS ECS Fargate or Railway | NestJS deployment |
| **Hosting — DB** | AWS RDS PostgreSQL 16 or Supabase | |
| **Monitoring** | AWS CloudWatch or Datadog | |

---

## 3. Setup Requirements

### Prerequisites

```
Node.js  >= 20.0.0
npm      >= 10.0.0
Python   >= 3.11
Docker Desktop (with Compose v2)
```

### Local development

```bash
# Clone the repo
git clone https://github.com/<org>/steward.git
cd steward

# Install Node dependencies
npm install

# Copy env files and fill in values (see each section below)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp services/ingestion/.env.example services/ingestion/.env

# Start all services
docker compose up
```

### Service URLs (local)

| Service | URL |
|---------|-----|
| Web (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/api/docs |
| Ingestion (FastAPI) | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

### Environment variables

**`apps/api/.env`**
```
DATABASE_URL=postgresql://steward:steward_dev@localhost:5432/steward_dev
JWT_SECRET=change_me_in_production
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=
OPENAI_API_KEY=        # optional — for AI-assisted holding classification
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=change_me_in_production
NEXTAUTH_URL=http://localhost:3000
```

**`services/ingestion/.env`**
```
DATABASE_URL=postgresql://steward:steward_dev@localhost:5432/steward_dev
PORT=8000
```

---

## Stage 0 — Project Scaffolding

**Goal:** All four services running locally with hot-reload and shared types.

### 0.1 Shared Package (`packages/shared`)

- TypeScript types and Zod/class-validator DTOs shared between API and Web
- **Entities:** `Fund`, `Holding`, `Category`, `Client`, `Portfolio`, `ScreeningResult`, `Report`, `Advisor`, `ROA`
- **Enums:** `RiskProfile`, `BehaviourType`, `TaxResidency`, `ComplianceStatus`, `ScreeningMode`
- **Constants:** `COMPROMISE_CATEGORIES` — `['Alcohol', 'Tobacco', 'Gambling', 'Abortion', 'Weapons', 'Pornography', 'Cannabis']`

### 0.2 NestJS API (`apps/api`)

- NestJS init with TypeORM + PostgreSQL driver
- Config module (env vars via `.env`)
- JWT Auth module (advisor login)
- Database migrations setup
- Global validation pipe + exception filter
- Swagger / OpenAPI at `/api/docs`
- Health check: `GET /health`

### 0.3 Next.js Web (`apps/web`)

- Next.js 14 App Router + Tailwind CSS
- Shadcn/ui component library
- NextAuth.js (advisor session)
- Axios API client pointed at NestJS
- Layout: sidebar navigation + topbar + advisor branding slot

### 0.4 Python Ingestion Service (`services/ingestion`)

- FastAPI app with single router
- pdfplumber for PDF parsing
- psycopg2 / SQLAlchemy for PostgreSQL writes
- Endpoints:
  - `POST /upload` — accept PDF, start async job, return `job_id`
  - `GET /status/{job_id}` — polling endpoint for processing status

### 0.5 Docker & Environment

- All four services running via `docker compose up`
- `.env.example` files for each service
- Volume mounts for hot-reload in dev

---

## Stage 1 — Database Schema

**Goal:** Full PostgreSQL schema with TypeORM entities and migrations.

### Tables

| Table | Key Columns |
|-------|------------|
| `advisors` | `id`, `name`, `email`, `password_hash`, `firm_name`, `logo_url`, `fsp_number`, `created_at` |
| `clients` | `id`, `advisor_id`, `first_name`, `last_name`, `id_number`, `tax_number`, `dob`, `risk_profile`, `kyc_complete`, `created_at` |
| `funds` | `id`, `isin`, `name`, `provider`, `asset_class`, `region` (SA/Global), `benchmark`, `ter`, `inception_date` |
| `holdings` | `id`, `fund_id`, `company_name`, `isin`, `weight_pct`, `sector`, `country` |
| `compromise_flags` | `id`, `holding_id`, `category` (enum), `confidence_score`, `flagged_by` (manual/ai), `notes` |
| `portfolios` | `id`, `client_id`, `name`, `total_value`, `currency`, `created_at` |
| `portfolio_funds` | `id`, `portfolio_id`, `fund_id`, `allocation_pct`, `units`, `value` |
| `screening_results` | `id`, `portfolio_id`, `mode` (strict/weighted), `clean_pct`, `report_json`, `created_at` |
| `category_exposures` | `id`, `screening_result_id`, `category`, `exposure_pct`, `affected_funds_count` |
| `replacement_suggestions` | `id`, `screening_result_id`, `original_fund_id`, `suggested_fund_id`, `reason`, `similarity_score` |
| `financial_plans` | `id`, `client_id`, `advisor_id`, `risk_score`, `liquidity_needs`, `estate_value`, `created_at` |
| `tax_calculations` | `id`, `financial_plan_id`, `cgt_liability`, `income_tax`, `estate_duty`, `marginal_rate`, `tax_year` |
| `records_of_advice` | `id`, `client_id`, `advisor_id`, `advice_date`, `advice_summary`, `pdf_url`, `signed_at` |
| `audit_logs` | `id`, `advisor_id`, `client_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `timestamp` |
| `ingestion_jobs` | `id`, `fund_id`, `filename`, `status`, `error_message`, `started_at`, `completed_at` |

---

## Stage 2 — Investment Screening Engine

**Goal:** Core logic that analyses fund holdings and classifies ethical exposure.

### `ScreeningService` functions

| Function | Description |
|----------|------------|
| `screenFund(fundId)` | Analyse all holdings in a fund, return `FundScreeningResult` |
| `screenPortfolio(portfolioId, mode)` | Aggregate fund results across a portfolio |
| `calculateCleanPct(holdings[])` | Returns `{ cleanPct, compromisedPct, byCategory }` |
| `flagHolding(holdingId, category, confidence)` | Write to `compromise_flags` |

**Controller endpoints:**
- `POST /screening/fund/:fundId`
- `POST /screening/portfolio/:portfolioId`

### Category classification

- Primary: curated manual flag table (company → category mapping)
- Optional AI-assist: OpenAI API to classify ambiguous companies
- Confidence scoring: `1.0` = manual/certain, `0.5–0.9` = AI inferred

### Screening modes

- **Strict mode:** any holding with any flag → portfolio fails
- **Weighted mode:** `exposure = Σ(holding_weight × compromise_flag_weight)` per category

### Look-through logic

- If a holding is itself a fund (ETF, feeder fund) → recursively screen its sub-holdings
- Depth limit: 3 levels
- Flag source tracked per level for audit

---

## Stage 3 — Portfolio Analysis Engine

**Goal:** Combine multiple funds into a client portfolio and produce aggregate exposure.

### `PortfolioService` functions

| Function | Description |
|----------|------------|
| `createPortfolio(clientId, funds[])` | Save `Portfolio` + `PortfolioFund` records |
| `analysePortfolio(portfolioId)` | Call ScreeningService per fund, aggregate results |
| `getExposureBreakdown(portfolioId)` | Return `CategoryExposure[]` with % per category |
| `comparePortfolios(portfolioIdA, portfolioIdB)` | Diff report between two portfolios |

**Controller endpoints:**
- `POST /portfolios`
- `GET /portfolios/:id`
- `GET /portfolios/:id/analysis`

### Allocation-weighted exposure formula

```
ExposurePerCategory = Σ(fund_allocation_pct × fund_category_exposure_pct)
```

Output per category: exposure %, contributing fund list, flagged company list.

---

## Stage 4 — Replacement Engine

**Goal:** Suggest cleaner fund alternatives with similar risk/return profiles.

### `ReplacementService` functions

| Function | Description |
|----------|------------|
| `findReplacements(fundId, maxExposurePct)` | Return `ReplacementSuggestion[]` |
| `scoreSimilarity(fund, candidate)` | Composite similarity score |
| `rankCandidates(suggestions[])` | Sort by similarity DESC, clean_pct DESC |

### Similarity scoring weights

| Factor | Weight |
|--------|--------|
| Asset class match | 40% |
| Region match | 20% |
| TER within 0.5% | 20% |
| Historic return correlation | 20% |

### Logic flow

1. Identify all funds in portfolio with `category_exposure_pct > threshold`
2. Query fund universe for candidates in same asset class + region
3. Score each candidate against original fund
4. Return top 3 per fund, annotated with exposure reduction delta

**Controller endpoint:** `POST /portfolios/:id/replacements`

---

## Stage 5 — Financial Planning (FNA)

**Goal:** Complete financial needs analysis — risk, tax, estate, behaviour.

### Risk Profiling

**`RiskProfilingService`**
- `scoreRiskProfile(answers: RiskAnswer[])` → `RiskProfile` enum (Conservative → Aggressive)
- `mapProfileToAssetAllocation(profile)` → `{ equity_pct, bond_pct, cash_pct, property_pct }`
- 10-question standardised questionnaire with weighted scoring

**`RiskProfile` enum values:**
- Conservative · Moderate Conservative · Moderate · Moderate Aggressive · Aggressive

### Behavioural Analysis

**`BehaviourService`**
- `assessBehaviourBias(answers[])` → `BehaviourProfile { lossAversion, herding, recencyBias }`
- `generateBehaviourNotes(profile)` → plain-language advisor notes for inclusion in report

### SA Tax Calculations

**`TaxService`**

| Function | Description |
|----------|------------|
| `calculateCGT(disposalGain, taxYear)` | Returns `{ grossGain, annualExclusion, inclusionRate, taxableGain, cgtLiability }` |
| `calculateIncomeTax(taxableIncome, taxYear)` | Uses SARS tax tables (updated per tax year) |
| `calculateEstateDuty(estateValue, spouseRebate)` | Returns `{ dutiableEstate, duty, abatement }` |
| `calculateDividendWithholdingTax(dividends)` | Flat 20% |

**SA Tax constants (update annually per SARS):**

| Constant | Value |
|----------|-------|
| CGT annual exclusion (individuals) | R 40,000 |
| CGT inclusion rate (individuals) | 40% |
| Estate duty rate (≤ R30m) | 20% |
| Estate duty rate (> R30m excess) | 25% |
| Dividend withholding tax | 20% |

### Estate & Liquidity Modelling

**`EstateService`**
- `modelEstate(clientId)` → full estate breakdown: assets, liabilities, estate duty, executor fees
- `calculateLiquidityShortfall(estate)` → liquid assets vs total liabilities + duties
- `projectEstateTo(clientId, targetAge)` → growth-adjusted projection

---

## Stage 6 — Compliance Layer

**Goal:** Enforce FAIS requirements. No advice without complete client data. Full audit trail.

### Compliance Guard

**`ComplianceGuard`** — NestJS guard applied to all advice endpoints.

Checks before any advice is generated:
- `kyc_complete = true`
- Risk profile completed
- FICA documents uploaded
- Source of wealth declared

If any check fails → `403 Forbidden` with specific reason returned to advisor UI.

### Record of Advice (ROA)

**`ROAService`**

| Function | Description |
|----------|------------|
| `generateROA(clientId, adviceSession)` | Populate ROA template, render PDF via Puppeteer, upload to S3 |
| `signROA(roaId, signatureData)` | Mark `signed_at`, write event to `audit_logs` |
| `getROAHistory(clientId)` | All ROAs in reverse chronological order |

### Audit Trail

**`AuditService`** — triggered automatically by:
- Every screening run
- Every report generated
- Every ROA created or signed
- Every client data update
- Every login event

Writes to `audit_logs` with `advisor_id`, `client_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `timestamp`.

---

## Stage 7 — Report Generation

**Goal:** Generate branded PDF reports for advisor and client.

### `ReportService` (Puppeteer — HTML → PDF → S3)

| Function | Description |
|----------|------------|
| `generatePortfolioReport(portfolioId, advisorId)` | Full branded portfolio + screening PDF |
| `generateFNAReport(financialPlanId)` | Full FNA summary PDF |
| `uploadReportToS3(pdf, key)` | Save and return S3 key |
| `getReportUrl(reportId)` | Return pre-signed S3 URL (15 min expiry) |

### Report sections

1. Cover page (advisor branding, client name, date)
2. Executive summary
3. Portfolio composition (fund list, allocations, asset class breakdown)
4. Screening results (clean % vs compromised % — donut chart, category table)
5. Flagged holdings detail (company, category, weight in portfolio)
6. Replacement recommendations
7. Risk profile summary
8. Tax calculations (CGT, income tax, estate duty)
9. Estate liquidity modelling
10. Recommendations + compliance disclaimer
11. Record of Advice signature block

### Advisor branding

- Advisor uploads logo via Settings page → stored in S3
- Report templates use: `firm_name`, `logo_url`, `fsp_number`, `primary_colour_hex`
- White-label ready — no Steward branding visible to clients

---

## Stage 8 — PDF Ingestion Service

**Goal:** Parse PDF fund fact sheets to automatically populate fund holdings data.

### Python FastAPI Service (`services/ingestion`)

| Function | Description |
|----------|------------|
| `parse_fund_factsheet(pdf_bytes)` | Extract holdings table using pdfplumber |
| `normalise_holding(raw_row)` | Map to `{ company_name, isin, weight_pct, sector }` |
| `upsert_holdings(fund_id, holdings[])` | Write to PostgreSQL |
| `classify_holdings(holdings[])` | Run against compromise flag lookup table |

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Multipart PDF upload, returns `{ job_id }` |
| `GET` | `/status/{job_id}` | Polling — returns `{ status, progress, error }` |
| `GET` | `/funds/{fund_id}/holdings` | Returns extracted holdings for a fund |

### Parsing strategy

- **Primary:** pdfplumber table extraction (structured PDFs)
- **Fallback:** regex-based text parsing for non-tabular PDFs
- ISIN detection: `[A-Z]{2}[A-Z0-9]{9}[0-9]`
- Weight detection: regex for percentages adjacent to company names
- All raw extractions logged to `ingestion_jobs` for review

---

## Stage 9 — Frontend (Next.js)

**Goal:** Full advisor UI covering all features.

### Routes

| Route | Feature |
|-------|---------|
| `/login` | Advisor authentication |
| `/dashboard` | Overview stats, recent clients, pending ROAs |
| `/clients` | Client list with KYC status indicators |
| `/clients/new` | Multi-step client onboarding (personal → financial → KYC → risk) |
| `/clients/:id` | Client detail — profile, portfolios, ROAs, audit log |
| `/portfolios/:id` | Portfolio detail — fund list, allocation chart |
| `/portfolios/:id/screening` | Screening results — donut chart, category breakdown table |
| `/portfolios/:id/replacements` | Replacement suggestions — original vs suggested fund cards |
| `/funds` | Fund universe browser — search, filter by region/asset class |
| `/funds/upload` | PDF fact sheet uploader with progress indicator |
| `/fna/:clientId` | Full FNA workflow — risk quiz → behaviour → tax inputs → estate |
| `/reports` | Report list — generate, preview, download |
| `/compliance` | ROA management, audit trail |
| `/settings` | Advisor branding, firm details, password |
| `/portal/*` | Client portal (read-only, see Stage 10) |

### Key UI components

| Component | Description |
|-----------|------------|
| `ScreeningDonut` | Clean vs compromised donut chart (Recharts) |
| `CategoryBreakdownTable` | Expandable rows per compromise category |
| `FundComparisonCard` | Original vs replacement fund side-by-side |
| `RiskProfileSlider` | Visual risk profile result display |
| `TaxSummaryCard` | CGT / income tax / estate duty breakdown |
| `ROAViewer` | PDF preview + digital signing interface |
| `ComplianceStatusBadge` | Green / amber / red KYC status per client |
| `IngestionProgress` | Real-time PDF parsing progress bar |
| `BrandingUploader` | Logo upload + colour picker for advisor settings |

---

## Stage 10 — Client Portal

**Goal:** Read-only portal for clients to view their portfolio and reports.

- **Separate auth** — client credentials, not advisor credentials
- **Branded** — displays advisor firm logo and name
- **Routes:**
  - `/portal/dashboard` — summary of portfolio value, clean % score
  - `/portal/portfolio` — fund list and allocation breakdown
  - `/portal/reports` — downloadable PDF reports
- **Restrictions:** No data editing, no advice generation, no advisor tools visible

---

## Implementation Phases & Timeline

| Phase | Stages | Deliverable | Est. Duration |
|-------|--------|-------------|---------------|
| **Phase 1** | 0 + 1 | Running monorepo, DB schema, auth working | Week 1 |
| **Phase 2** | 2 + 3 | Screening + Portfolio engines via API | Week 2 |
| **Phase 3** | 4 + 5 | Replacement engine + full FNA | Week 3 |
| **Phase 4** | 6 + 7 | Compliance layer + PDF report generation | Week 4 |
| **Phase 5** | 8 | PDF ingestion service | Week 5 |
| **Phase 6** | 9 + 10 | Full frontend UI + client portal | Weeks 6–8 |

> Accuracy and structure matter more than speed. Each phase should be tested and reviewed before proceeding to the next.

---

## Deployment — Vercel & GitHub

### Overview

The deployment model uses:
- **GitHub** as the central code repository (single source of truth)
- **Vercel** connected to the GitHub repository for automatic Next.js deployments
- Both advisors (you and your partner) deploy by pushing or merging to GitHub — Vercel handles the rest automatically

### Step 1 — GitHub Repository Setup

If not already done:

```bash
# From the project root
git remote add origin https://github.com/<your-org-or-username>/steward.git
git branch -M main
git push -u origin main
```

**Branch strategy:**

| Branch | Purpose |
|--------|---------|
| `main` | Production — every merge here triggers a Vercel production deploy |
| `develop` | Shared development branch — staging preview on Vercel |
| `feature/*` | Individual feature branches — Vercel preview URL per branch |

Both you and your partner should work on `feature/*` branches and merge to `develop` for review, then `develop` → `main` for production.

### Step 2 — Vercel Team Setup (Important for two people)

To allow both you and your partner to deploy to the **same Vercel project**, you need a **Vercel Team** (not a personal account):

1. Go to [vercel.com](https://vercel.com) → click your avatar → **Create Team**
2. Name the team (e.g. `steward-app`)
3. **Invite your partner** via Settings → Members → Invite → enter their email
4. They accept the invite and join the team

> Individual Vercel accounts cannot share the same project. A Team plan is required for collaboration. The Hobby plan allows teams but with limitations. The Pro plan ($20/month per member) is recommended for production.

### Step 3 — Connect GitHub to Vercel

1. Inside the Vercel Team dashboard → **New Project**
2. Select **Import Git Repository** → connect your GitHub account
3. Select the `steward` repository
4. **Root Directory:** set to `apps/web` (since this is a monorepo and only the Next.js app deploys to Vercel)
5. Framework preset: **Next.js** (auto-detected)
6. Click **Deploy**

> The NestJS API and Python ingestion service are **not** deployed to Vercel. Vercel is for Next.js only. The API deploys separately to AWS ECS, Railway, or Render.

### Step 4 — Environment Variables on Vercel

In the Vercel project → **Settings → Environment Variables**, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.your-domain.com` | Production |
| `NEXT_PUBLIC_API_URL` | `https://api-staging.your-domain.com` | Preview |
| `NEXTAUTH_SECRET` | (strong random string) | All |
| `NEXTAUTH_URL` | `https://your-vercel-domain.vercel.app` | All |

> Never commit secrets to the repository. Only use Vercel environment variables for sensitive values.

### Step 5 — How Both People Deploy

Once the Vercel Team and GitHub repository are connected:

**Automatic deployment (recommended workflow):**

```
feature/my-feature branch  →  pull request  →  merge to develop  →  preview deploy
develop                    →  pull request  →  merge to main      →  production deploy
```

Both team members can:
- Push branches → Vercel automatically creates a **preview URL** for every branch/PR
- Merge to `develop` → triggers **staging preview** deployment
- Merge to `main` → triggers **production** deployment

**Manual deployment (optional):**

Either team member can trigger a redeploy from the Vercel dashboard:
- Go to the project → **Deployments** → click **Redeploy** on any deployment

### Step 6 — Custom Domain (Optional)

1. Vercel project → **Settings → Domains**
2. Add your domain (e.g. `app.stewardwealth.co.za`)
3. Update your DNS records as shown by Vercel
4. Set `NEXTAUTH_URL` environment variable to the custom domain

### Vercel + GitHub Actions (optional CI/CD enhancement)

For running tests before deployment, add a GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main, develop]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test
```

Vercel will only deploy after this CI check passes if you enable **Required status checks** in GitHub branch protection settings.

### Summary — What each person needs

| Person | What they need |
|--------|---------------|
| You (owner) | GitHub repo owner, Vercel Team owner, invite sent to partner |
| Partner | GitHub account added as repo collaborator, Vercel Team member (accept invite) |
| Both | Clone the repo, set up local `.env` files, push feature branches |

---

## Development Build-Out Plan — Execution Roadmap

> This section is the active execution roadmap. Each phase builds directly on the previous. Phases 1–3 focus on the web frontend (the biggest gap). Phases 4–6 complete advanced features. Phase 7 hardens the API. Phase 8 upgrades ingestion. Phase 9 prepares for production.

---

### Phase 1 — Foundation & Shared Infrastructure

*Everything else depends on this. All steps ran in parallel on 9 April 2026.*

**Decisions:**
- State management: **TanStack Query** — fits the server-heavy data model, no Redux needed
- UI library: **Shadcn/ui + Tailwind** (already referenced above)
- Charts: **Recharts** — already installed
- Notifications: **Sonner** toast library
- Client Portal: navigation link available now, detail built later
- Mobile app: excluded from this roadmap

**Steps completed:**

1. Install `@tanstack/react-query`, `@tanstack/react-query-devtools`, `sonner`
2. Install Shadcn/ui via CLI (`init --defaults`) + add components: `button card input label badge table select tabs dialog sheet form separator skeleton dropdown-menu avatar`
3. Create `apps/web/components.json` + update `globals.css` with Shadcn CSS variables
4. Update `tailwind.config.js` for Shadcn colour tokens
5. Update `apps/web/src/lib/utils.ts` — `cn()` utility
6. Update `apps/web/src/app/providers.tsx` — wrap with `QueryClientProvider` + `<Toaster />`
7. Build `apps/web/src/components/layout/Sidebar.tsx` — full nav with all routes + Client Portal link
8. Build `apps/web/src/components/layout/Topbar.tsx` — advisor name, firm, logout
9. Create `apps/web/src/lib/hooks/` — typed TanStack Query hooks for all API endpoints

---

### Phase 2 — Core Dashboard Pages

**2A — Dashboard Home** (`dashboard/page.tsx`)
- Real stat cards: Total Clients, Portfolios Screened, Pending ROAs, Reports Generated
- Recent clients table (last 5, KYC status badges)
- Recent audit activity feed

**2B — Clients Module**
- `clients/page.tsx` — searchable/sortable table, KYC badges, "New Client" CTA
- `clients/new/page.tsx` — multi-step form: Personal → Financials → KYC flags
- `clients/[id]/page.tsx` — tabbed detail: Profile | Portfolios | Plans | ROAs | Audit

**2C — Portfolios Module**
- `portfolios/page.tsx` — card grid by client, total value, screening badge
- `portfolios/new/page.tsx` — client selector + fund allocations (must sum to 100%)
- `portfolios/[id]/page.tsx` — fund breakdown table, screening summary, "Run Screening" button

**2D — Funds Module**
- `funds/page.tsx` — filterable browser (asset_class, region), fund info cards
- `funds/[id]/page.tsx` — holdings table with compromise flags
- `funds/upload/page.tsx` — PDF upload → ingestion polling → extracted holdings preview

---

### Phase 3 — Financial Planning (FNA) Wizard

- `fna/page.tsx` — multi-step wizard per client:
  - Step 1: Risk Questionnaire (10 questions, 1–5 scale) from `GET /fna/questions/risk`
  - Step 2: Behavioural Bias (8 questions) from `GET /fna/questions/behaviour`
  - Step 3: Financial inputs (income, estate value, liquidity needs)
  - Step 4: Results — Risk Profile card, Asset Allocation pie, Behaviour Radar chart, full Tax Summary
- Reusable `TaxSummaryCard` component (income tax bracket, CGT, estate duty)
- `POST /fna/clients/:clientId/plan`

---

### Phase 4 — Screening & Replacement UI

- **Screening Results** (embedded in Portfolio Detail):
  - Donut chart: clean% vs compromised%
  - Category exposure bar chart per compromise category
  - Pass/Fail badge per screening mode
- **CategoryBreakdownTable** component — expandable rows per category with affected funds
- **Replacement Suggestions** page/panel:
  - Side-by-side fund comparison cards (original vs suggested)
  - Similarity score, exposure reduction %
  - "Swap Fund" action
- Wire `POST /portfolios/:id/replacements`

---

### Phase 5 — Compliance & Reports

- **Compliance page** (`compliance/page.tsx`):
  - ROA list: `GET /compliance/roa/client/:clientId`
  - Create ROA form (client, date, summary) → `POST /compliance/roa`
  - Digital signature capture (`signature_pad`) → `PATCH /compliance/roa/:id/sign`
- **Audit Trail** table — action, client, advisor, timestamp, expandable metadata
- **Reports page** (`reports/page.tsx`):
  - Generate Report button → `POST /reports/portfolio`
  - Report list with download link
- **API: Complete Puppeteer PDF generation** in `reports.service.ts` — HTML template already written, pipe through `puppeteer.pdf()`, upload to S3, return signed URL

---

### Phase 6 — Settings & Advisor Branding

- Wire `settings/page.tsx` to `GET /advisors/me` (populate on load) + `PATCH /advisors/me/branding` (save)
- Logo upload via S3 presigned URL — preview in Topbar and reports

---

### Phase 7 — API Hardening

*Runs in parallel with Phases 3–6.*

| # | Change | File |
|---|--------|------|
| 1 | **ComplianceGuard** — block advice endpoints without full KYC | `modules/compliance/guards/compliance.guard.ts` |
| 2 | **Pagination** — `page` + `limit` on `GET /clients`, `GET /funds`, `GET /audit` | relevant services |
| 3 | **Global Exception Filter** — consistent `{ statusCode, message, timestamp }` error shape | `main.ts` |
| 4 | **Rate Limiting** — `@nestjs/throttler` on login/register (5 req/min) | `app.module.ts` |
| 5 | **JWT expiry** — set `expiresIn: '8h'` | `auth.module.ts` |
| 6 | **DTO whitelist** — `whitelist: true, forbidNonWhitelisted: true` globally | `main.ts` |

---

### Phase 8 — Ingestion Service Upgrade

- Wire Python ingestion service to fund upload page
- Replace in-memory `_jobs` dict with Redis for production reliability
- Improve PDF parser to handle Allan Gray / Coronation SA fact sheet formats
- Support scheduled re-ingestion of fund fact sheets

---

### Phase 9 — Production Readiness

1. Generate TypeORM migrations (create `apps/api/src/config/data-source.ts`)
2. Audit all environment variables + update `.env.example` files
3. Complete Docker Compose with all 4 services + health checks
4. Deploy: Vercel (web), Railway/ECS (API + ingestion), RDS/Supabase (Postgres)

---

### Client Portal (Future)

Available as a navigation link in the sidebar. Full detail to be built later:
- Separate auth — client credentials, not advisor
- Read-only views: portfolio value, clean % score, fund list, downloadable reports
- Fully branded with advisor firm name + logo
- Routes under `/portal/*`
