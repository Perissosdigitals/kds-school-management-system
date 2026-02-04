-- Migration: Add documents column to students table
ALTER TABLE students ADD COLUMN documents TEXT DEFAULT '[]';
