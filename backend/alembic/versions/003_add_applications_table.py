"""Add applications table

Revision ID: 003
Revises: 002
Create Date: 2026-08-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create applications table
    op.create_table(
        'applications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('company_name', sa.String(255), nullable=False),
        sa.Column('job_title', sa.String(255), nullable=False),
        sa.Column('job_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='SAVED'),
        sa.Column('applied_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    # Drop applications table
    op.drop_table('applications')
