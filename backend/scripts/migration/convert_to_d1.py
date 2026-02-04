import sys
import os
import re

def convert_postgres_to_d1(input_file, output_file):
    print(f"Reading from {input_file}...")
    with open(input_file, 'r') as f:
        sql = f.read()

    # 1. Remove public. prefix
    sql = sql.replace('public.', '')

    # 2. Convert true/false to 1/0 (booleans)
    sql = sql.replace('true', '1')
    sql = sql.replace('false', '0')

    # 3. Clean up PostgreSQL specific commands
    sql = re.sub(r'SET [\w_]+ = [^;]+;', '', sql)
    sql = sql.replace('SELECT pg_catalog.set_config(', '-- SELECT pg_catalog.set_config(')
    sql = re.sub(r'-- Data for Name: [^;]+; TYPE: TABLE DATA', '', sql)
    
    # 4. Remove transaction markers (Wrangler handles this)
    sql = sql.replace('BEGIN;', '')
    sql = sql.replace('COMMIT;', '')
    sql = sql.replace('BEGIN TRANSACTION;', '')

    # 5. COLUMN RENAMES (Generic Header Replacement)
    def rename_cols(match):
        table = match.group(1)
        cols = match.group(2)
        if table == 'students':
            cols = cols.replace('registration_number', 'student_code')
            cols = cols.replace('dob', 'birth_date')
            cols = cols.replace('registration_date', 'enrollment_date')
            cols = cols.replace('grade_level', 'academic_level')
        elif table == 'teachers':
            cols = cols.replace('subject', 'specialization')
        elif table == 'classes':
            cols = cols.replace('room', 'room_number')
        elif table == 'transactions':
            cols = cols.replace('amount_total', 'amount')
            cols = cols.replace('transaction_date', 'date')
        elif table == 'documents':
            cols = cols.replace('"filePath"', 'r2_key')
            cols = cols.replace('"fileName"', 'filename')
            cols = cols.replace('"type"', 'doc_type')
        return f"INSERT INTO {table} ({cols})"

    sql = re.sub(r"INSERT INTO (students|teachers|classes|transactions|documents) \(([^)]+)\)", rename_cols, sql)

    # 6. VALUE NORMALIZATION
    sql = sql.replace("'Actif'", "'active'")
    sql = sql.replace("'Inactif'", "'inactive'")
    sql = sql.replace("'En attente'", "'pending'")
    sql = sql.replace("'Validé'", "'approved'")
    sql = sql.replace("'Rejeté'", "'rejected'")

    # 8. Filter out non-SQL lines like \restrict, metadata
    sql_lines = []
    for line in sql.splitlines():
        trimmed = line.strip()
        if trimmed.startswith('\\') or trimmed.startswith('-- Dumped') or trimmed == '--':
            continue
        sql_lines.append(line)
    sql = '\n'.join(sql_lines)

    print(f"Writing converted SQL to {output_file}...")
    with open(output_file, 'w') as f:
        f.write(sql)
    print("Conversion complete!")

if __name__ == "__main__":
    input_path = "scripts/migration/local_data_dump.sql"
    output_path = "migrations/0002_production_data_import.sql"
    convert_postgres_to_d1(input_path, output_path)
