-- Migration: 00135_resource_permissions.sql
-- Description: Access policies and permission grants for resources and collections.

-- Create resource_access_policies table
CREATE TABLE public.resource_access_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'authenticated', -- private, organization, authenticated, controlled_public
    sensitivity VARCHAR(50) NOT NULL DEFAULT 'normal', -- normal, internal, instructor_only, restricted, confidential
    required_role VARCHAR(100),
    allow_anonymous BOOLEAN NOT NULL DEFAULT false,
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Create resource_access_grants table
CREATE TABLE public.resource_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_access_policy_id UUID NOT NULL REFERENCES public.resource_access_policies(id) ON DELETE CASCADE,
    grantee_type VARCHAR(50) NOT NULL DEFAULT 'role', -- role, user, group
    grantee_id VARCHAR(255) NOT NULL, -- role name, user UUID, group UUID
    permission_level VARCHAR(50) NOT NULL DEFAULT 'read', -- read, write, admin, sign_url
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_resource_access_grant UNIQUE (resource_access_policy_id, grantee_type, grantee_id, permission_level)
);

-- Create collection_access_policies table
CREATE TABLE public.collection_access_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_collection_id UUID NOT NULL REFERENCES public.resource_collections(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'authenticated',
    sensitivity VARCHAR(50) NOT NULL DEFAULT 'normal',
    required_role VARCHAR(100),
    allow_anonymous BOOLEAN NOT NULL DEFAULT false,
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Create collection_access_grants table
CREATE TABLE public.collection_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_access_policy_id UUID NOT NULL REFERENCES public.collection_access_policies(id) ON DELETE CASCADE,
    grantee_type VARCHAR(50) NOT NULL DEFAULT 'role',
    grantee_id VARCHAR(255) NOT NULL,
    permission_level VARCHAR(50) NOT NULL DEFAULT 'read',
    
    -- Status & Concurrency Columns
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    version_no INTEGER NOT NULL DEFAULT 1,
    lock_version BIGINT NOT NULL DEFAULT 0,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    CONSTRAINT uq_collection_access_grant UNIQUE (collection_access_policy_id, grantee_type, grantee_id, permission_level)
);
