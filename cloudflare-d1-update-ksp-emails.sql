-- Migration KDS -> KSP Email Update for Cloudflare D1
-- Date: 25 novembre 2025
-- Purpose: Update all user emails from @kds-school to @ksp-school

-- Update all users with @kds-school.ci domain to @ksp-school.ci
UPDATE users 
SET email = REPLACE(email, '@kds-school.ci', '@ksp-school.ci')
WHERE email LIKE '%@kds-school.ci';

-- Update all users with @kds-school.com domain to @ksp-school.com
UPDATE users 
SET email = REPLACE(email, '@kds-school.com', '@ksp-school.com')
WHERE email LIKE '%@kds-school.com';

-- Verify the changes
SELECT id, email, role, first_name, last_name 
FROM users 
WHERE email LIKE '%@ksp-school%'
ORDER BY role, email;
