-- Update class names to match Ivorian system
-- Change "CP 1" to "CP1" and "CP 2" to "CP2"

UPDATE classes 
SET name = 'CP1', updated_at = NOW()
WHERE name = 'CP 1';

UPDATE classes 
SET name = 'CP2', updated_at = NOW()
WHERE name = 'CP 2';

-- Verify the changes
SELECT id, name, level, academic_year FROM classes WHERE level = 'CP';
