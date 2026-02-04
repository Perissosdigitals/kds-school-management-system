-- Migration 0008: Advanced Dashboard Aggregation Metrics
-- Creates a key-value store for pre-calculated metrics to optimize dashboard performance

CREATE TABLE IF NOT EXISTS dashboard_metrics (
    metric_key TEXT PRIMARY KEY,
    metric_value REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize metrics with current counts from the database
INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value)
SELECT 'total_students', COUNT(*) FROM students WHERE LOWER(status) IN ('active', 'actif');

INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value)
SELECT 'total_teachers', COUNT(*) FROM teachers WHERE LOWER(status) IN ('active', 'actif');

INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value)
SELECT 'active_classes', COUNT(*) FROM classes WHERE is_active = 1;

INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value)
SELECT 'pending_documents', COUNT(*) FROM documents WHERE LOWER(status) IN ('pending', 'en attente');

INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value)
SELECT 'total_revenue', COALESCE(SUM(amount_paid), 0) FROM transactions WHERE type = 'revenue';

-- Add specific gender metrics for the new dashboard
INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value)
SELECT 'students_male', COUNT(*) FROM students WHERE LOWER(gender) IN ('masculin', 'male', 'm') AND LOWER(status) IN ('active', 'actif');

INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value)
SELECT 'students_female', COUNT(*) FROM students WHERE LOWER(gender) IN ('féminin', 'female', 'f') AND LOWER(status) IN ('active', 'actif');
