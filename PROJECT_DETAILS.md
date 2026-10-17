# SKYRA - Project Details

**AI-powered career intelligence and job platform**

---

## Project Overview

SKYRA is a comprehensive AI-powered career intelligence platform that helps users:
- Understand and analyze their resumes
- Identify skill gaps and get personalized learning recommendations
- Generate AI-powered cover letters
- Prepare for interviews with AI coaching
- Match with suitable job opportunities
- Plan career roadmaps
- Track job applications

**Developer:** Amaan Shaikh  
**Founder:** Skyra & Astraa  
**Email:** ashcreation31@gmail.com  
**Location:** Maharashtra, India

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1.0 (App Router)
- **Language:** TypeScript 5.5.4
- **Styling:** Tailwind CSS 3.4.7
- **UI Components:** Custom components with shadcn/ui patterns
- **Icons:** Lucide React 1.38.0
- **State Management:** React Context API
- **Authentication:** Custom auth with JWT tokens

### Backend
- **Framework:** FastAPI 0.115.0
- **Language:** Python 3.12+
- **Database:** SQLite (development), PostgreSQL (production)
- **ORM:** SQLAlchemy 2.0.36 (async)
- **Migrations:** Alembic 1.13.3
- **AI Integration:** Google Generative AI
- **Security:** JWT authentication, bcrypt password hashing
- **PDF Generation:** ReportLab
- **Document Processing:** PyPDF2, python-docx

### Development Tools
- **Containerization:** Docker & Docker Compose
- **Version Control:** Git
- **Testing:** Pytest (backend), Vitest (frontend)
- **Code Quality:** Ruff (Python), ESLint (JavaScript/TypeScript)
- **API Documentation:** FastAPI auto-generated docs (Swagger)

---

## Project Structure

```
SKYRA/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── api/                     # API endpoints
│   │   │   ├── dependencies.py      # Common dependencies
│   │   │   └── v1/                  # API v1 endpoints
│   │   │       ├── applications.py  # Job application tracking
│   │   │       ├── auth.py          # Authentication endpoints
│   │   │       ├── career_roadmap.py # Career planning
│   │   │       ├── cover_letter.py  # Cover letter generation
│   │   │       ├── health.py        # Health check endpoint
│   │   │       ├── interview.py     # Interview coaching
│   │   │       ├── jobs.py          # Job matching
│   │   │       ├── pdf.py           # PDF generation
│   │   │       ├── resume.py        # Resume management
│   │   │       ├── router.py        # API router configuration
│   │   │       └── skill_gap.py     # Skill gap analysis
│   │   ├── core/                    # Core functionality
│   │   │   ├── config.py           # Application configuration
│   │   │   ├── error_handlers.py   # Error handling
│   │   │   ├── exceptions.py       # Custom exceptions
│   │   │   ├── logging.py          # Logging configuration
│   │   │   └── security.py         # Security utilities
│   │   ├── db/                      # Database configuration
│   │   │   ├── base.py             # Base model
│   │   │   └── session.py          # Database session
│   │   ├── models/                  # Database models
│   │   │   ├── activity.py         # User activity tracking
│   │   │   ├── analysis.py         # Resume analysis
│   │   │   ├── application.py      # Job applications
│   │   │   ├── application_tracker.py # Application tracking
│   │   │   ├── career.py           # Career roadmap
│   │   │   ├── company.py         # Company information
│   │   │   ├── interview.py        # Interview data
│   │   │   ├── notification.py     # User notifications
│   │   │   ├── profile.py          # User profiles
│   │   │   ├── resume.py           # Resume storage
│   │   │   ├── skill.py            # Skills management
│   │   │   └── user.py             # User accounts
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── analysis.py         # Analysis schemas
│   │   │   ├── application.py      # Application schemas
│   │   │   ├── auth.py             # Authentication schemas
│   │   │   ├── career_roadmap.py   # Career roadmap schemas
│   │   │   ├── common.py           # Common schemas
│   │   │   ├── cover_letter.py     # Cover letter schemas
│   │   │   ├── interview.py        # Interview schemas
│   │   │   ├── jobs.py             # Job matching schemas
│   │   │   ├── resume.py           # Resume schemas
│   │   │   ├── resume_parser.py    # Resume parser schemas
│   │   │   └── skill_gap.py        # Skill gap schemas
│   │   └── services/               # Business logic
│   │       ├── ai_analyzer.py      # AI resume analysis
│   │       ├── ai_career_roadmap.py # AI career planning
│   │       ├── ai_cover_letter.py  # AI cover letter generation
│   │       ├── ai_interview_coach.py # AI interview coaching
│   │       ├── ai_job_matcher.py   # AI job matching
│   │       ├── ai_parser.py        # AI resume parsing
│   │       ├── ai_skill_gap.py     # AI skill gap analysis
│   │       ├── email_service.py    # Email notifications
│   │       ├── storage.py          # File storage
│   │       └── text_extraction.py  # Text extraction from documents
│   ├── alembic/                     # Database migrations
│   │   ├── versions/               # Migration files
│   │   │   ├── 001_initial_database_schema.py
│   │   │   ├── 002_add_analysis_keywords_fields.py
│   │   │   └── 003_add_applications_table.py
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── requirements.txt             # Python dependencies
│   ├── pyproject.toml              # Python project configuration
│   ├── alembic.ini                  # Alembic configuration
│   └── .env                        # Environment variables
│
├── frontend/                        # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── globals.css         # Global styles
│   │   │   ├── login/              # Login page
│   │   │   │   └── page.tsx
│   │   │   ├── register/          # Registration page
│   │   │   │   └── page.tsx
│   │   │   └── dashboard/          # Dashboard pages
│   │   │       ├── page.tsx        # Dashboard home
│   │   │       ├── about-us/       # About us page
│   │   │       │   └── page.tsx
│   │   │       ├── career-roadmap/ # Career roadmap
│   │   │       │   └── page.tsx
│   │   │       ├── cover-letter/   # Cover letter generation
│   │   │       │   └── page.tsx
│   │   │       ├── interview/      # Interview coaching
│   │   │       │   └── page.tsx
│   │   │       ├── jobs/           # Job matching
│   │   │       │   └── page.tsx
│   │   │       ├── resume-analyzer/ # Resume analysis
│   │   │       │   └── page.tsx
│   │   │       ├── resumes/        # Resume management
│   │   │       │   ├── layout.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── settings/       # User settings
│   │   │       │   └── page.tsx
│   │   │       └── skill-gap/      # Skill gap analysis
│   │   │           └── page.tsx
│   │   ├── components/             # React components
│   │   │   ├── ProtectedRoute.tsx  # Authentication wrapper
│   │   │   ├── PublicRoute.tsx     # Public route wrapper
│   │   │   ├── SplashScreen.tsx   # Loading screen
│   │   │   ├── dashboard/          # Dashboard components
│   │   │   │   ├── Badge.tsx       # Badge component
│   │   │   │   ├── Card.tsx        # Card component
│   │   │   │   ├── DashboardLayout.tsx # Main layout
│   │   │   │   ├── EmptyState.tsx  # Empty state component
│   │   │   │   ├── Header.tsx      # Header component
│   │   │   │   ├── LoadingState.tsx # Loading state
│   │   │   │   ├── MobileNav.tsx   # Mobile navigation
│   │   │   │   ├── ProgressBar.tsx # Progress bar
│   │   │   │   └── Sidebar.tsx     # Sidebar navigation
│   │   │   ├── forms/              # Form components
│   │   │   │   └── FormField.tsx   # Form field component
│   │   │   ├── resumes/            # Resume components
│   │   │   │   ├── ResumeAnalysisResults.tsx
│   │   │   │   ├── ResumeDetail.tsx
│   │   │   │   ├── ResumeList.tsx
│   │   │   │   └── ResumeUpload.tsx
│   │   │   └── ui/                 # UI components
│   │   │       ├── Button.tsx      # Button component
│   │   │       ├── Input.tsx       # Input component
│   │   │       └── Textarea.tsx    # Textarea component
│   │   ├── contexts/               # React contexts
│   │   │   └── AuthContext.tsx     # Authentication context
│   │   ├── lib/                    # Utility libraries
│   │   │   ├── auth-client.ts      # Auth API client
│   │   │   ├── career-roadmap-client.ts # Career roadmap client
│   │   │   ├── cover-letter-client.ts   # Cover letter client
│   │   │   ├── interview-client.ts      # Interview client
│   │   │   ├── jobs-client.ts          # Job matching client
│   │   │   ├── pdf-client.ts           # PDF generation client
│   │   │   ├── resume-builder-client.ts # Resume builder client
│   │   │   ├── resume-client.ts        # Resume API client
│   │   │   ├── skill-gap-client.ts     # Skill gap client
│   │   │   └── utils.ts               # Utility functions
│   │   └── types/                  # TypeScript types
│   │       ├── auth.ts             # Auth types
│   │       ├── career-roadmap.ts   # Career roadmap types
│   │       ├── cover-letter.ts     # Cover letter types
│   │       ├── index.ts            # Type exports
│   │       ├── interview.ts        # Interview types
│   │       ├── jobs.ts             # Job matching types
│   │       ├── navigation.ts       # Navigation types
│   │       ├── resume.ts           # Resume types
│   │       └── skill-gap.ts        # Skill gap types
│   ├── public/                     # Static assets
│   │   └── skyra-logo.png          # Logo
│   ├── package.json                # Node.js dependencies
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── next.config.js              # Next.js configuration
│
├── Images/                          # Project images
│   ├── Skyra 1st Look.png
│   ├── Skyra stuff.png
│   ├── Skyra watermark logo.png
│   └── Skyraa Cover Page.png
│
├── docker-compose.yml              # Docker services configuration
├── .gitignore                      # Git ignore rules
├── .env.example                    # Environment variables template
├── README.md                       # Project documentation
└── PROJECT_DETAILS.md             # This file

```

---

## Core Features

### 1. Authentication & User Management
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Protected routes

### 2. Resume Management
- Resume upload (PDF, DOCX)
- AI-powered resume parsing
- Resume analysis and optimization
- Resume builder from scratch
- PDF generation

### 3. AI Job Matcher
- AI-powered job matching
- Skill-based matching algorithm
- Match percentage calculation
- Multiple job platform integration (LinkedIn, Naukri, Indeed)
- Application link generation

### 4. Skill Gap Analyzer
- Current skills assessment
- Target role analysis
- Skill gap identification
- Personalized learning recommendations
- Readiness percentage calculation

### 5. Interview Coach
- AI-generated interview questions
- Mock interview sessions
- Answer evaluation and feedback
- Performance scoring
- Improvement suggestions

### 6. Cover Letter Generator
- AI-powered cover letter writing
- Customization based on job requirements
- Multiple templates
- PDF export
- Integration with resume data

### 7. Career Roadmap
- Personalized career planning
- Skill development path
- Timeline visualization
- Resource recommendations
- Progress tracking

### 8. Job Application Tracking
- Application status tracking
- Company information management
- Interview scheduling
- Follow-up reminders
- Application analytics

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/change-password` - Change password

### Resume Management
- `POST /api/v1/resume/upload` - Upload resume
- `GET /api/v1/resume/` - List resumes
- `GET /api/v1/resume/{id}` - Get resume details
- `DELETE /api/v1/resume/{id}` - Delete resume
- `POST /api/v1/resume/{id}/parse` - Parse resume
- `POST /api/v1/resume/{id}/analyze` - Analyze resume
- `POST /api/v1/resume/optimize` - Optimize resume

### Job Matching
- `POST /api/v1/jobs/match` - Match jobs to resume
- `GET /api/v1/jobs/{id}` - Get job details

### Skill Gap Analysis
- `POST /api/v1/skill-gap/analyze` - Analyze skill gap

### Interview Coaching
- `POST /api/v1/interview/generate` - Generate interview questions
- `POST /api/v1/interview/evaluate` - Evaluate answers

### Cover Letter Generation
- `POST /api/v1/cover-letter/generate` - Generate cover letter

### Career Roadmap
- `POST /api/v1/career-roadmap/generate` - Generate career roadmap

### PDF Generation
- `POST /api/v1/pdf/generate` - Generate PDF

### Health Check
- `GET /api/v1/health` - Health check endpoint

---

## Database Schema

### Users Table
- User authentication and profile data
- Password hashing
- Account creation timestamps

### Resumes Table
- Resume file storage
- Parsed resume data
- Analysis results
- Upload metadata

### Analyses Table
- Resume analysis results
- Keywords and scores
- Improvement suggestions

### Skills Table
- User skills management
- Skill categories
- Proficiency levels

### Applications Table
- Job application tracking
- Application status
- Company information

### Companies Table
- Company details
- Job postings
- Contact information

### Interviews Table
- Interview data
- Question banks
- Answer evaluations

### Career Table
- Career roadmap data
- Skill development paths
- Timeline information

### Activity Table
- User activity logging
- Usage analytics
- Performance metrics

### Notifications Table
- User notifications
- Alert preferences
- Delivery status

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./skyra_dev.db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_API_KEY=your-google-api-key
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker and Docker Compose

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup
```bash
docker-compose up -d
```

---

## Deployment

### Production Considerations
- Use PostgreSQL instead of SQLite
- Set up proper CORS origins
- Configure environment variables
- Enable HTTPS
- Set up proper logging
- Configure backup strategies
- Monitor performance metrics

---

## Design System

### Color Palette
- **Primary Pink:** #E91E8C
- **Primary Purple:** #8b5cf6
- **Background Dark:** #080818
- **Background Light:** #0d0d1f
- **Text White:** White with opacity variations
- **Success Green:** #10b981
- **Warning Yellow:** #f59e0b
- **Error Red:** #ef4444

### Typography
- **Font:** System fonts (Inter, sans-serif)
- **Headings:** Bold and semibold weights
- **Body:** Regular and medium weights
- **Sizes:** Responsive sizing using Tailwind

### Components
- **Cards:** Glassmorphism with hover effects
- **Buttons:** Gradient and outline variants
- **Inputs:** Clean borders with focus states
- **Badges:** Pill-shaped with color variants
- **Animations:** Smooth transitions and page enter effects

---

## Key Files Reference

### Backend Key Files
- `backend/app/main.py` - FastAPI application entry
- `backend/app/core/config.py` - Configuration management
- `backend/app/api/v1/router.py` - API routing
- `backend/app/models/` - Database models
- `backend/app/schemas/` - Pydantic schemas
- `backend/app/services/` - Business logic

### Frontend Key Files
- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/contexts/AuthContext.tsx` - Authentication
- `frontend/src/components/dashboard/DashboardLayout.tsx` - Main layout
- `frontend/src/lib/` - API clients
- `frontend/src/types/` - TypeScript types

---

## Current Status

### Completed Features
- ✅ User authentication
- ✅ Resume upload and parsing
- ✅ Resume analysis
- ✅ AI job matching
- ✅ Skill gap analysis
- ✅ Interview coaching
- ✅ Cover letter generation
- ✅ Career roadmap
- ✅ PDF generation
- ✅ Job application tracking

### In Progress
- 🔄 Enhanced UI polish
- 🔄 Performance optimization
- 🔄 Additional integrations

### Planned Features
- 📋 Email notifications
- 📋 Real-time collaboration
- 📋 Mobile app
- 📋 Advanced analytics
- 📋 Community features

---

## Support & Contact

**Developer:** Amaan Shaikh  
**Email:** ashcreation31@gmail.com  
**Location:** Maharashtra, India  
**Projects:** Skyra & Astraa

---

## License

MIT License - See LICENSE file for details

---

*Last Updated: September 2026*