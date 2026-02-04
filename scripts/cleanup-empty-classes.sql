-- Delete timetable slots for empty classes first
DELETE FROM timetable_slots WHERE class_id IN (
  '263bc23a-1b39-4546-9d9c-ab0bb9652198', -- 6ème-A
  '52df67f2-74ff-494d-a3fb-c5fb99d0dc29', -- CE1-A
  'cd9978b4-c5c5-4562-b0e5-9df86463c46d', -- CE2-A
  '17298307-09ce-48b6-8b8a-ebcfcecb5c55', -- CM1-A
  'fd94b367-2c7f-4a34-9234-297e2a6017d9', -- CM2-A
  '63adc33e-b85a-42db-881a-48ef501ff2a8'  -- CP-A
);

-- Now delete the empty classes
DELETE FROM classes WHERE id IN (
  '263bc23a-1b39-4546-9d9c-ab0bb9652198', -- 6ème-A
  '52df67f2-74ff-494d-a3fb-c5fb99d0dc29', -- CE1-A
  'cd9978b4-c5c5-4562-b0e5-9df86463c46d', -- CE2-A
  '17298307-09ce-48b6-8b8a-ebcfcecb5c55', -- CM1-A
  'fd94b367-2c7f-4a34-9234-297e2a6017d9', -- CM2-A
  '63adc33e-b85a-42db-881a-48ef501ff2a8'  -- CP-A (legacy)
);

-- Verify remaining classes
SELECT c.id, c.name, c.level, c.academic_year, COUNT(s.id) as student_count 
FROM classes c 
LEFT JOIN students s ON s.class_id = c.id 
GROUP BY c.id, c.name, c.level, c.academic_year 
ORDER BY c.name;
