from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from typing import Optional, List
import asyncio
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.models.analysis import ResumeAnalysis
from app.schemas.resume import ResumeResponse, ResumeListResponse, ResumeDetailResponse, ResumeAnalysisSummary, ResumeTemplate, TemplateInfo
from app.schemas.analysis import ResumeAnalysisResponse
from app.services.storage import storage_service
from app.services.text_extraction import text_extraction_service
from app.services.ai_parser import resume_parser_service
from app.services.ai_analyzer import resume_analysis_service
from app.services.email_service import email_service
from app.services.pdf_generator import pdf_generator
from google import genai
from app.core.config import settings
import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("/templates", response_model=List[TemplateInfo])
async def get_resume_templates():
    """Get available ATS-friendly resume templates"""
    templates = [
        TemplateInfo(
            id="classic",
            name="Classic",
            description="Traditional ATS-friendly format with standard sections and clean layout",
            features=[
                "Standard chronological format",
                "Clear section headings",
                "Optimized for older ATS systems",
                "Professional appearance"
            ]
        ),
        TemplateInfo(
            id="modern",
            name="Modern",
            description="Contemporary ATS-friendly design with improved spacing and readability",
            features=[
                "Clean, modern spacing",
                "Enhanced readability",
                "Optimized for modern ATS",
                "Balanced layout"
            ]
        ),
        TemplateInfo(
            id="minimal",
            name="Minimal",
            description="Ultra-clean ATS-focused template with maximum text readability",
            features=[
                "Maximum ATS compatibility",
                "Minimal formatting",
                "Focus on content",
                "Ideal for text-heavy resumes"
            ]
        ),
        TemplateInfo(
            id="professional",
            name="Professional",
            description="Traditional business format with serif fonts for formal industries",
            features=[
                "Traditional serif fonts",
                "Formal appearance",
                "Ideal for conservative industries",
                "Classic business layout"
            ]
        )
    ]
    return templates


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new resume"""
    # Validate file
    text_extraction_service.validate_file(file.filename or "", file.size or 0)
    
    # Generate title from filename if not provided
    if not title:
        title = file.filename or "Untitled Resume"
    
    # Save file
    file_path = await storage_service.save_file(file, str(current_user.id))
    
    # Extract text
    try:
        extracted_text = await text_extraction_service.extract_text(file_path, file.filename or "")
    except Exception as e:
        # Clean up file if extraction fails
        await storage_service.delete_file(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract text from resume: {str(e)}"
        )
    
    # Parse resume with AI
    parsed_data = None
    try:
        parsed_data = await resume_parser_service.parse_resume(extracted_text)
    except ValueError as e:
        # Log parsing error but don't fail the upload
        # Resume will be stored with raw text only
        print(f"AI parsing failed (configuration issue): {str(e)}")
    except Exception as e:
        # Log parsing error but don't fail the upload
        # Resume will be stored with raw text only
        print(f"AI parsing failed: {str(e)}")
    
    # Create resume record
    resume = Resume(
        user_id=str(current_user.id),
        title=title,
        original_filename=file.filename or "upload",
        file_url=file_path,
        file_type=file.content_type or "application/octet-stream",
        file_size=file.size or 0,
        is_active=True
    )
    
    db.add(resume)
    await db.flush()  # Get resume ID
    
    # Create initial resume version
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text=extracted_text,
        parsed_data=parsed_data
    )
    
    db.add(resume_version)
    await db.commit()
    await db.refresh(resume)
    
    return resume


@router.get("", response_model=ResumeListResponse)
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all resumes for current user"""
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == str(current_user.id))
        .order_by(Resume.created_at.desc())
    )
    resumes = result.scalars().all()
    
    # Get total count
    count_result = await db.execute(
        select(func.count()).where(Resume.user_id == str(current_user.id))
    )
    total = count_result.scalar() or 0
    
    # Fetch latest analysis for each resume
    resume_responses = []
    for resume in resumes:
        # Get latest version
        version_result = await db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.resume_id == str(resume.id))
            .order_by(ResumeVersion.version_number.desc())
            .limit(1)
        )
        latest_version = version_result.scalar_one_or_none()
        
        # Get latest analysis if version exists
        latest_analysis = None
        if latest_version:
            analysis_result = await db.execute(
                select(ResumeAnalysis)
                .where(ResumeAnalysis.resume_version_id == str(latest_version.id))
                .order_by(ResumeAnalysis.created_at.desc())
                .limit(1)
            )
            analysis = analysis_result.scalar_one_or_none()
            if analysis:
                latest_analysis = ResumeAnalysisSummary(
                    id=str(analysis.id),
                    overall_score=analysis.overall_score,
                    ats_score=analysis.ats_score,
                    created_at=analysis.created_at
                )
        
        resume_dict = ResumeResponse.model_validate(resume).model_dump()
        resume_dict['latest_analysis'] = latest_analysis
        resume_responses.append(ResumeResponse(**resume_dict))
    
    return ResumeListResponse(
        resumes=resume_responses,
        total=total
    )


@router.get("/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific resume by ID"""
    result = await db.execute(
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == str(current_user.id))
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get latest version
    version_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .limit(1)
    )
    latest_version = version_result.scalar_one_or_none()
    
    # Get latest analysis if version exists
    latest_analysis = None
    if latest_version:
        analysis_result = await db.execute(
            select(ResumeAnalysis)
            .where(ResumeAnalysis.resume_version_id == str(latest_version.id))
            .order_by(ResumeAnalysis.created_at.desc())
            .limit(1)
        )
        analysis = analysis_result.scalar_one_or_none()
        if analysis:
            latest_analysis = ResumeAnalysisSummary(
                id=str(analysis.id),
                overall_score=analysis.overall_score,
                ats_score=analysis.ats_score,
                created_at=analysis.created_at
            )
    
    return ResumeDetailResponse(
        resume=ResumeResponse.model_validate(resume),
        latest_version=latest_version,
        latest_analysis=latest_analysis
    )


@router.post("/{resume_id}/parse")
async def parse_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Parse a resume's raw text into structured data"""
    # Verify resume ownership
    result = await db.execute(
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == str(current_user.id))
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get latest resume version with raw text
    version_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .limit(1)
    )
    latest_version = version_result.scalar_one_or_none()
    
    if not latest_version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume version not found"
        )
    
    if not latest_version.raw_text or len(latest_version.raw_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is too short or empty. Please re-upload the resume."
        )
    
    # Parse with AI
    try:
        parsed_data = await resume_parser_service.parse_resume(latest_version.raw_text)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI parsing service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}"
        )
    
    # Update parsed_data in database
    latest_version.parsed_data = parsed_data
    await db.commit()
    await db.refresh(latest_version)
    
    return {"parsed_data": parsed_data}


@router.post("/{resume_id}/analyze", response_model=ResumeAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze a resume using AI to generate ATS scores and recommendations"""
    # Verify resume ownership
    result = await db.execute(
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == str(current_user.id))
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get latest resume version with parsed data
    version_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .limit(1)
    )
    latest_version = version_result.scalar_one_or_none()
    
    if not latest_version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume version not found"
        )
    
    if not latest_version.parsed_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume must be parsed before analysis. Please parse the resume first."
        )
    
    # Analyze with AI
    try:
        analysis_data = await resume_analysis_service.analyze_resume(latest_version.parsed_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI analysis service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze resume: {str(e)}"
        )
    
    # Create analysis record
    analysis = ResumeAnalysis(
        resume_version_id=str(latest_version.id),
        overall_score=analysis_data["overall_score"],
        ats_score=analysis_data["ats_score"],
        content_score=analysis_data["content_score"],
        skills_score=analysis_data["skills_score"],
        experience_score=analysis_data["experience_score"],
        formatting_score=analysis_data["formatting_score"],
        keyword_score=analysis_data["keyword_score"],
        strengths=analysis_data["strengths"],
        weaknesses=analysis_data["weaknesses"],
        recommendations=analysis_data["recommendations"],
        missing_keywords=analysis_data["missing_keywords"],
        detected_skills=analysis_data["detected_skills"],
        raw_result=analysis_data,
        model_name="gemini-3.5-flash-lite",
        model_version="1"
    )
    
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    
    # Send resume analysis email in background
    email_content = email_service.resume_analysis_email(current_user.full_name, analysis.ats_score)
    asyncio.create_task(
        email_service.send_email(
            to_email=current_user.email,
            subject="Your Resume Analysis Results",
            html_content=email_content
        )
    )
    
    return analysis


@router.get("/{resume_id}/analysis", response_model=ResumeAnalysisResponse)
async def get_resume_analysis(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the latest analysis for a resume"""
    # Verify resume ownership
    result = await db.execute(
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == str(current_user.id))
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get latest resume version
    version_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .limit(1)
    )
    latest_version = version_result.scalar_one_or_none()
    
    if not latest_version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume version not found"
        )
    
    # Get latest analysis for this version
    analysis_result = await db.execute(
        select(ResumeAnalysis)
        .where(ResumeAnalysis.resume_version_id == str(latest_version.id))
        .order_by(ResumeAnalysis.created_at.desc())
        .limit(1)
    )
    analysis = analysis_result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analysis found for this resume. Please analyze the resume first."
        )
    
    return analysis


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a resume"""
    result = await db.execute(
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == str(current_user.id))
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete file from storage
    await storage_service.delete_file(resume.file_url)
    
    # Delete from database (cascade will handle versions)
    await db.execute(
        delete(Resume).where(Resume.id == resume_id)
    )
    await db.commit()
    
    return None


@router.post("/generate-summary")
async def generate_summary(
    parsed_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Generate AI professional summary from parsed resume data"""
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured"
        )
    
    client = genai.Client(api_key=settings.gemini_api_key)
    
    system_prompt = """You are an expert resume writer and career coach. 
Generate a compelling professional summary based on the provided resume data.
Return ONLY the summary text, no additional text or markdown formatting."""

    user_prompt = f"""Generate a professional summary (2-3 sentences) based on the following resume data:

{json.dumps(parsed_data, indent=2)}

Focus on: key achievements, years of experience, main skills, and career highlights.
Make it impactful and ATS-friendly."""

    try:
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=combined_prompt
        )
        
        summary = response.text.strip()
        # Clean up any markdown code blocks
        if summary.startswith('```'):
            summary = summary.split('\n', 1)[-1]
        if summary.endswith('```'):
            summary = summary.rsplit('\n', 1)[0]
        summary = summary.strip()
        
        return {"summary": summary}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )


@router.post("/generate-experience")
async def generate_experience(
    request_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Generate AI work experience description"""
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured"
        )
    
    job_title = request_data.get("job_title", "")
    company = request_data.get("company", "")
    skills = request_data.get("skills", [])
    
    client = genai.Client(api_key=settings.gemini_api_key)
    
    system_prompt = """You are an expert resume writer. 
Generate a compelling work experience description based on the provided job details.
Return ONLY the description text, no additional text or markdown formatting."""

    user_prompt = f"""Generate a professional work experience description (3-5 bullet points or a short paragraph) for:

Job Title: {job_title}
Company: {company}
Skills: {', '.join(skills) if skills else 'Not specified'}

Focus on:
- Key responsibilities and achievements
- Impact and results (use action verbs)
- Incorporate the provided skills naturally
- Make it ATS-friendly with relevant keywords
- Keep it concise but impactful"""

    try:
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=combined_prompt
        )
        
        description = response.text.strip()
        # Clean up any markdown code blocks
        if description.startswith('```'):
            description = description.split('\n', 1)[-1]
        if description.endswith('```'):
            description = description.rsplit('\n', 1)[0]
        description = description.strip()
        
        return {"description": description}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate experience description: {str(e)}"
        )


@router.post("/generate-project")
async def generate_project(
    request_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Generate AI project description"""
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured"
        )
    
    project_name = request_data.get("project_name", "")
    technologies = request_data.get("technologies", [])
    
    client = genai.Client(api_key=settings.gemini_api_key)
    
    system_prompt = """You are an expert resume writer. 
Generate a compelling project description based on the provided project details.
Return ONLY the description text, no additional text or markdown formatting."""

    user_prompt = f"""Generate a professional project description (2-4 sentences or bullet points) for:

Project Name: {project_name}
Technologies: {', '.join(technologies) if technologies else 'Not specified'}

Focus on:
- Project purpose and goals
- Key features and functionality
- Technical implementation highlights
- Impact and results
- Make it ATS-friendly with relevant keywords
- Keep it concise but impressive"""

    try:
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=combined_prompt
        )
        
        description = response.text.strip()
        # Clean up any markdown code blocks
        if description.startswith('```'):
            description = description.split('\n', 1)[-1]
        if description.endswith('```'):
            description = description.rsplit('\n', 1)[0]
        description = description.strip()
        
        return {"description": description}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate project description: {str(e)}"
        )


@router.post("/{resume_id}/optimize", response_model=ResumeResponse)
async def optimize_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Optimize a resume for ATS targeting 80%+ score"""
    # Verify resume ownership
    result = await db.execute(
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == str(current_user.id))
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get latest resume version with parsed data
    version_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .limit(1)
    )
    latest_version = version_result.scalar_one_or_none()
    
    if not latest_version or not latest_version.parsed_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume must have parsed data to optimize"
        )
    
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured"
        )
    
    client = genai.Client(api_key=settings.gemini_api_key)
    
    system_prompt = """You are an expert ATS resume optimizer. 
Rewrite resume content to maximize ATS compatibility and target 80%+ score.
Return ONLY valid JSON, no additional text or markdown formatting."""

    user_prompt = f"""Optimize the following resume data for ATS systems to achieve 80%+ score:

{json.dumps(latest_version.parsed_data, indent=2)}

Return the optimized data in this exact JSON format (no markdown, no code blocks):
{{
  "personal_info": {{
    "full_name": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "github": string,
    "website": string
  }},
  "summary": string,
  "experience": [{{
    "company": string,
    "title": string,
    "location": string,
    "start_date": string,
    "end_date": string,
    "is_current": boolean,
    "description": string
  }}],
  "education": [{{
    "institution": string,
    "degree": string,
    "field_of_study": string,
    "start_date": string,
    "end_date": string,
    "grade": string
  }}],
  "skills": [string],
  "projects": [{{
    "name": string,
    "description": string,
    "url": string,
    "technologies": [string]
  }}]
}}

Optimization guidelines:
- Enhance summary with strong keywords and measurable achievements
- Improve experience descriptions with action verbs and quantifiable results
- Add relevant technical and soft skills
- Ensure consistent formatting and structure
- Include industry-standard keywords
- Make descriptions ATS-friendly (clear, concise, keyword-rich)"""

    try:
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=combined_prompt
        )
        
        # Clean response text
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()
        
        optimized_data = json.loads(text)
        
        # Generate PDF from optimized data with default template
        pdf_filename = f"optimized_{resume.title}.pdf"
        pdf_path = await _generate_resume_pdf(optimized_data, pdf_filename, str(current_user.id), "classic")
        
        # Extract text from PDF
        extracted_text = await text_extraction_service.extract_text(pdf_path, pdf_filename)
        
        # Parse optimized resume
        parsed_optimized = await resume_parser_service.parse_resume(extracted_text)
        
        # Create new resume record
        new_resume = Resume(
            user_id=str(current_user.id),
            title=f"{resume.title} (Optimized)",
            original_filename=pdf_filename,
            file_url=pdf_path,
            file_type="application/pdf",
            file_size=os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0,
            is_active=True
        )
        
        db.add(new_resume)
        await db.flush()
        
        # Create resume version
        resume_version = ResumeVersion(
            resume_id=str(new_resume.id),
            version_number=1,
            source="optimize",
            raw_text=extracted_text,
            parsed_data=parsed_optimized
        )
        
        db.add(resume_version)
        await db.flush()
        
        # Auto-analyze the optimized resume
        try:
            analysis_data = await resume_analysis_service.analyze_resume(parsed_optimized)
            
            analysis = ResumeAnalysis(
                resume_version_id=str(resume_version.id),
                overall_score=analysis_data["overall_score"],
                ats_score=analysis_data["ats_score"],
                content_score=analysis_data["content_score"],
                skills_score=analysis_data["skills_score"],
                experience_score=analysis_data["experience_score"],
                formatting_score=analysis_data["formatting_score"],
                keyword_score=analysis_data["keyword_score"],
                strengths=analysis_data["strengths"],
                weaknesses=analysis_data["weaknesses"],
                recommendations=analysis_data["recommendations"],
                missing_keywords=analysis_data["missing_keywords"],
                detected_skills=analysis_data["detected_skills"],
                raw_result=analysis_data,
                model_name="gemini-3.5-flash-lite",
                model_version="1"
            )
            
            db.add(analysis)
        except Exception as e:
            print(f"Auto-analysis failed for optimized resume: {str(e)}")
        
        await db.commit()
        await db.refresh(new_resume)
        
        return new_resume
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize resume: {str(e)}"
        )


@router.post("/create-from-form", response_model=ResumeResponse)
async def create_resume_from_form(
    resume_data: dict,
    template_id: str = "classic",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a resume from form data and generate PDF with specified template"""
    # Validate template_id
    if template_id not in ["classic", "modern", "minimal", "professional"]:
        template_id = "classic"
    
    # Generate PDF from form data
    title = resume_data.get("personal_info", {}).get("full_name", "Untitled Resume")
    pdf_filename = f"{title.replace(' ', '_')}_resume.pdf"
    pdf_path = await _generate_resume_pdf(resume_data, pdf_filename, str(current_user.id), template_id)
    
    # Extract text from PDF
    extracted_text = await text_extraction_service.extract_text(pdf_path, pdf_filename)
    
    # Parse resume
    parsed_data = await resume_parser_service.parse_resume(extracted_text)
    
    # Create resume record
    resume = Resume(
        user_id=str(current_user.id),
        title=title,
        original_filename=pdf_filename,
        file_url=pdf_path,
        file_type="application/pdf",
        file_size=os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0,
        template_id=template_id,
        is_active=True
    )
    
    db.add(resume)
    await db.flush()
    
    # Create resume version
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="form",
        raw_text=extracted_text,
        parsed_data=parsed_data
    )
    
    db.add(resume_version)
    await db.commit()
    await db.refresh(resume)
    
    return resume


async def _generate_resume_pdf(resume_data: dict, filename: str, user_id: str, template_id: str = "classic") -> str:
    """Generate PDF from resume data using the PDF generator service with template support"""
    # Create user uploads directory if it doesn't exist
    uploads_dir = os.path.join("uploads", user_id)
    os.makedirs(uploads_dir, exist_ok=True)
    
    pdf_path = os.path.join(uploads_dir, filename)
    
    # Generate PDF using the new PDF generator service
    pdf_bytes = pdf_generator.generate_pdf(resume_data, template_id)
    
    # Write PDF bytes to file
    with open(pdf_path, 'wb') as f:
        f.write(pdf_bytes)
    
    return pdf_path


@router.post("/{resume_id}/regenerate-pdf", response_model=ResumeResponse)
async def regenerate_resume_pdf(
    resume_id: str,
    template_id: str = "classic",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Regenerate resume PDF with a different template"""
    # Validate template_id
    if template_id not in ["classic", "modern", "minimal", "professional"]:
        template_id = "classic"
    
    # Verify resume ownership
    result = await db.execute(
        select(Resume)
        .where(Resume.id == resume_id, Resume.user_id == str(current_user.id))
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get latest resume version with parsed data
    version_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .limit(1)
    )
    latest_version = version_result.scalar_one_or_none()
    
    if not latest_version or not latest_version.parsed_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume must have parsed data to regenerate PDF"
        )
    
    # Delete old PDF file
    try:
        await storage_service.delete_file(resume.file_url)
    except Exception as e:
        print(f"Failed to delete old PDF: {str(e)}")
    
    # Generate new PDF with new template
    pdf_filename = f"{resume.title.replace(' ', '_')}_resume.pdf"
    pdf_path = await _generate_resume_pdf(latest_version.parsed_data, pdf_filename, str(current_user.id), template_id)
    
    # Extract text from new PDF
    extracted_text = await text_extraction_service.extract_text(pdf_path, pdf_filename)
    
    # Parse new resume
    parsed_data = await resume_parser_service.parse_resume(extracted_text)
    
    # Update resume record
    resume.file_url = pdf_path
    resume.file_size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0
    resume.template_id = template_id
    
    # Update resume version
    latest_version.raw_text = extracted_text
    latest_version.parsed_data = parsed_data
    
    await db.commit()
    await db.refresh(resume)
    
    return resume
