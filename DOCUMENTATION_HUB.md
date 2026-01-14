# 📚 KSP Documentation Hub & Version Map

**System Version**: 1.2.0 (Local) / 1.0.0 (Cloudflare)  
**Last Updated**: 2026-01-13  

This hub indexes all project documentation, mapping each file to its relevant environment and feature version. Use this to navigate the system's extensive documentation library.

---

## 🚀 Getting Started (v1.0+)
*Essential guides for all developers and environments.*

| Document | Description | Env |
|----------|-------------|-----|
| [README.md](./README.md) | Entry point, core project overview | All |
| [QUICK_START.md](./QUICK_START.md) | 5-minute setup guide | All |
| [INITIATION_GUIDE.md](./INITIATION_GUIDE.md) | Onboarding for new devs | All |
| [PROJECT_STATUS_REPORT.md](./PROJECT_STATUS_REPORT.md) | High-level system status executive summary | All |
| [COMPTES_TEST.md](./COMPTES_TEST.md) | Test accounts for login (Admin/Teacher/Student) | All |

---

## 🌍 Environment & Architecture (v1.0+)
*Understanding the Dual-Environment strategy.*

| Document | Description | Key For |
|----------|-------------|---------|
| [ENVIRONMENT_SEPARATION_GUIDE.md](./ENVIRONMENT_SEPARATION_GUIDE.md) | **CRITICAL**: Explains Local (PG) vs Cloudflare (D1) | DevOps |
| [VERSION_MANAGEMENT_STRATEGY.md](./VERSION_MANAGEMENT_STRATEGY.md) | Strategy for syncing features across envs | Lead Dev |
| [ARCHITECTURE_3_TIERS_DATA.md](./ARCHITECTURE_3_TIERS_DATA.md) | Data flow diagram and 3-tier architecture | All |
| [CONNEXION_BASE_DONNEES.md](./CONNEXION_BASE_DONNEES.md) | DB connection details (TypeORM + D1) | Backend |
| [DATA_CONSISTENCY.md](./DATA_CONSISTENCY.md) | Ensuring data integrity between envs | Backend |

### Cloudflare Specifics
- [CLOUDFLARE_DEPLOYMENT_COMPLETE.md](./CLOUDFLARE_DEPLOYMENT_COMPLETE.md)
- [D1_MIGRATION_COMPLETE.md](./D1_MIGRATION_COMPLETE.md)
- [ENVIRONMENT_SETUP_COMPLETE.md](./ENVIRONMENT_SETUP_COMPLETE.md)

---

## 📦 Core Modules (v1.0 - Stable)
*Features available in BOTH Local and Cloudflare environments.*

### 👥 Students & Classes
| Document | Focus |
|----------|-------|
| [STUDENT_CRUD_COMPLETE_REPORT.md](./STUDENT_CRUD_COMPLETE_REPORT.md) | Student management implementation |
| [CLASSE_MODULE_IMPROVEMENTS.md](./CLASSE_MODULE_IMPROVEMENTS.md) | Class management logic |
| [ENROLLMENT_WORKFLOW_REPORT.md](./ENROLLMENT_WORKFLOW_REPORT.md) | 3-step registration process |

### 🎓 Academic (Grades & Attendance)
| Document | Focus |
|----------|-------|
| [NOTES_MODULE_FINAL.md](./NOTES_MODULE_FINAL.md) | **Master Doc**: Grading system logic |
| [GESTION_MULTIPLES_NOTES.md](./GESTION_MULTIPLES_NOTES.md) | Handling multiple grades per subject |
| [EMPLOIS_DU_TEMPS_MODULE.md](./EMPLOIS_DU_TEMPS_MODULE.md) | Timetable scheduling |
| [VIE_SCOLAIRE_COMPLETE.md](./VIE_SCOLAIRE_COMPLETE.md) | Attendance and discipline |

### 🔐 Authentication
- [NOUVEAU_PORTAIL_LOGIN.md](./NOUVEAU_PORTAIL_LOGIN.md)
- [FIX_LOGIN_REDIRECT.md](./FIX_LOGIN_REDIRECT.md)

---

## 💰 Advanced Modules (v1.2 - Local Only)
*Features currently STAGED in Local, preparing for Cloudflare.*

> ⚠️ **Note**: These features require database tables (`finances`, `transactions`) not yet in D1.

| Document | Feature | Migration Priority |
|----------|---------|--------------------|
| **Finance Module** | Revenue/Expense tracking | HIGH |
| [STATISTIQUES_TEMPS_REEL.md](./STATISTIQUES_TEMPS_REEL.md) | Real-time Dashboard Analytics | MEDIUM |
| [DATA_MANAGEMENT_FINAL_REPORT.md](./DATA_MANAGEMENT_FINAL_REPORT.md) | Bulk data tools | LOW |

---

## 🛠️ Testing & Quality Assurance
*Ensuring stability before release.*

| Document | Scope |
|----------|-------|
| [E2E_TESTING_STUDY.md](./E2E_TESTING_STUDY.md) | **Master Doc**: Playwright strategy |
| [E2E_TEST_MATRIX.md](./E2E_TEST_MATRIX.md) | Test coverage matrix |
| [TEST_LOGIN.md](./TEST_LOGIN.md) | Manual test cases for Auth |
| [TEST_STUDENT_CRUD.md](./TEST_STUDENT_CRUD.md) | Manual test cases for CRUD |

---

## 📜 Migration & Deployment Guides
*How to move from Local to Production.*

- [DB_SYNC_REPORT.md](./DB_SYNC_REPORT.md) - History of DB synchronizations
- [DEPLOYMENT_REPORT.md](./DEPLOYMENT_REPORT.md) - Deployment logs
- [CHANGELOG.md](./CHANGELOG.md) - Version history

---

## 🔍 Detailed Specification Index
*Low-level technical details for specific implementations.*

<details>
<summary>Click to expand technical docs</summary>

- [API_ENDPOINTS.md](./API_ENDPOINTS.md)
- [CRUD_IMPLEMENTATION.md](./CRUD_IMPLEMENTATION.md)
- [FIX_DASHBOARD_STATS.md](./FIX_DASHBOARD_STATS.md)
- [FIX_NOTES_CLASSDETAILVIEW.md](./FIX_NOTES_CLASSDETAILVIEW.md)
- [GUIDE_AJOUT_NOTES_MULTIPLES.md](./GUIDE_AJOUT_NOTES_MULTIPLES.md)
- [GUIDE_SIMULATION_NOTES.md](./GUIDE_SIMULATION_NOTES.md)
- [SECURITY_MONITORING_GUIDE.md](./SECURITY_MONITORING_GUIDE.md)

</details>

---

**Tip**: Always check `version.json` for the precise current state of the environment you are working in.
