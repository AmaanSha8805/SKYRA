"""Add resume template field

Revision ID: 004
Revises: 003
Create Date: 2026-09-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add template_id column to resumes table
    op.add_column('resumes', sa.Column('template_id', sa.String(50), nullable=True, server_default='classic'))


def downgrade() -> None:
    # Remove template_id column from resumes table
    op.drop_column('resumes', 'template_id')