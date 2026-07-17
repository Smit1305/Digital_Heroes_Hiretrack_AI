# HireTrack AI — Docker Development & Production Guide

This guide explains how to build, run, and manage **HireTrack AI** locally using Docker and Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop).

## Quick Start (Run Everything)

To build and run all services (Next.js App, PostgreSQL, and Redis) in detached mode, run:

```bash
docker-compose up -d --build
```

This command will:
1. Spin up a PostgreSQL database container and persist data to `postgres_data` volume.
2. Spin up a Redis container for session rate limiting.
3. Build the multi-stage Next.js production image and start the application on `http://localhost:3000`.

## Database Management Inside Docker

Once the containers are running and healthy, configure your database schema:

### 1. Run Migrations
Run the Prisma migrations to set up the tables:

```bash
docker-compose exec app npx prisma migrate deploy
```

### 2. Seed Demo Accounts
Seed the database with default production-ready accounts (`admin@hiretrack.ai`, `recruiter@hiretrack.ai`, `candidate@hiretrack.ai`, and the `Acme Inc.` organization):

```bash
docker-compose exec app npm run db:seed
```

## Useful Commands

### Check logs
```bash
# View all container logs
docker-compose logs -f

# View application container logs
docker-compose logs -f app
```

### Check service health status
```bash
docker-compose ps
```

### Stop and clean up containers
This command stops the services but keeps the database volume intact:
```bash
docker-compose down
```

To stop the services and **delete all database volumes** (resets database to clean state):
```bash
docker-compose down -v
```

## Configurations

The containers retrieve environment configurations from `docker-compose.yml` by default. You can modify the environment variables there or map them to a `.env.production` file.
