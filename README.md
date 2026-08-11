# ODOS (One Day One Skill)

Welcome to the ODOS Monorepo. This project is built using a microservices architecture backed by NestJS and a frontend powered by Next.js. 

## 🚀 Getting Started Locally

We use a modern `pnpm` monorepo structure. Docker Compose is provided to run all microservices instantly without configuring local binaries for each.

### 1. Prerequisites
- [Node.js 22+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/) (`corepack enable pnpm`)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Environment Setup
Every service requires its own `.env` file to run. We have provided a global `.env.example` at the root, and specific `.env.example` files inside each service (`services/*/.env.example`).

To set up your environment variables quickly:
1. Copy the global `.env.example` to `.env` in the root.
2. Copy the `.env.example` in each service to `.env` inside their respective directories.

**Crucial Setup Steps:**
- **MongoDB Atlas**: Ensure `MONGODB_URI` points to your Atlas Cluster (e.g. `mongodb+srv://user:pass@cluster.mongodb.net`). No local MongoDB container is required or provided by default.
- **Supabase Auth**: Set your `SUPABASE_URL` and `SUPABASE_JWT_SECRET` in the `api-gateway` to validate authentication tokens securely.
- **Gemini API**: Add your Gemini key to the `ai-service` environment variables.
- **Cloudflare R2**: Configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` in the `resource-document-service` to enable document exports. NEVER expose these credentials to the frontend.

### 3. Installation
Install all monorepo dependencies from the root directory:
```bash
pnpm install
```

### 4. Running the Application

**Option A: Docker Compose (Recommended for Microservices)**
We provide a `docker-compose.yml` that maps your local source code into lightweight Node Alpine containers and runs them with hot-reloading (`start:dev`).

```bash
# Starts all backend microservices
docker compose up -d
```

**Option B: Native pnpm**
If you prefer running services directly on your host machine:
```bash
# Start all apps and services concurrently
pnpm dev
```

### 5. Running the Frontend
The Next.js frontend is located in `apps/web`. It should be run natively outside of Docker to benefit from native Next.js tooling and hot-reloading.

```bash
# From the root directory:
pnpm --filter @odos/web dev
```

## 🔒 Security Posture
- Secrets must never be committed to source control. `.env` is globally ignored.
- Service-to-service communication relies on trusted `x-user-id` headers securely validated and injected by the API Gateway.
- User BYOK AI credentials are encrypted using AES-256 via the `user-service`.

## 🧪 Testing
We use Jest for backend testing.
```bash
pnpm test
```
