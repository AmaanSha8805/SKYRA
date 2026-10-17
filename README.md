# SKYRA

AI-powered career intelligence and job platform.
Developed By AMAAN

## Overview

SKYRA helps users understand their resumes, analyze job opportunities, identify skill gaps, improve their applications, discover suitable jobs, prepare for interviews, and make better career decisions.

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Auth.js

### Backend
- FastAPI
- Python 3.11+
- SQLAlchemy 2.0 (async)
- PostgreSQL + pgvector
- Pydantic v2

### Development
- Docker
- Git
- GitHub Actions

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12 (recommended)
- Docker and Docker Compose

### Local Development

1. Clone the repository
2. Start PostgreSQL:
   ```bash
   docker-compose up -d db
   ```

3. Start backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```

4. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Documentation

- [Architecture](docs/architecture.md)
- [API Documentation](docs/api.md) (coming soon)
- [Deployment Guide](docs/deployment.md) (coming soon)

## License

MIT
