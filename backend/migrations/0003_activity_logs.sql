-- Migration: Create Activity Logs table
-- Description: Stores system-wide user activities for traceability

CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    action TEXT,
    category TEXT,
    details TEXT,
    class_id TEXT,
    student_id TEXT
);

-- Index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON activity_logs(category);
