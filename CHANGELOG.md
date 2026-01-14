# Changelog

All notable changes to the KSP School Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned for v1.5.0
- Financial module deployment to Cloudflare
- Parent portal for student progress tracking
- PDF report generation
- Email and SMS notifications
- Complete E2E test coverage

---

## [1.2.0-local] - 2026-01-13

### Added
- **Financial Module**: Revenue and expense tracking with FCFA currency
  - Revenue tracking with categories
  - Expense management
  - Real-time balance calculation
  - Financial dashboard with charts
- **Advanced Analytics**: Enhanced dashboard with detailed metrics
  - Student enrollment trends
  - Teacher workload distribution
  - Class capacity utilization
  - Financial health indicators
- Extended data sets (139 students, 8 teachers, 6 classes)

### Changed
- Dashboard UI enhanced with financial widgets
- Improved data visualization with charts
- Updated local database schema for financial tables

### Database Changes (PostgreSQL)
- Added `finances` table
- Added `payments` table
- Added `invoices` table
- Added indexes for financial queries

---

## [1.1.0] - 2025-12-01

### Added
- **Advanced Student Filtering**: 7 simultaneous filters
  - Search by name (case-insensitive)
  - Filter by class/grade level
  - Filter by assigned teacher
  - Filter by status (Active/Inactive/Pending)
  - Filter by gender
  - Filter by enrollment date range
- **Enhanced Grade Management**
  - Multiple grades per subject
  - Weighted average calculation
  - Coefficient-based grading
  - Trimester/semester support
- **Teacher Assignment Tracking**
  - Class-teacher relationships
  - Subject specializations
  - Workload monitoring

### Changed
- Student management UI with expandable filter panel
- Grade entry form with batch operations
- Teacher profile with assigned classes display

### Fixed
- Grade calculation rounding errors
- Enrollment date validation
- Class capacity overflow handling

---

## [1.0.0-cloudflare] - 2025-11-20

### Added
- **Initial Cloudflare Deployment**
  - Cloudflare Pages for frontend hosting
  - Cloudflare Workers for backend API
  - Cloudflare D1 for database
  - Cloudflare R2 for file storage
- **Core Modules**
  - Authentication & Authorization (JWT-based)
  - Student Management (CRUD)
  - Teacher Management (CRUD)
  - Class Management (CRUD)
  - Enrollment Workflow (3-step process)
  - Attendance Tracking (daily)
  - Grade Management (basic)
- **E2E Testing Framework**
  - Playwright test setup
  - 8 test cycles covering main workflows
  - Automated test execution

### Database
- D1 schema with 11 tables
- Normalized data structure
- Proper indexes and constraints
- Seed data (70 students, 5 teachers, 10 classes)

### Infrastructure
- Dual-environment setup (Local + Cloudflare)
- Environment-specific configuration
- Automated deployment scripts
- Health check endpoints

---

## [0.9.0] - 2025-11-15

### Added
- Local development environment setup
- PostgreSQL database configuration
- NestJS backend with TypeORM
- React frontend with Vite
- Basic CRUD operations for students and teachers

### Infrastructure
- Docker Compose for local services
- Environment variable management
- Development scripts (start-local.sh, stop-local.sh)

---

## [0.8.0] - 2025-11-10

### Added
- Project initialization
- Technology stack selection
- Architecture design
- Database schema design
- API endpoint planning

---

## Version Comparison

| Version | Environment | Students | Teachers | Classes | Features |
|---------|-------------|----------|----------|---------|----------|
| 1.2.0-local | Local | 139 | 8 | 6 | 9 modules |
| 1.0.0-cloudflare | Cloudflare | 70 | 5 | 10 | 7 modules |

---

## Migration Notes

### From 1.0.0 to 1.2.0 (Local Only)

**Database Changes**:
```sql
-- Add financial tables
CREATE TABLE finances (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK(type IN ('revenue', 'expense')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    amount DECIMAL(10,2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**API Changes**:
- New endpoints: `/api/v1/finances/*`
- New endpoints: `/api/v1/payments/*`
- New endpoints: `/api/v1/invoices/*`

---

## Upcoming Changes

### v1.5.0 (Target: 2026-01-27)
- [ ] Migrate financial module to Cloudflare D1
- [ ] Create E2E tests for financial workflows
- [ ] Deploy to Cloudflare production
- [ ] Achieve 100% feature parity

### v2.0.0 (Target: 2026-02-15)
- [ ] Parent portal
- [ ] PDF report generation
- [ ] Email/SMS notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

**Berakhot ve-Shalom! 🙏**
