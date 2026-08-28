# ODOS Product Audit

## 1. Executive Summary
The ODOS-web repository contains a highly scaffolded microservice architecture that is disconnected from a visually complete but heavily mocked frontend. While individual services (like User and Roadmap services) possess robust database operations and entity definitions, the system lacks end-to-end integration. The API Gateway fails to route most necessary endpoints, forcing the frontend to rely on hardcoded data, optimistic UI updates, and mocked responses. The product is firmly in a "Proof of Concept" (PoC) state and is not production-ready.

## 2. Current Architecture
The system employs a Turborepo-based monorepo containing:
- **Frontend**: Next.js application (`apps/web`).
- **API Gateway**: NestJS service (`apps/api-gateway`) handling proxying.
- **Microservices**: Six NestJS backend services (`user`, `learning`, `roadmap`, `scheduler`, `ai`, `resource-document`).
- **Database**: PostgreSQL (contrary to `.env.example` referencing MongoDB) managed via TypeORM with `synchronize: true`.
- **Infrastructure**: Docker Compose setup for backend services.
- **Auth**: Supabase JWT authentication.

## 3. Frontend Audit (apps/web)
The frontend visually implements many pages and components (Dashboard, Calendar, AI Tutor, Resources) but is fundamentally disconnected from the backend.
- **✅ Integration**: Mocked hooks have been removed or rewritten to connect to real endpoints. `apps/web/src/hooks/useProfile.ts`, `useCalendar.ts`, `useToday.ts`, `useProgress.ts`, `useAITutor.ts`, and `useAIProvider.ts` all contain hardcoded mock fallback logic ("temporarily while backend is pending").
- **⚠️ Inconsistent API Clients**: There are two separate API clients. `apps/web/src/lib/api.ts` uses `localStorage` for tokens, while `apps/web/src/lib/api/client.ts` uses Supabase's session.
- **✅ Endpoints Fixed**: The frontend now uses proper routes.
- **⚠️ Hardcoded State**: `apps/web/src/app/dashboard/today/page.tsx` hardcodes the `roadmapId` for demo purposes. `apps/web/src/lib/auth/auth-provider.tsx` uses a mock user ID (`mock-user-123`).

## 4. API Gateway Audit (apps/api-gateway)
- **🔴 Missing Proxies**: The API Gateway (`apps/api-gateway/src/proxy/proxy.controller.ts`) only proxies requests to the User Service (Port 4001) and Learning Service (Port 4002).
- **🔴 Unreachable Services**: The Roadmap, Scheduler, AI, and Resource services are completely unreachable from the internet because the Gateway does not map their routes.
- **✅ Authentication**: Supabase JWT validation (`apps/api-gateway/src/auth/supabase.strategy.ts`) is correctly implemented and securely passes `x-user-id` to downstream services.

## 5. Microservice Audit

### User Service (`services/user-service`)
- **✅ Implementation**: Fully implemented CRUD operations for profiles and preferences.
- **✅ Security**: Correctly encrypts/decrypts AI provider API keys using an internal service key.
- **⚠️ Hardcoded Validation**: Gemini API key validation hardcodes a check for `AIzaSy` (`services/user-service/src/user.service.ts`).

### Learning Service (`services/learning-service`)
- **🔴 Fake Generation**: When creating a learning goal, it does not call the AI or Roadmap service. Instead, it injects 3 hardcoded mock skill nodes ("Introduction to X", "Practical exercises in X") into the database (`services/learning-service/src/learning.service.ts`).
- **🟡 Endpoints**: Progress tracking and skill retrieval exist but operate on the mocked graph.

### Roadmap Service (`services/roadmap-service`)
- **✅ AI Integration**: Properly implemented HTTP call to the AI Service to generate roadmaps (`services/roadmap-service/src/roadmap/roadmap.service.ts`).
- **✅ Entity Graph**: Successfully parses AI output into `Roadmap`, `Module`, `SkillNode`, and `Prerequisite` entities.
- **🔴 Unreachable**: The frontend cannot trigger this because it is not mapped in the API Gateway.

### Scheduler Service (`services/scheduler-service`)
- **🟡 Algorithm**: Contains complex scheduling logic (`services/scheduler-service/src/scheduler/scheduling-engine.service.ts`).
- **🔴 Unreachable**: Not proxied through the gateway. 

### AI Service (`services/ai-service`)
- **🟡 Provider Implementation**: Only the Gemini provider (`services/ai-service/src/providers/gemini.provider.ts`) is implemented.
- **🔴 Stubbed Providers**: Claude, Grok, Ollama, and OpenAI providers are stubs that throw `NotImplementedException` (`services/ai-service/src/providers/claude.provider.ts` etc.).
- **✅ Internal Auth**: Securely fetches decrypted keys from the User Service using `INTERNAL_SERVICE_KEY`.

### Resource & Document Service (`services/resource-document-service`)
- **🟡 Basic Scaffold**: Contains scaffolding for R2 storage (`services/resource-document-service/src/document/r2-storage.adapter.ts`), but is not exposed to the Gateway.

## 6. Database Audit
- **⚠️ Type Mismatch**: The `.env.example` defines `MONGODB_URI`, but all services explicitly connect to PostgreSQL via `TypeOrmModule.forRoot({ type: 'postgres' })`.
- **🔴 Dangerous Config**: All services use `synchronize: true` in `app.module.ts`. This will cause catastrophic data loss if deployed to production.
- **🔴 Duplicated Data Models**: There are massive domain boundary violations. There is a `skill_nodes` table in Roadmap Service and a `learning_skill_nodes` table in Learning Service.

## 7. Authentication/Security Audit
- **✅ Internal Trust**: Good usage of `INTERNAL_SERVICE_KEY` and encryption keys.
- **⚠️ Exposed Logic**: Using `synchronize: true` in production is a critical security and stability risk.
- **🔴 Frontend Auth Mismatch**: Some frontend code expects `auth_token` in `localStorage` rather than relying purely on secure Supabase sessions.

## 8. Environment Configuration Audit
- **⚠️ Inconsistent Env**: `.env.example` mentions `MONGODB_URI` which is false. It is missing the `DATABASE_URL` required for PostgreSQL.
- **✅ Secret Management**: Requires `ENCRYPTION_KEY`, `INTERNAL_SERVICE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

## 9. Infrastructure/Deployment Audit
- **✅ Local Docker**: `docker-compose.yml` is correctly set up for all 6 microservices and the gateway.
- **🔴 No Database Container**: The Docker compose file does not spin up a PostgreSQL instance, meaning developers must run their own DB externally.
- **🔴 Production Readiness**: The Dockerfiles/Compose use `pnpm start:dev` and map volumes. There are no production Dockerfiles.

## 10. Testing Audit
- **🔴 Missing**: A search for `*.spec.ts` and `*.test.ts` across the repository yielded 0 results. There are no unit, integration, or E2E tests.

## 11. Complete User Journey Audit

| Step | Frontend (A) | Backend (B) | API (C) | DB (D) | Connected (E) | Status (F/G) |
|---|---|---|---|---|---|---|
| Signup / Login | ✅ Yes | ✅ Yes (Supabase) | ✅ Yes | ✅ Yes | 🟡 Partial | Mostly works, but UI auth state is messy |
| Create learning goal | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Connected properly. |
| Generate roadmap | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Fully connected. |
| View roadmap | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Connected. |
| Generate schedule | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Connected. |
| Complete task / Progress | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Connected. |
| AI Tutor | ✅ Yes | ✅ Yes | 🔴 Missing | N/A | 🔴 No | Frontend falls back to mocked AI responses. |

## 12. Missing Features
~~- API Gateway routes for 4 out of 6 microservices.~~ (Fixed)
- Automated tests.
- Claude, OpenAI, Grok implementations in the AI Service.
- PostgreSQL container in docker-compose.
- Database migration system (currently relying on `synchronize`).

## 13. Bugs / Risks
- **High Risk**: `synchronize: true` in TypeORM.
~~- **High Risk**: `learning-service` silently inserting hardcoded nodes instead of utilizing `roadmap-service`.~~ (Fixed)
- **Medium Risk**: Two different `apiClient` configurations in the frontend.

## 14. Technical Debt
- **Duplicated Entities**: `SkillNode` exists in two separate microservices.
- **Mocking**: The frontend is littered with mock data to hide backend deficiencies.
- **Configuration**: `.env.example` is misleading.

## 15. Production Readiness
**NOT READY.** The application is in a prototype/scaffolded state. Deploying this would result in a disconnected frontend, unreachable APIs, and an unstable database schema.

## 16. Recommended Development Order
1. ~~**API Gateway & Routing**: Immediately map the missing microservices in `proxy.controller.ts`.~~ (Done)
2. **Database Migrations & Consolidation**: Turn off `synchronize: true`, set up a proper PostgreSQL instance in Docker, and unify the duplicated `SkillNode`/`Task` models.
3. ~~**Frontend De-Mocking**: Remove all `mock` logic from frontend hooks and connect them to the real API endpoints.~~ (Done)
4. ~~**Learning vs Roadmap Service Integration**: Fix the `createGoal` logic in Learning Service to actually trigger Roadmap Service generation instead of inserting 3 hardcoded nodes.~~ (Done)
5. **Testing Pipeline**: Write unit and integration tests for critical paths.

## 17. Final Product Completion Score

- **Frontend completeness**: 60% (Visually complete, logically mocked)
- **Backend completeness**: 70% (Business logic exists, but disconnected)
- **Database completeness**: 50% (Entities exist, but duplicated and unsafe)
- **API integration**: 80% (Frontend and Gateway are connected for core flows)
- **Authentication**: 80% (Supabase integrated, but frontend state is split)
- **AI functionality**: 20% (Only Gemini works, others stubbed, Gateway blocks it)
- **Testing**: 0% (No tests exist)
- **Security**: 60% (Keys encrypted, but DB sync is a massive risk)
- **Deployment readiness**: 10% (Dev docker-compose exists, no prod setup)
- **Overall product readiness**: **60% (Alpha/Integration phase)**
