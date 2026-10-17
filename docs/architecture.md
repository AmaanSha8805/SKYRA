# SKYRA Architecture Document

## Current Repository State

The repository is currently empty (only contains an `Images/` directory with no items). This is a greenfield project requiring complete setup from scratch.

## Proposed Project Structure

```
skyra/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── (auth)/         # Auth routes (login, signup)
│   │   │   ├── (dashboard)/    # Dashboard routes
│   │   │   ├── api/            # API routes (if needed for proxying)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/         # React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── auth/           # Auth-related components
│   │   │   ├── resume/         # Resume components
│   │   │   ├── jobs/           # Job-related components
│   │   │   └── analytics/     # Analytics components
│   │   ├── lib/                # Utility libraries
│   │   │   ├── auth.ts         # Auth.js configuration
│   │   │   ├── api.ts          # API client
│   │   │   └── utils.ts        # Utilities
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # Global styles
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── vitest.config.ts
│
├── backend/                     # FastAPI backend application
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   ├── v1/
│   │   │   │   ├── auth/       # Authentication endpoints
│   │   │   │   ├── users/      # User management
│   │   │   │   ├── resumes/    # Resume operations
│   │   │   │   ├── jobs/       # Job operations
│   │   │   │   ├── ai/         # AI-powered endpoints
│   │   │   │   └── analytics/ # Analytics endpoints
│   │   ├── core/               # Core functionality
│   │   │   ├── config.py       # Configuration
│   │   │   ├── security.py     # Security utilities
│   │   │   └── deps.py         # Dependency injection
│   │   ├── models/             # Database models (SQLAlchemy)
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── resume_service.py
│   │   │   ├── job_service.py
│   │   │   ├── ai_service.py
│   │   │   └── analytics_service.py
│   │   ├── db/                 # Database utilities
│   │   │   ├── session.py      # Database session
│   │   │   └── base.py         # Base model
│   │   └── main.py             # FastAPI application entry
│   ├── tests/                  # Pytest tests
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── pytest.ini
│
├── docs/                        # Documentation
│   ├── architecture.md         # This file
│   ├── api.md                  # API documentation
│   └── deployment.md           # Deployment guide
│
├── docker-compose.yml           # Local development
├── .gitignore
├── README.md
└── LICENSE
```

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: Auth.js (NextAuth.js)
- **State Management**: React Context + Server Components
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Native fetch with typed wrappers

### Key Architectural Decisions

1. **Server-First Approach**: Leverage Next.js Server Components for data fetching to reduce client-side JavaScript
2. **Component Organization**: Feature-based grouping (auth, resume, jobs, analytics)
3. **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
4. **Authentication Flow**: Auth.js with Supabase as OAuth provider (or credential-based for MVP)
5. **API Communication**: Direct calls to FastAPI backend with proper error handling
6. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with client components

### Route Structure

```
/                          # Landing page
/login                     # Login
/signup                    # Sign up
/dashboard                 # Main dashboard
/dashboard/resumes         # Resume management
/dashboard/resumes/[id]    # Resume detail/editor
/dashboard/jobs            # Job search
/dashboard/jobs/[id]       # Job detail
/dashboard/applications    # Application tracker
/dashboard/analytics       # Personal analytics
/admin                     # Admin dashboard
```

## Backend Architecture

### Technology Stack
- **Framework**: FastAPI
- **Language**: Python 3.12 (recommended)
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: PostgreSQL with pgvector extension
- **Validation**: Pydantic v2
- **Authentication**: JWT tokens (issued by Auth.js backend or custom)
- **AI**: OpenAI API / Google Gemini API
- **Task Processing**: Built-in FastAPI BackgroundTasks (no Celery initially)

### API Design Principles

1. **RESTful Design**: Standard HTTP methods, proper status codes
2. **Versioning**: `/api/v1/` prefix for all endpoints
3. **Consistent Response Format**:
   ```json
   {
     "data": { ... },
     "meta": { "page": 1, "total": 100 },
     "errors": null
   }
   ```
4. **Error Handling**: Centralized exception handling with detailed error messages
5. **Rate Limiting**: Token-based rate limiting per user
6. **CORS**: Configured for frontend domain only

### Service Layer Pattern

Business logic encapsulated in service modules:
- `auth_service.py`: User registration, login, token management
- `resume_service.py`: CRUD operations, parsing, ATS scoring
- `job_service.py`: Job scraping, storage, matching
- `ai_service.py`: AI operations (analysis, optimization, generation)
- `analytics_service.py`: Data aggregation and insights

## Database Architecture

### Technology Stack
- **Database**: PostgreSQL 15+ with pgvector extension
- **Hosting**: Supabase (provides PostgreSQL + Storage + Auth)
- **ORM**: SQLAlchemy 2.0 with async support
- **Migrations**: Alembic

### Core Tables

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT, -- Parsed resume content (JSON)
    file_url VARCHAR(255), -- Supabase Storage URL
    ats_score INTEGER,
    embedding vector(1536), -- pgvector for semantic search
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    company VARCHAR(255),
    description TEXT,
    requirements TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    source_url VARCHAR(500),
    embedding vector(1536),
    scam_risk_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job Applications
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id),
    status VARCHAR(50), -- applied, interviewing, rejected, offer
    notes TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Skill Gaps
CREATE TABLE skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    missing_skills TEXT[], -- Array of skill names
    recommended_resources TEXT[], -- JSON array of learning resources
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cover Letters
CREATE TABLE cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
- Email index on users
- User_id indexes on all user-related tables
- GIN indexes on JSONB columns
- Vector similarity indexes on embedding columns

## Authentication Approach

### Architecture
1. **Frontend**: Auth.js (NextAuth.js) for session management
2. **Backend**: JWT token validation
3. **Provider**: Supabase Auth (OAuth + Email/Password)

### Flow
1. User authenticates via Auth.js on frontend
2. Auth.js issues JWT token
3. Frontend includes JWT in Authorization header for API calls
4. Backend validates JWT and extracts user context
5. FastAPI dependency injection provides current user to endpoints

### Alternative (MVP)
For initial development, use simple credential-based auth:
- Custom `/auth/login` and `/auth/register` endpoints
- JWT tokens issued by FastAPI
- Frontend stores token in httpOnly cookie

## AI Integration Approach

### Technology Stack
- **Primary**: OpenAI API (GPT-4o for complex tasks, GPT-4o-mini for simple tasks)
- **Alternative**: Google Gemini API (as backup or for specific features)
- **Orchestration**: LangGraph (only for complex multi-step workflows)
- **Embeddings**: OpenAI text-embedding-3-small (cost-effective)

### AI Services Architecture

```python
# services/ai_service.py
class AIService:
    def analyze_resume(self, resume_content: str) -> ResumeAnalysis
    def score_ats(self, resume: str, job_description: str) -> ATSScore
    def match_resume_job(self, resume: str, job: str) -> MatchResult
    def optimize_resume(self, resume: str, job: str) -> OptimizedResume
    def generate_cover_letter(self, resume: str, job: str) -> str
    def analyze_job_description(self, job: str) -> JobAnalysis
    def detect_scam_risk(self, job: str) -> RiskScore
    def generate_career_roadmap(self, user_profile: dict) -> Roadmap
    def coach_interview(self, question: str, context: str) -> CoachingResponse
    def mentor_career(self, situation: str) -> AdviceResponse
```

### AI Safety Measures
1. **Input Validation**: Strict validation before sending to AI
2. **Output Validation**: Pydantic models to structure and validate AI responses
3. **Cost Controls**: Token limits, model selection based on complexity
4. **Caching**: Cache AI responses for identical inputs
5. **Rate Limiting**: Per-user rate limits on AI endpoints
6. **Audit Logging**: Log all AI interactions for debugging and cost tracking

### When to Use LangGraph
Only introduce LangGraph for:
- Complex multi-step resume optimization workflows
- Career roadmap generation with multiple decision points
- Interview coaching with back-and-forth dialogue

Simple tasks (single prompt-response) should use direct OpenAI API calls.

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/skyra
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET_KEY=your-jwt-secret
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
```

### Development (.env.development)
```env
# Override for development
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/skyra_dev
LOG_LEVEL=DEBUG
```

### Production (.env.production)
```env
# Production-specific
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db:5432/skyra_prod
LOG_LEVEL=WARNING
```

## Development Workflow

### Git Strategy
- **Main branch**: Production-ready code
- **Develop branch**: Integration branch for features
- **Feature branches**: `feature/feature-name`
- **Hotfix branches**: `hotfix/issue-description`

### Commit Convention
Conventional Commits:
- `feat: add resume upload feature`
- `fix: resolve ATS scoring bug`
- `docs: update API documentation`
- `refactor: simplify AI service`
- `test: add integration tests for auth`

### Development Process
1. Create feature branch from develop
2. Implement feature with tests
3. Run linting and type checking
4. Run tests locally
5. Create pull request to develop
6. Code review
7. Merge to develop
8. Deploy to staging
9. Test staging
10. Merge develop to main
11. Deploy to production

### Local Development Setup
```bash
# Start PostgreSQL (Docker)
docker-compose up -d db

# Start backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Start frontend
cd frontend
npm install
npm run dev
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Vitest for utility functions, hooks
- **Component Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright for critical user flows
- **Coverage Target**: 80% for critical paths

### Backend Testing
- **Unit Tests**: Pytest for services, utilities
- **Integration Tests**: Pytest with test database
- **API Tests**: Pytest with FastAPI TestClient
- **Coverage Target**: 80% for business logic

### Test Organization
```
frontend/
└── tests/
    ├── unit/
    ├── components/
    └── e2e/

backend/
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

### Critical Test Flows
1. User registration and login
2. Resume upload and parsing
3. ATS scoring
4. Job search and application
5. AI-powered resume optimization
6. Cover letter generation

## Deployment Strategy

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
3. Set environment variables in Vercel dashboard
4. Automatic deployment on push to main
5. Preview deployments for pull requests

### Backend Deployment (Render/Railway)
1. Connect GitHub repository
2. Configure build settings:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Set environment variables
4. Deploy PostgreSQL instance
5. Run migrations on deploy
6. Automatic deployment on push to main

### Database (Supabase)
1. Create Supabase project
2. Configure database extensions (pgvector)
3. Run schema migrations via Alembic or Supabase SQL editor
4. Configure Row Level Security (RLS) policies
5. Set up Storage buckets for resume files

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: |
          cd backend && pip install -r requirements.txt
          cd frontend && npm install
      - name: Run tests
        run: |
          cd backend && pytest
          cd frontend && npm test
      - name: Lint
        run: |
          cd backend && ruff check .
          cd frontend && npm run lint
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Project setup (frontend + backend)
- Database schema and migrations
- Authentication system
- Basic user profile
- API infrastructure

### Phase 2: Core Resume Features (Week 3-4)
- Resume upload and parsing
- Resume storage
- Basic resume display
- Resume CRUD operations

### Phase 3: AI Integration (Week 5-6)
- OpenAI integration
- Resume analysis
- ATS scoring
- Resume-job matching

### Phase 4: Job Features (Week 7-8)
- Job scraping/storage
- Job search and filtering
- Job application tracking
- Job description intelligence

### Phase 5: Advanced AI Features (Week 9-10)
- Resume optimizer
- Cover letter generator
- Skill gap analysis
- Career roadmap

### Phase 6: Analytics & Admin (Week 11-12)
- Personal analytics
- Admin dashboard
- Scam detection
- Performance optimization

### Phase 7: Polish & Launch (Week 13-14)
- E2E testing
- Performance tuning
- Security audit
- Documentation
- Deployment

## Open Questions

1. **Auth Provider**: Should we use Supabase Auth as the primary provider, or implement custom JWT auth for more control?
2. **Job Sourcing**: How will we populate the job database? Scrape from job boards, API integration, or manual entry?
3. **AI Cost Management**: What is the budget for AI API calls? Should we implement a per-user credit system?
4. **Vector Database**: Is pgvector sufficient, or should we plan for a dedicated vector database (Pinecone, Weaviate) later?
5. **File Storage**: Should we use Supabase Storage or switch to S3 for production?
6. **Multi-tenancy**: Is this a multi-tenant SaaS or single-tenant application initially?

## Recommended Next Implementation Step

**Set up the project foundation:**

1. Initialize Next.js frontend with TypeScript, Tailwind, and shadcn/ui
2. Initialize FastAPI backend with SQLAlchemy and Alembic
3. Set up PostgreSQL database with pgvector extension
4. Implement basic authentication (JWT-based for MVP)
5. Create user model and basic user CRUD endpoints
6. Set up development environment with Docker Compose
7. Configure CI/CD pipeline with GitHub Actions

This establishes the technical foundation before implementing any business features.
