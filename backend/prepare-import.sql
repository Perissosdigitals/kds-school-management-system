-- Clean tables before import
DELETE FROM attendance;
DELETE FROM grades;
DELETE FROM documents;
DELETE FROM transactions;
DELETE FROM subjects;
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM classes;
DELETE FROM users WHERE role != 'admin';
