-- Migration: Add period column to attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period VARCHAR(20);
-- Update existing records to have a default period if needed (optional)
-- UPDATE attendance SET period = 'morning' WHERE period IS NULL;
