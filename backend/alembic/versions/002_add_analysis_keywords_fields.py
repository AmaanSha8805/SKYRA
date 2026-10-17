"""Add missing_keywords and detected_skills to resume_analyses

Revision ID: 002
Revises: 001
Create Date: 2026-08-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
# SQLite dialect - no PostgreSQL-specific imports needed

# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add missing_keywords column to resume_analyses (SQLite-compatible)
    op.add_column('resume_analyses', 
                  sa.Column('missing_keywords', sa.String(), nullable=True))
    
    # Add detected_skills column to resume_analyses (SQLite-compatible)
    op.add_column('resume_analyses',
                  sa.Column('detected_skills', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove detected_skills column from resume_analyses
    op.drop_column('resume_analyses', 'detected_skills')
    
    # Remove missing_keywords column from resume_analyses
    op.drop_column('resume_analyses', 'missing_keywords')
