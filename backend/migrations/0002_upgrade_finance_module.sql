-- Migration: Upgrade Finance Module (v1.2.0)
-- Description: Align D1 transactions table with Local PostgreSQL v1.2 schema
-- Date: 2026-01-13

-- 1. Create new transactions table with full v1.2 schema
CREATE TABLE transactions_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    type TEXT NOT NULL, -- Enum: 'Revenu', 'Dépense'
    category TEXT NOT NULL, -- Enum: 'Frais de scolarité', etc.
    amount REAL NOT NULL,
    amount_paid REAL DEFAULT 0,
    amount_remaining REAL DEFAULT 0,
    transaction_date TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL, -- Enum: 'En attente', 'Payé', 'Partiel', 'En retard', 'Annulé'
    student_id TEXT,
    description TEXT,
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    recorded_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Migrate existing data (Best Effort specific to KSP v1.0 -> v1.2)
-- Mapping:
-- transaction_type 'fee', 'scholarship' -> 'Revenu' (assuming fee is income)
-- transaction_type 'payment' -> 'Revenu'
-- transaction_type 'refund' -> 'Dépense'
INSERT INTO transactions_new (
    id, student_id, type, category, amount, amount_paid, amount_remaining,
    transaction_date, status, description, payment_method, reference_number,
    recorded_by, created_at
)
SELECT 
    id, 
    student_id,
    CASE 
        WHEN transaction_type IN ('fee', 'payment') THEN 'Revenu'
        WHEN transaction_type = 'refund' THEN 'Dépense'
        ELSE 'Revenu'
    END,
    'Autre', -- Default category as v1.0 didn't have specific categories matching v1.2
    amount,
    amount, -- Assume fully paid if it exists in v1.0
    0,      -- Remaining 0
    COALESCE(transaction_date, created_at),
    CASE 
        WHEN status = 'completed' THEN 'Payé'
        WHEN status = 'pending' THEN 'En attente'
        WHEN status = 'cancelled' THEN 'Annulé'
        ELSE 'Payé'
    END,
    description,
    payment_method,
    reference_number,
    processed_by, -- allocated to recorded_by
    created_at
FROM transactions;

-- 3. Drop old table
DROP TABLE transactions;

-- 4. Rename new table
ALTER TABLE transactions_new RENAME TO transactions;

-- 5. Re-create indexes
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_student ON transactions(student_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
