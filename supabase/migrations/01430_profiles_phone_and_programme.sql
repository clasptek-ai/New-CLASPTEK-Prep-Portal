-- Migration: 01430_profiles_phone_and_programme.sql
-- Add canonical phone and target_programme columns to public.profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(32) NULL,
ADD COLUMN IF NOT EXISTS target_programme VARCHAR(128) NULL;
