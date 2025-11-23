"""add recurrence fields to notifications

Revision ID: add_recurrence_fields
Revises: create_users_table
Create Date: 2025-11-24

"""
from alembic import op
import sqlalchemy as sa

revision = 'add_recurrence_fields'
down_revision = 'create_users_table'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('notifications', sa.Column('is_recurring', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('notifications', sa.Column('recurrence_pattern', sa.String(), nullable=True))
    op.add_column('notifications', sa.Column('recurrence_end_date', sa.DateTime(), nullable=True))

def downgrade() -> None:
    op.drop_column('notifications', 'recurrence_end_date')
    op.drop_column('notifications', 'recurrence_pattern')
    op.drop_column('notifications', 'is_recurring')
