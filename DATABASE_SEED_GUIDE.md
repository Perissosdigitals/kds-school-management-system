# DATABASE SEEDING - Complete School Year Data

## 🎉 What Has Been Created

I've created a **comprehensive seed SQL file** that will populate your database with realistic school data for academic year **2024-2025**:

### 📊 Data Breakdown

- **117 Users** (2 admin + 10 teachers + 5 workers + 100 parents/students)
- **100 Students** (distributed across 10 classes by age)
- **10 Teachers** (with specializations)
- **5 Workers** (1 Accountant, 1 Manager, 3 Agents)
- **10 Classes**:
  - **3 Maternelle**: Petite Section A, Moyenne Section A, Grande Section A
  - **7 Primaire**: CP1 A, CP2 A, CE1 A, CE2 A, CM1 A, CM1 B, CM2 A
- **12 Subjects** (4 maternelle + 8 primaire)
- **~5,600 Grades** (8 evaluations per student per subject)
- **~6,500 Attendance Records** (Sept 1 - Dec 3, 2024)
- **300 Financial Transactions** (tuition fees for 3 terms)
- **300 Student Documents**
- **Full Timetable Schedules** for all classes

### 🏫 Class Distribution

| Class | Level | Students | Ages |
|-------|-------|----------|------|
| Petite Section A | Maternelle | 10 | 3-4 |
| Moyenne Section A | Maternelle | 10 | 4-5 |
| Grande Section A | Maternelle | 10 | 5-6 |
| CP1 A | Primaire | 10 | 6-7 |
| CP2 A | Primaire | 10 | 7-8 |
| CE1 A | Primaire | 10 | 8-9 |
| CE2 A | Primaire | 10 | 9-10 |
| CM1 A | Primaire | 15 | 10-11 |
| CM1 B | Primaire | 10 | 10-11 |
| CM2 A | Primaire | 5 | 11-12 |

## 📁 Files Created

1. **`backend/shared/database/seed-full-school.sql`** (700+ lines)
   - Complete SQL seed with all data
   - Includes TRUNCATE statements to clean existing data
   - Has built-in summary statistics
   
2. **`backend/apps/api-gateway/src/modules/seed/seed.controller.ts`**
   - NestJS endpoint to run seed via API: `POST /api/v1/seed/full-school`
   - Requires backend to be running with database connection

3. **`scripts/seed-database.cjs`**
   - Node.js script to run seed directly
   - Requires PostgreSQL connection details

## 🚀 How to Run the Seed

### Option 1: Using PostgreSQL CLI (Recommended)

```bash
# If you have psql installed
psql -U postgres -d kds_school_db -f backend/shared/database/seed-full-school.sql
```

### Option 2: Using pgAdmin or DBeaver

1. Open pgAdmin or DBeaver
2. Connect to `kds_school_db` database
3. Open SQL Query window
4. Copy-paste contents of `backend/shared/database/seed-full-school.sql`
5. Execute

### Option 3: Via Backend API Endpoint

1. Ensure PostgreSQL is running and backend can connect
2. Start backend: `cd backend && npm run dev`
3. Call seed endpoint:
   ```bash
   curl -X POST http://localhost:3002/api/v1/seed/full-school
   ```

### Option 4: Using TablePlus or Postico (macOS)

1. Open TablePlus or Postico
2. Connect to `localhost:5432`, database `kds_school_db`
3. Click "SQL Query" or "Query" tab
4. Paste seed SQL and run

## 🗄️ Sample Logins (After Seeding)

### Admin Accounts
```
Email: director@kds.ci
Password: password123
Role: Director

Email: admin@kds.ci
Password: password123
Role: Admin
```

### Teacher Accounts  
```
Email: teacher1@kds.ci (through teacher10@kds.ci)
Password: password123
Role: Teacher
```

### Student/Parent Accounts
```
Email: eleve1@kds.ci (through eleve100@kds.ci)
Password: password123
Role: Student

Email: parent1@famille.ci (through parent100@famille.ci)
Password: password123
Role: Parent
```

> **Note**: All passwords are hashed with bcrypt. The hash in the seed file is for `password123`.

## ✅ Verify Data Population

After running the seed, verify with these queries:

```sql
-- Check record counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes
UNION ALL
SELECT 'Grades', COUNT(*) FROM grades
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance;

-- Check class distribution
SELECT c.name, c.level, COUNT(s.id) as student_count
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
GROUP BY c.id, c.name, c.level
ORDER BY c.level, c.name;

-- Check grade statistics
SELECT 
  COUNT(*) as total_grades,
  ROUND(AVG(grade), 2) as average_grade,
  MIN(grade) as min_grade,
  MAX(grade) as max_grade
FROM grades;

-- Check attendance rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM attendance
GROUP BY status;
```

## 📝 What's Included

### Realistic Data Features

- ✅ **Students** with proper birth dates, student codes (KDS-2024-XXX), addresses
- ✅ **Classes** with main teachers, room numbers, capacities
- ✅ **Grades** distributed realistically (some students perform better)
- ✅ **Attendance** records with 85% present, 10% absent, 5% late
- ✅ **Financial** transactions (tuition split into 3 terms)
- ✅ **Timetable** schedules (weekly for each class)
- ✅ **Documents** (birth certificates, health records, vaccination records)
- ✅ **Relationships** properly maintained (foreign keys intact)

### Data Relationships

```
Users ──┐
        ├─> Students ──> Classes ──> Teachers
        │              │
        │              ├─> Grades ──> Subjects
        │              ├─> Attendance
        │              ├─> Financial Transactions
        │              └─> Documents
        │
        └─> Parents (linked to students)
```

## 🎯 Next Steps

1. **Run the seed** using one of the options above
2. **Verify data** with the SQL queries provided
3. **Start backend**: `cd backend && npm run dev`
4. **Start frontend**: `npm run dev`
5. **Test CRUD operations** through the DataBrowser component
6. **Login** as admin/teacher/student and explore!

## 🐛 Troubleshooting

### "password authentication failed for user postgres"
- Check PostgreSQL trust authentication in `pg_hba.conf`
- Or set correct password in connection config

### "relation does not exist"
- Ensure schema is created first: run `backend/shared/database/schema.sql`
- Check database name is correct: `kds_school_db`

### "Cannot connect to PostgreSQL"
- Ensure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check port 5432 is accessible

## 📚 Additional Resources

- **Schema File**: `backend/shared/database/schema.sql`
- **Architecture Doc**: `ARCHITECTURE_3_TIERS_DATA.md`
- **Data Browser**: Navigate to "Data Management" → "Sources de Données" → Click any table

---

**Berakhot ve-Shalom!** Your database is ready for a full school year simulation! 🎓
