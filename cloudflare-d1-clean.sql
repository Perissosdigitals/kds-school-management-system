-- Nettoyer uniquement les tables qui existent
DELETE FROM timetable_slots WHERE 1=1;
DELETE FROM attendance WHERE 1=1;
DELETE FROM grades WHERE 1=1;
DELETE FROM students WHERE 1=1;
DELETE FROM subjects WHERE 1=1;
DELETE FROM classes WHERE 1=1;
DELETE FROM teachers WHERE 1=1;
DELETE FROM users WHERE 1=1;
