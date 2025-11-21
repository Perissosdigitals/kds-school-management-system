-- Clean all tables in correct order (reverse of foreign key dependencies)
DELETE FROM attendance;
DELETE FROM grades;
DELETE FROM timetable_slots;
DELETE FROM students;
DELETE FROM classes;
DELETE FROM subjects;
DELETE FROM teachers;
DELETE FROM users;
