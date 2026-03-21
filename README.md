<h1 align="center">
  <img src="apps/web/public/logo.png" alt="NoBG" width="64">
  <br>
  <b>NoBG</b>
</h1>

<p align="center">
  <b>Backgrounds, Gone.</b>
</p>

## 🔎 Overview

NoBG is an open-source, full-stack application designed to automatically remove backgrounds from images. Built with a Next.js frontend and a fast Python worker, NoBG orchestrates image processing jobs using Redis and Vercel Blob storage via an event-driven, decoupled architecture utilizing message queues.

## ✨ Features

- **Fast Background Removal**: Leveraging the Rembg library running on a dedicated FastAPI/Python worker.
- **Modern Tech Stack**: Next.js App Router with React 19, Tailwind CSS, and Radix UI components.
- **Authentication**: Built-in credential and OAuth flow using Better Auth.
- **Database**: PostgreSQL with Prisma ORM for type-safe database access.
- **Job Queuing**: Redis is used for fast, reliable job queues between the web frontend and worker.
- **Cloud Storage**: Integrated with Vercel Blob for secure image upload and hosting.
- **Monorepo Structure**: Managed with `pnpm` workspace and Turborepo for optimal local development.

## 🛠️ Tech Stack

### Frontend and API (`apps/web`)

- Typescript
- Next.js
- Tailwind CSS
- Shared UI Components (`packages/ui`)
- Prisma ORM
- Better Auth
- Redis Client
- Vercel Blob

### Background Processing (`apps/worker`)

- Python
- FastAPI and Uvicorn
- Rembg (CPU processing)
- Pillow
- Redis
- Requests

## 📁 Project Structure

```
.
├── apps/
│   ├── web/                     # Next.js frontend and API routes
│   └── worker/                  # Python FastAPI worker for background removal
├── packages/
│   ├── ui/                      # Shared React UI components
│   ├── eslint-config/           # Shared ESLint configurations
│   └── typescript-config/       # Shared TS configs
└── turbo.json                   # Turborepo configuration
```

## 🚀 Getting Started

Coming soon...

<p align="center">
  <a href="https://youtu.be/EA4DipdhpV8">🙂</a>
</p>
