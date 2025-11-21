-- Inserts seulement (60 nouveaux élèves + 1 nouvelle classe CP2)
PRAGMA foreign_keys = OFF;

-- Nouvelle classe CP2-A
INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active, created_at, updated_at) VALUES
('class-010', 'CP2-A', 'CP2', '2024-2025', 'tchr-002', 'A-106', 25, 1, datetime('now'), datetime('now'));

PRAGMA foreign_keys = ON;
