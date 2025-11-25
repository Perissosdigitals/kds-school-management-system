# E2E Test Matrix - KSP School Management System

**Date**: 24 novembre 2025  
**Version**: 1.0  
**Purpose**: Test tracking & results

---

## Matrix Structure

Each test has:
- **ID**: Unique identifier
- **Cycle**: Notes, Présences, Data Mgmt, Multi-Rôles
- **Scenario**: User story description
- **Prerequisites**: Setup required
- **Steps**: Detailed test steps
- **Expected**: Expected result
- **Status**: ⏳ Pending | ✅ Pass | ❌ Fail | ⚠️ Blocked
- **Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)

---

## Cycle 1: Notes Complètes

| ID | Scenario | Prerequisites | Steps | Expected | Status | Priority |
|----|----------|---------------|-------|----------|--------|----------|
| **N-001** | Teacher creates single grade | Teacher logged in, class assigned | 1. Navigate /grades/entry<br>2. Select class/subject<br>3. Enter grade data<br>4. Submit | Grade saved, HTTP 201, ID returned | ⏳ | P0 |
| **N-002** | Teacher creates bulk grades (30) | Same as N-001, 30 students loaded | 1. Load students list<br>2. Enter 30 grades<br>3. Submit bulk | All 30 saved atomically, < 500ms | ⏳ | P0 |
| **N-003** | Validation max_value | Grade form open | 1. Enter value > max_value<br>2. Submit | Error: "Value exceeds max", 400 Bad Request | ⏳ | P0 |
| **N-004** | Teacher dashboard shows own classes | Teacher logged in | 1. Navigate /dashboard/teacher<br>2. View grades stats | Only assigned classes visible | ⏳ | P0 |
| **N-005** | Admin dashboard shows all classes | Admin logged in | 1. Navigate /dashboard/admin<br>2. View grades stats | All classes visible | ⏳ | P0 |
| **N-006** | Student report card calculation | Grades exist for student | 1. GET /grades/report-card/student/:id<br>2. Check averages | Subject avg = Σ(val*coef)/Σcoef, Trimester avg correct | ⏳ | P0 |
| **N-007** | Student ranking correct | Multiple students with grades | 1. GET report card<br>2. Check ranking | Ranking X/Y correct (sorted by avg DESC) | ⏳ | P1 |
| **N-008** | Export grades Excel | Grades exist for class | 1. GET /data/export/grades?classId=xxx<br>2. Download file | Valid .xlsx, columns correct, stats sheet included | ⏳ | P1 |
| **N-009** | Export grades CSV | Same as N-008 | 1. GET /data/export/grades?format=csv<br>2. Download | Valid CSV, UTF-8 BOM, semicolon separator | ⏳ | P1 |
| **N-010** | Archive trimester backup | Grades exist | 1. POST /data/backup {name, compress}<br>2. Verify | Backup created, compressed, metadata correct | ⏳ | P1 |

### Cycle 1 Summary
- **Total**: 10 tests
- **Status**: 0 Pass, 0 Fail, 10 Pending
- **Coverage**: CRUD, Calculs, Dashboards, Export, Archivage

---

## Cycle 2: Présences Complètes

| ID | Scenario | Prerequisites | Steps | Expected | Status | Priority |
|----|----------|---------------|-------|----------|--------|----------|
| **A-001** | Teacher daily attendance bulk (30) | Teacher logged in, class assigned | 1. Navigate /attendance/daily<br>2. Select class/date<br>3. Mark 30 students (present/absent/late)<br>4. Submit bulk | All 30 saved atomically, < 500ms | ⏳ | P0 |
| **A-002** | Duplicate check enforcement | Attendance exists for student/date | 1. Attempt duplicate POST<br>2. Submit | Error: "Duplicate record", 400 Bad Request | ⏳ | P0 |
| **A-003** | Parent justifies absence | Parent logged in, child has absence | 1. View absences<br>2. Upload document<br>3. Submit justification | isJustified = true, document saved, 200 OK | ⏳ | P0 |
| **A-004** | Parent cannot justify other child | Parent logged in, other student absence | 1. Attempt to justify<br>2. Submit | Error: 403 Forbidden | ⏳ | P0 |
| **A-005** | Student attendance pattern | Attendance records exist (60 days) | 1. GET /attendance/pattern/:studentId<br>2. Calculate stats | Present %, Absent %, Late % correct | ⏳ | P1 |
| **A-006** | Class absence rate | Attendance exists for class/month | 1. GET /attendance/stats/absence-rate?classId=xxx<br>2. Calculate | Rate = (absent days / total days) * 100, correct | ⏳ | P1 |
| **A-007** | Most absent students alert | Multiple students, varying absences | 1. GET /attendance/stats/most-absent<br>2. Sort | Top 5 most absent, sorted DESC | ⏳ | P1 |
| **A-008** | Unjustified absences count | Mix of justified/unjustified | 1. GET /attendance/stats/unjustified<br>2. Filter | Only unjustified counted | ⏳ | P1 |
| **A-009** | Export attendance Excel | Attendance exists for month | 1. GET /data/export/attendance?month=11<br>2. Download | Valid .xlsx, 3 sheets (daily, summary, stats) | ⏳ | P1 |
| **A-010** | Validate attendance data | Attendance records exist | 1. POST /data/validate/attendance<br>2. Check report | Report shows duplicates, missing refs, future dates | ⏳ | P1 |

### Cycle 2 Summary
- **Total**: 10 tests
- **Status**: 0 Pass, 0 Fail, 10 Pending
- **Coverage**: Appel, Justifications, Stats, Export, Validation

---

## Cycle 3: Data Management Operations

| ID | Scenario | Prerequisites | Steps | Expected | Status | Priority |
|----|----------|---------------|-------|----------|--------|----------|
| **D-001** | Export multi-domains | Data exists (grades, attendance, students) | 1. GET /export/grades<br>2. GET /export/attendance<br>3. GET /export/students<br>4. GET /export/all | 4 files generated, total time < 5s | ⏳ | P0 |
| **D-002** | Import validation detects errors | Invalid Excel file | 1. POST /data/validate-import {file}<br>2. Check report | Errors detected (format, missing fields, duplicates) | ⏳ | P0 |
| **D-003** | Import students success | Valid Excel file (10 new students) | 1. POST /data/import/students {file}<br>2. Check result | 10 created, 0 errors, < 3s | ⏳ | P0 |
| **D-004** | Import atomic transaction | File with 1 error in 100 records | 1. POST /data/import/students {file}<br>2. Check DB | All 100 rolled back, 0 partial imports | ⏳ | P0 |
| **D-005** | Validate grades data | Grades exist with issues | 1. POST /data/validate/grades<br>2. Check report | Issues found: value > max_value, missing refs | ⏳ | P1 |
| **D-006** | Integrity check comprehensive | Full DB with orphaned records | 1. GET /data/integrity-check<br>2. Analyze report | Orphaned grades detected, missing assignments flagged | ⏳ | P1 |
| **D-007** | Backup creation compressed | DB size ~50MB | 1. POST /data/backup {compress: true}<br>2. Check file | .sql.gz created, size ~5MB, < 10s | ⏳ | P0 |
| **D-008** | Backup list sorted | 5 backups exist | 1. GET /data/backup/list<br>2. Check order | Sorted by date DESC, metadata complete | ⏳ | P1 |
| **D-009** | Restore backup success | Backup exists, DB modified | 1. POST /data/restore/:id<br>2. Verify DB | DB reverted to backup state, 0 data loss | ⏳ | P0 |
| **D-010** | Migration preview accurate | Academic year 2024-2025 data | 1. POST /migrate/preview {years}<br>2. Check report | Students count, classes count, transitions correct | ⏳ | P0 |

### Cycle 3 Summary
- **Total**: 10 tests
- **Status**: 0 Pass, 0 Fail, 10 Pending
- **Coverage**: Export, Import, Validation, Backup, Restore, Migration

---

## Cycle 4: Flux Multi-Rôles

| ID | Scenario | Prerequisites | Steps | Expected | Status | Priority |
|----|----------|---------------|-------|----------|--------|----------|
| **R-001** | Admin access all modules | Admin logged in | 1. Navigate to 10 modules<br>2. Check access | All modules accessible, no 403 errors | ⏳ | P0 |
| **R-002** | Admin CRUD all entities | Admin logged in | 1. Create/Read/Update/Delete grades<br>2. Same for students<br>3. Same for teachers | All operations succeed | ⏳ | P0 |
| **R-003** | Teacher access assigned only | Teacher logged in, 2 classes assigned | 1. GET /grades?teacherId=self<br>2. GET /grades?teacherId=other | Own grades: 200, Other: 403 Forbidden | ⏳ | P0 |
| **R-004** | Teacher cannot delete students | Teacher logged in | 1. DELETE /students/:id | Error: 403 Forbidden | ⏳ | P0 |
| **R-005** | Teacher cannot access data mgmt | Teacher logged in | 1. GET /data/backup/list<br>2. POST /data/backup | Both: 403 Forbidden | ⏳ | P0 |
| **R-006** | Parent access own children only | Parent logged in, 2 children | 1. GET /grades/report-card/student/own-child<br>2. GET /grades/report-card/student/other-child | Own child: 200, Other: 403 | ⏳ | P0 |
| **R-007** | Parent can justify absence | Parent logged in, child absence | 1. PATCH /attendance/:id/justification<br>2. Check status | isJustified = true, 200 OK | ⏳ | P0 |
| **R-008** | Parent cannot modify grades | Parent logged in | 1. POST /grades<br>2. PUT /grades/:id | Both: 403 Forbidden | ⏳ | P0 |
| **R-009** | Student read own data only | Student logged in | 1. GET /grades/report-card/student/self<br>2. GET /grades/report-card/student/other | Self: 200, Other: 403 | ⏳ | P0 |
| **R-010** | Student cannot modify anything | Student logged in | 1. POST /grades<br>2. PATCH /attendance/:id | Both: 403 Forbidden | ⏳ | P0 |

### Cycle 4 Summary
- **Total**: 10 tests
- **Status**: 0 Pass, 0 Fail, 10 Pending
- **Coverage**: Admin, Teacher, Parent, Student permissions

---

## Performance Tests

| ID | Metric | Target | Steps | Expected | Status |
|----|--------|--------|-------|----------|--------|
| **P-001** | GET /grades response time | p95 < 100ms | ab -n 1000 -c 10 | p95 < 100ms | ⏳ |
| **P-002** | POST /grades/bulk (30) | < 500ms | ab -n 100 -c 5 | p95 < 500ms | ⏳ |
| **P-003** | Export grades (500 records) | < 2s | Time export API call | Duration < 2000ms | ⏳ |
| **P-004** | Concurrent users (50) | < 5% error rate | artillery run load-test | Error rate < 5% | ⏳ |
| **P-005** | Cache hit rate | > 60% | Check Redis stats | Hit rate > 60% | ⏳ |

---

## Security Tests

| ID | Check | Steps | Expected | Status |
|----|-------|-------|----------|--------|
| **S-001** | JWT validation | Invalid token request | 401 Unauthorized | ⏳ |
| **S-002** | RBAC enforcement | Teacher tries admin action | 403 Forbidden | ⏳ |
| **S-003** | SQL injection prevention | Malicious input | 400 Bad Request | ⏳ |
| **S-004** | XSS protection | Script tag input | Escaped as text | ⏳ |
| **S-005** | Rate limiting | 101 requests in 1 min | 429 Too Many Requests | ⏳ |

---

## Overall Summary

### Test Counts
| Cycle | Total | Pass | Fail | Pending | Blocked |
|-------|-------|------|------|---------|---------|
| **Cycle 1: Notes** | 10 | 0 | 0 | 10 | 0 |
| **Cycle 2: Présences** | 10 | 0 | 0 | 10 | 0 |
| **Cycle 3: Data Mgmt** | 10 | 0 | 0 | 10 | 0 |
| **Cycle 4: Multi-Rôles** | 10 | 0 | 0 | 10 | 0 |
| **Performance** | 5 | 0 | 0 | 5 | 0 |
| **Security** | 5 | 0 | 0 | 5 | 0 |
| **TOTAL** | **50** | **0** | **0** | **50** | **0** |

### Priority Breakdown
- **P0 (Critical)**: 32 tests (64%)
- **P1 (High)**: 18 tests (36%)
- **P2 (Medium)**: 0 tests
- **P3 (Low)**: 0 tests

### Coverage
- **Backend API**: 13/13 modules (100%)
- **Frontend Components**: 0/15 implemented (0%)
- **Workflows**: 4/4 cycles defined (100%)
- **Roles**: 4/4 roles tested (Admin, Teacher, Parent, Student)

---

## Test Execution Plan

### Week 1 (Days 1-5)
**Focus**: Setup + Cycle 1 (Notes)

**Day 1**: Environment setup
- [ ] Setup Playwright
- [ ] Create fixtures
- [ ] Write helper functions

**Day 2-3**: Cycle 1 Tests
- [ ] N-001 to N-005 (CRUD + Dashboards)
- [ ] N-006 to N-007 (Calculs + Ranking)

**Day 4-5**: Cycle 1 Continued
- [ ] N-008 to N-009 (Export)
- [ ] N-010 (Backup)
- [ ] Fix bugs found

### Week 2 (Days 6-10)
**Focus**: Cycles 2 & 3 (Présences + Data Mgmt)

**Day 6-7**: Cycle 2
- [ ] A-001 to A-005 (Attendance CRUD + Parent)
- [ ] A-006 to A-010 (Stats + Export)

**Day 8-10**: Cycle 3
- [ ] D-001 to D-005 (Export + Import + Validation)
- [ ] D-006 to D-010 (Backup + Restore + Migration)

### Week 3 (Days 11-14)
**Focus**: Cycle 4 + Performance + Security

**Day 11**: Cycle 4
- [ ] R-001 to R-010 (Multi-Rôles)

**Day 12**: Performance
- [ ] P-001 to P-005 (Benchmarks)
- [ ] Optimize slow endpoints

**Day 13**: Security
- [ ] S-001 to S-005 (Security audit)
- [ ] Fix vulnerabilities

**Day 14**: Finalization
- [ ] Run full test suite
- [ ] Generate reports
- [ ] Document bugs

---

## Bug Tracking Template

When a test fails:

```markdown
### Bug Report

**ID**: BUG-XXX
**Cycle**: Notes / Présences / Data Mgmt / Multi-Rôles
**Test ID**: N-001, A-002, etc.
**Severity**: Critical / Major / Minor
**Priority**: P0 / P1 / P2 / P3

**Description**:
Brief description of the bug

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**:
What should happen

**Actual**:
What actually happened

**Screenshots**:
[Attach if applicable]

**Environment**:
- OS: macOS / Windows / Linux
- Browser: Chrome / Firefox / Safari
- Backend version: X.Y.Z
- Database: PostgreSQL 14

**Logs**:
```
Error logs here
```

**Status**: Open / In Progress / Fixed / Closed
**Assignee**: Developer name
**Fix Commit**: abc123 (when fixed)
```

---

## Test Results Format

After running tests, update this section:

```markdown
### Test Run #1 - 2025-11-25

**Environment**: Local dev
**Tester**: [Name]
**Duration**: 2h 30min

**Results**:
- Pass: 35/50 (70%)
- Fail: 10/50 (20%)
- Blocked: 5/50 (10%)

**Bugs Found**: 8
- Critical: 2 (BUG-001, BUG-002)
- Major: 4 (BUG-003 to BUG-006)
- Minor: 2 (BUG-007, BUG-008)

**Notes**:
- Performance tests all pass
- Security issues found in JWT validation
- Need to implement frontend components

**Next Steps**:
1. Fix critical bugs
2. Implement missing components
3. Re-run failed tests
```

---

## Automation Scripts

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Cycle
```bash
npm run test:e2e -- --project=cycle-notes
npm run test:e2e -- --project=cycle-attendance
npm run test:e2e -- --project=cycle-data-management
npm run test:e2e -- --project=cycle-multi-roles
```

### Run Performance Tests
```bash
npm run test:performance
```

### Run Security Tests
```bash
npm run test:security
```

### Generate Report
```bash
npm run test:report
```

---

## Conclusion

Cette matrice fournit:
- **50 tests E2E** détaillés et traçables
- **Plan d'exécution** sur 14 jours
- **Template bug tracking** standardisé
- **Scripts automation** pour CI/CD

**Usage**: Exécuter tests selon le plan, mettre à jour statuts, documenter bugs, générer rapports finaux.

---

**Maintenu par**: QA Team KSP  
**Dernière mise à jour**: 24 novembre 2025  
**Révision**: 1.0
