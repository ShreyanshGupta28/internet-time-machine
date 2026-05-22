"""initial schema

Revision ID: 001_initial_schema
Revises: None
Create Date: 2026-05-22 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Table users
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=True),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('analyses_today', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('analyses_reset', sa.Date(), nullable=False, server_default=sa.text('CURRENT_DATE')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('clerk_id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_users_clerk_id', 'users', ['clerk_id'], unique=False)

    # 2. Table domains
    op.create_table(
        'domains',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=False),
        sa.Column('first_captured', sa.Date(), nullable=True),
        sa.Column('last_captured', sa.Date(), nullable=True),
        sa.Column('total_snapshots', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain')
    )
    op.create_index('idx_domains_domain', 'domains', ['domain'], unique=False)
    op.create_index('idx_domains_view_count', 'domains', ['view_count'], unique=False)

    # 3. Table snapshots
    op.create_table(
        'snapshots',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('domain_id', sa.UUID(), nullable=False),
        sa.Column('wayback_ts', sa.String(length=14), nullable=False),
        sa.Column('captured_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('page_title', sa.String(length=500), nullable=True),
        sa.Column('wayback_url', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain_id', 'wayback_ts', name='idx_snapshots_domain_ts')
    )
    op.create_index('idx_snapshots_domain_id_ts', 'snapshots', ['domain_id', 'captured_at'], unique=False)

    # 4. Table biographies
    op.create_table(
        'biographies',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('domain_id', sa.UUID(), nullable=False),
        sa.Column('biography_md', sa.Text(), nullable=False),
        sa.Column('design_eras', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('key_moments', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('one_liner', sa.String(length=200), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain_id')
    )

    # 5. Table saved_domains
    op.create_table(
        'saved_domains',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('domain_id', sa.UUID(), nullable=False),
        sa.Column('personal_note', sa.Text(), nullable=True),
        sa.Column('saved_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'domain_id', name='saved_domains_user_domain_uc')
    )
    op.create_index('idx_saved_domains_user_id', 'saved_domains', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_saved_domains_user_id', table_name='saved_domains')
    op.drop_table('saved_domains')
    op.drop_table('biographies')
    op.drop_index('idx_snapshots_domain_id_ts', table_name='snapshots')
    op.drop_table('snapshots')
    op.drop_index('idx_domains_view_count', table_name='domains')
    op.drop_index('idx_domains_domain', table_name='domains')
    op.drop_table('domains')
    op.drop_index('idx_users_clerk_id', table_name='users')
    op.drop_table('users')
