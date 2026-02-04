-- Migration: Add status column to documents table
ALTER TABLE documents ADD COLUMN status TEXT DEFAULT 'Validé';
