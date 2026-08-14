<h1 align="center">
  <img src="apps/web/public/logo.png" alt="NoBG" width="64">
  <br>
  <b>NoBG</b>
</h1>

<h3 align="center">
  <b>Backgrounds, Gone.</b>
</h3>

<p align="center">
  <a href="https://nobg.itskdhere.com" title="nobg.itskdhere.com">
    <img alt="nobg.itskdhere.com" src="https://img.shields.io/badge/visit-nobg.itskdhere.com-blue?style=for-the-badge&logoColor=white">
  </a>
</p>

## 🔎 Overview

NoBG is an open-source, full-stack application designed to automatically remove backgrounds from images. Built with a Next.js frontend and a high-performance Python worker, NoBG orchestrates image processing jobs using Redis and UploadThing via an event-driven, decoupled architecture utilizing message queues.

## ✨ Features

- **Instant AI Background Removal**: Automatically detects subjects and isolates them with high accuracy in seconds.
- **Batch Processing**: Upload and process up to 10 images at once with real-time status updates.
- **Original vs. Result Comparison**: Easily toggle between the original photo and the background-removed image side-by-side.
- **Cloud History**: Access past processed photos anytime from your personal dashboard, or clear your history and cloud storage with one click.
- **Easy Sign-In**: Quick authentication using your Google or GitHub account.
- **Dark Mode**: Seamlessly switch between light and dark themes to match your preference.

## 🛠️ Tech Stack

### Frontend and API (`apps/web`)

- **Runtime**: Node.js v24 LTS
- **Framework**: Next.js v16 (App Router), React v19, TypeScript
- **Styling & UI**: Tailwind CSS v4, `packages/ui` (Base UI & shadcn/ui), Next Themes, Tabler Icons
- **Authentication**: Better Auth (Google & GitHub OAuth)
- **Database**: PostgreSQL with Prisma ORM v7
- **Queue**: Redis with Redis Client v5
- **File Storage**: UploadThing
- **Deployment**: Vercel

### Background Processing (`apps/worker`)

- **Runtime**: Python v3.13+
- **Web Framework**: FastAPI & Uvicorn
- **AI Processing**: Rembg, Pillow, PyTorch/ONNX Runtime
- **Queue & Networking**: redis (asyncio), httpx async client
- **Containerization**: Docker & Docker Compose
- **Deployment**: Hugging Face Spaces

## 🏗️ Architecture & Workflow

```
[ Client ] ──(Upload)──> [ UploadThing ]
    │                          │
(Post Job)                     │
    ▼                          ▼
 [ Redis Queue ] ──────> [ Python Worker (Rembg) ]
                               │
                       (Upload Result)
                               ▼
                      [ Next.js API Route ]
                               │
                        (Save Metadata)
                               ▼
                        [ PostgreSQL DB ]
```

1. **Upload**: User uploads image(s) from the web dashboard. Files are stored on UploadThing.
2. **Enqueue**: The Next.js API pushes processing job details to the Redis queue (`dev:job_queue` / `production:job_queue`).
3. **Worker Processing**: The Python worker consumes jobs asynchronously, removes image backgrounds using Rembg, and streams the output to `/api/worker/upload`.
4. **Storage & Database**: Next.js uploads the result to UploadThing and persists file metadata to PostgreSQL via Prisma.
5. **State Sync**: Worker updates the Redis status hash (`dev:job_status:{jobId}` / `production:job_status:{jobId}`) to `completed`, which the web frontend polls in real-time.

## 📁 Project Structure

```
.
├── .github/                     # GitHub Workflows and CI/CD configurations
├── apps/
│   ├── web/                     # Next.js 16 frontend and API routes
│   └── worker/                  # Python FastAPI worker for background removal
├── packages/
│   ├── ui/                      # Shared React UI component library (Base UI + Tailwind v4)
│   ├── eslint-config/           # Shared ESLint configurations
│   └── typescript-config/       # Shared TypeScript configurations
├── package.json                 # Root package manifest and scripts
├── pnpm-lock.yaml               # Monorepo lockfile
├── pnpm-workspace.yaml          # pnpm workspace configuration
└── turbo.json                   # Turborepo task pipeline configuration
```

## 🚀 Getting Started

### Prerequisites

- [**Node.js**](https://nodejs.org/en/download): `>= 24.16.0`
- [**pnpm**](https://pnpm.io/installation): `>= 11.12.0`
- [**Python**](https://www.python.org/downloads): `>= 3.13`
- [**uv**](https://docs.astral.sh/uv/getting-started/installation): `>= 0.11.25`
- **PostgreSQL**: Local instance or hosted (e.g., Neon, Supabase)
- **Redis**: Local instance or hosted (e.g., Redis Cloud, Upstash)
- **UploadThing Token**: API Key from [UploadThing](https://uploadthing.com)

### Steps

#### 1. Clone the repository

```bash
git clone https://github.com/itskdhere/NoBG.git
cd NoBG
```

#### 2. Environment Variables Setup

**Web App Environment (`apps/web/.env`)**

Copy `apps/web/.env.example` to `apps/web/.env` and fill in the values:

```bash
cp apps/web/.env.example apps/web/.env
```

```env
BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

DATABASE_URL="postgresql://user:password@localhost:5432/nobg?schema=public"
REDIS_URL="redis://localhost:6379"

UPLOADTHING_TOKEN=your-uploadthing-token
WORKER_SECRET=shared-secret-between-web-and-worker
```

**Worker Environment (`apps/worker/.env`)**

Copy `apps/worker/.env.example` to `apps/worker/.env` and fill in the values:

```bash
cp apps/worker/.env.example apps/worker/.env
```

```env
ENV=development
PORT=8000
MODEL_NAME=u2net
WEB_APP_URL=http://localhost:3000
REDIS_URL="redis://localhost:6379"
WORKER_SECRET=shared-secret-between-web-and-worker
```

#### 3. Install dependencies

```bash
pnpm install
```

#### 4. Database Setup

Generate Prisma Client and run database migrations:

```bash
pnpm --filter web prisma:generate
pnpm --filter web prisma:migrate-dev
```

#### 5. Python Worker Setup

Set up a virtual environment and install Python dependencies using `uv`:

```bash
cd apps/worker

# Create virtual environment
uv venv .venv

# Activate virtual environment
.venv\Scripts\activate # On Windows
source .venv/bin/activate # On Linux/macOS

# Install requirements
uv pip install -r requirements.txt

# Pre-download Rembg model
python -m src.download_model
```

#### 6. Run the Application

Run both the Next.js web application and the Python worker concurrently:

```bash
pnpm dev
```

The web application will be running at [http://localhost:3000](http://localhost:3000) and the worker health check endpoint at [http://localhost:8000](http://localhost:8000).

## 📄 License

This project is open-source under the [MIT License](LICENSE).

<br>
<p align="center">
  <a href="https://youtu.be/EA4DipdhpV8">🖼️</a>
</p>
