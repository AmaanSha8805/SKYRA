"""Initial database schema

Revision ID: 001
Revises: 
Create Date: 2026-08-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
# SQLite dialect - no PostgreSQL-specific imports needed

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SQLite-compatible migration (no PostgreSQL extensions)
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('role', sa.String(20), nullable=False, server_default='USER'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('ix_users_email', 'email'),
    )
    
    # Create profiles table
    op.create_table(
        'profiles',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('headline', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('bio', sa.String(2000), nullable=True),
        sa.Column('target_role', sa.String(255), nullable=True),
        sa.Column('years_of_experience', sa.Integer(), nullable=True),
        sa.Column('career_goal', sa.String(1000), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    
    # Create skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('normalized_name', sa.String(255), unique=True, nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Index('ix_skills_normalized_name', 'normalized_name'),
    )
    
    # Create companies table
    op.create_table(
        'companies',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('normalized_name', sa.String(255), unique=True, nullable=False),
        sa.Column('website', sa.String(500), nullable=True),
        sa.Column('logo_url', sa.String(1000), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('ix_companies_normalized_name', 'normalized_name'),
    )
    
    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('company_id', sa.String(36), sa.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('normalized_title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('location', sa.String(255), nullable=False),
        sa.Column('employment_type', sa.String(50), nullable=False),
        sa.Column('experience_level', sa.String(50), nullable=False),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('salary_currency', sa.String(10), nullable=True),
        sa.Column('remote_type', sa.String(50), nullable=False),
        sa.Column('source', sa.String(50), nullable=False),
        sa.Column('external_url', sa.String(1000), nullable=True),
        sa.Column('posted_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('ix_jobs_company_id', 'company_id'),
        sa.Index('ix_jobs_is_active', 'is_active'),
        sa.Index('ix_jobs_normalized_title', 'normalized_title'),
        sa.Index('ix_jobs_posted_at', 'posted_at'),
    )
    
    # Create resumes table
    op.create_table(
        'resumes',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('original_filename', sa.String(500), nullable=False),
        sa.Column('file_url', sa.String(1000), nullable=False),
        sa.Column('file_type', sa.String(50), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('ix_resumes_user_id', 'user_id'),
    )
    
    # Create resume_versions table
    op.create_table(
        'resume_versions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('resume_id', sa.String(36), sa.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('source', sa.String(50), nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=True),
        sa.Column('parsed_data', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Index('ix_resume_versions_resume_id', 'resume_id'),
    )
    
    # Create experiences table
    op.create_table(
        'experiences',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('company_name', sa.String(255), nullable=False),
        sa.Column('job_title', sa.String(255), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('achievements', sa.String(), nullable=True),
    )
    
    # Create educations table
    op.create_table(
        'educations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('institution', sa.String(255), nullable=False),
        sa.Column('degree', sa.String(255), nullable=False),
        sa.Column('field_of_study', sa.String(255), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('grade', sa.String(50), nullable=True),
    )
    
    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('url', sa.String(1000), nullable=True),
        sa.Column('technologies', sa.String(), nullable=True),
    )
    
    # Create certifications table
    op.create_table(
        'certifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('issuer', sa.String(255), nullable=False),
        sa.Column('issue_date', sa.DateTime(), nullable=True),
        sa.Column('expiry_date', sa.DateTime(), nullable=True),
        sa.Column('credential_url', sa.String(1000), nullable=True),
    )
    
    # Create resume_skills table
    op.create_table(
        'resume_skills',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('proficiency', sa.String(50), nullable=True),
        sa.Column('years_of_experience', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(100), nullable=True),
    )
    
    # Create job_skills table
    op.create_table(
        'job_skills',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('job_id', sa.String(36), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_required', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('importance', sa.Integer(), nullable=True),
    )
    
    # Create job_applications table
    op.create_table(
        'job_applications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('job_id', sa.String(36), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('applied_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Index('ix_job_applications_job_id', 'job_id'),
        sa.Index('ix_job_applications_user_id', 'user_id'),
    )
    
    # Create resume_analyses table
    op.create_table(
        'resume_analyses',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('overall_score', sa.Integer(), nullable=False),
        sa.Column('ats_score', sa.Integer(), nullable=False),
        sa.Column('content_score', sa.Integer(), nullable=False),
        sa.Column('skills_score', sa.Integer(), nullable=False),
        sa.Column('experience_score', sa.Integer(), nullable=False),
        sa.Column('formatting_score', sa.Integer(), nullable=False),
        sa.Column('keyword_score', sa.Integer(), nullable=False),
        sa.Column('strengths', sa.String(), nullable=True),
        sa.Column('weaknesses', sa.String(), nullable=True),
        sa.Column('recommendations', sa.String(), nullable=True),
        sa.Column('raw_result', sa.String(), nullable=True),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('model_version', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint('overall_score >= 0 AND overall_score <= 100', name='check_overall_score_range'),
        sa.CheckConstraint('ats_score >= 0 AND ats_score <= 100', name='check_ats_score_range'),
        sa.CheckConstraint('content_score >= 0 AND content_score <= 100', name='check_content_score_range'),
        sa.CheckConstraint('skills_score >= 0 AND skills_score <= 100', name='check_skills_score_range'),
        sa.CheckConstraint('experience_score >= 0 AND experience_score <= 100', name='check_experience_score_range'),
        sa.CheckConstraint('formatting_score >= 0 AND formatting_score <= 100', name='check_formatting_score_range'),
        sa.CheckConstraint('keyword_score >= 0 AND keyword_score <= 100', name='check_keyword_score_range'),
    )
    
    # Create job_matches table
    op.create_table(
        'job_matches',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('job_id', sa.String(36), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('overall_score', sa.Integer(), nullable=False),
        sa.Column('skills_score', sa.Integer(), nullable=False),
        sa.Column('experience_score', sa.Integer(), nullable=False),
        sa.Column('education_score', sa.Integer(), nullable=False),
        sa.Column('keyword_score', sa.Integer(), nullable=False),
        sa.Column('matched_skills', sa.String(), nullable=True),
        sa.Column('missing_skills', sa.String(), nullable=True),
        sa.Column('recommendations', sa.String(), nullable=True),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('model_version', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Index('ix_job_matches_job_id', 'job_id'),
        sa.Index('ix_job_matches_user_id', 'user_id'),
        sa.CheckConstraint('overall_score >= 0 AND overall_score <= 100', name='check_job_match_overall_score'),
        sa.CheckConstraint('skills_score >= 0 AND skills_score <= 100', name='check_job_match_skills_score'),
        sa.CheckConstraint('experience_score >= 0 AND experience_score <= 100', name='check_job_match_experience_score'),
        sa.CheckConstraint('education_score >= 0 AND education_score <= 100', name='check_job_match_education_score'),
        sa.CheckConstraint('keyword_score >= 0 AND keyword_score <= 100', name='check_job_match_keyword_score'),
    )
    
    # Create skill_gaps table
    op.create_table(
        'skill_gaps',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('current_level', sa.Integer(), nullable=False),
        sa.Column('target_level', sa.Integer(), nullable=False),
        sa.Column('priority', sa.String(50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    
    # Create career_roadmaps table
    op.create_table(
        'career_roadmaps',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('target_role', sa.String(255), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('generated_data', sa.String(), nullable=True),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('model_version', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    
    # Create cover_letters table
    op.create_table(
        'cover_letters',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('job_id', sa.String(36), sa.ForeignKey('jobs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('model_name', sa.String(100), nullable=False),
        sa.Column('model_version', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    
    # Create interviews table
    op.create_table(
        'interviews',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('job_id', sa.String(36), sa.ForeignKey('jobs.id', ondelete='SET NULL'), nullable=True),
        sa.Column('resume_version_id', sa.String(36), sa.ForeignKey('resume_versions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('interview_type', sa.String(50), nullable=False),
        sa.Column('difficulty', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('score', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
    )
    
    # Create interview_questions table
    op.create_table(
        'interview_questions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('interview_id', sa.String(36), sa.ForeignKey('interviews.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('difficulty', sa.String(50), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
    )
    
    # Create interview_answers table
    op.create_table(
        'interview_answers',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('question_id', sa.String(36), sa.ForeignKey('interview_questions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('strengths', sa.String(), nullable=True),
        sa.Column('weaknesses', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )
    
    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )
    
    # Create activities table
    op.create_table(
        'activities',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('event_data', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Index('ix_activities_created_at', 'created_at'),
        sa.Index('ix_activities_user_id', 'user_id'),
    )


def downgrade() -> None:
    op.drop_table('activities')
    op.drop_table('notifications')
    op.drop_table('interview_answers')
    op.drop_table('interview_questions')
    op.drop_table('interviews')
    op.drop_table('cover_letters')
    op.drop_table('career_roadmaps')
    op.drop_table('skill_gaps')
    op.drop_table('job_matches')
    op.drop_table('resume_analyses')
    op.drop_table('job_applications')
    op.drop_table('job_skills')
    op.drop_table('resume_skills')
    op.drop_table('certifications')
    op.drop_table('projects')
    op.drop_table('educations')
    op.drop_table('experiences')
    op.drop_table('resume_versions')
    op.drop_table('resumes')
    op.drop_table('jobs')
    op.drop_table('companies')
    op.drop_table('skills')
    op.drop_table('profiles')
    op.drop_table('users')
    # SQLite - no extensions to drop
