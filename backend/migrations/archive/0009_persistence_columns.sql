-- Migration 0009: Persistence and Synchronization Columns
-- Adds tracking columns for source-of-truth consistency as requested by the user

-- Update students table
ALTER TABLE students ADD COLUMN sync_status TEXT DEFAULT 'synced';
ALTER TABLE students ADD COLUMN validation_state TEXT DEFAULT 'valid';

-- Update teachers table
ALTER TABLE teachers ADD COLUMN sync_status TEXT DEFAULT 'synced';
ALTER TABLE teachers ADD COLUMN validation_state TEXT DEFAULT 'valid';

-- Update classes table
ALTER TABLE classes ADD COLUMN sync_status TEXT DEFAULT 'synced';
ALTER TABLE classes ADD COLUMN validation_state TEXT DEFAULT 'valid';

-- Update documents table
ALTER TABLE documents ADD COLUMN sync_status TEXT DEFAULT 'synced';
ALTER TABLE documents ADD COLUMN validation_state TEXT DEFAULT 'pending';

-- Update transactions table
ALTER TABLE transactions ADD COLUMN sync_status TEXT DEFAULT 'synced';
ALTER TABLE transactions ADD COLUMN validation_state TEXT DEFAULT 'confirmed';
