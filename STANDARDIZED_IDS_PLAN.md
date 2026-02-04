# 🆔 Standardized Human-Readable IDs Plan
## KDS School Management System

**Date Created**: 2026-01-22  
**Status**: 📋 PLANNING  
**Version**: 1.0

---

## 🎯 Executive Summary

This document defines the comprehensive standardized ID system for all entities in the KDS School Management System. The goal is to ensure **consistency**, **human-readability**, and **uniqueness** across the entire platform.

### Key Principles

1. **Human-Readable**: IDs should be easily readable and memorable
2. **Meaningful Prefixes**: Each entity type has a distinct 3-letter prefix
3. **Year-Based**: Most IDs include the academic year for context
4. **Sequential**: Predictable numbering within each category
5. **Unique**: Guaranteed uniqueness through database constraints

---

## 📊 Current Implementation Status

### ✅ Implemented Entities

#### Students: `MAT-YYYY-XXX`
- **Prefix**: MAT (Matricule - French for registration number)
- **Format**: `MAT-2025-001`, `MAT-2025-002`, etc.
- **Example**: `MAT-2025-143` (143rd student registered in 2025)
- **Implementation**: 
  - `backend/apps/api-gateway/src/modules/students/students.service.ts`
  - `backfill-ids.cjs`
- **Status**: ✅ Fully operational

#### Teachers: `ENS-YYYY-XXX`
- **Prefix**: ENS (Enseignant - French for teacher)
- **Format**: `ENS-2025-001`, `ENS-2025-002`, etc.
- **Example**: `ENS-2025-008` (8th teacher hired in 2025)
- **Implementation**:
  - `backend/apps/api-gateway/src/modules/teachers/teachers.service.ts`
  - `backfill-ids.cjs`
- **Status**: ✅ Fully operational

---

## 🆕 Proposed ID Formats

### Core Personnel Entities

| Entity | Prefix | Format | Example | Year-Based | Digits | Description |
|--------|--------|--------|---------|------------|--------|-------------|
| **Students** | MAT | `MAT-YYYY-XXX` | `MAT-2025-001` | ✅ Yes | 3 | ✅ Existing |
| **Teachers** | ENS | `ENS-YYYY-XXX` | `ENS-2025-001` | ✅ Yes | 3 | ✅ Existing |
| **Parents** | PAR | `PAR-YYYY-XXX` | `PAR-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Staff** | STF | `STF-YYYY-XXX` | `STF-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Administrators** | ADM | `ADM-YYYY-XXX` | `ADM-2025-001` | ✅ Yes | 3 | 🆕 New |

### Academic Structure Entities

| Entity | Prefix | Format | Example | Year-Based | Digits | Description |
|--------|--------|--------|---------|------------|--------|-------------|
| **Classes** | CLS | `CLS-YYYY-XXX` | `CLS-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Subjects** | SUB | `SUB-XXX` | `SUB-001` | ❌ No | 3 | 🆕 Permanent |
| **Evaluations** | EVL | `EVL-YYYY-XXX` | `EVL-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Timetable Sessions** | TMS | `TMS-YYYY-XXX` | `TMS-2025-001` | ✅ Yes | 3 | 🆕 New |

### High-Volume Academic Records

| Entity | Prefix | Format | Example | Year-Based | Digits | Description |
|--------|--------|--------|---------|------------|--------|-------------|
| **Grades** | GRD | `GRD-YYYY-XXXXXX` | `GRD-2025-000001` | ✅ Yes | 6 | 🆕 High volume |
| **Attendance Records** | ATT | `ATT-YYYY-XXXXXX` | `ATT-2025-000001` | ✅ Yes | 6 | 🆕 High volume |

### Administrative Documents

| Entity | Prefix | Format | Example | Year-Based | Digits | Description |
|--------|--------|--------|---------|------------|--------|-------------|
| **Student Documents** | DOC | `DOC-YYYY-XXX` | `DOC-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Certificates** | CRT | `CRT-YYYY-XXX` | `CRT-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Reports** | RPT | `RPT-YYYY-XXX` | `RPT-2025-001` | ✅ Yes | 3 | 🆕 New |

### Financial Entities

| Entity | Prefix | Format | Example | Year-Based | Digits | Description |
|--------|--------|--------|---------|------------|--------|-------------|
| **Invoices** | INV | `INV-YYYY-XXX` | `INV-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Payments** | PAY | `PAY-YYYY-XXX` | `PAY-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Receipts** | RCP | `RCP-YYYY-XXX` | `RCP-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Transactions** | TXN | `TXN-YYYY-XXXXXX` | `TXN-2025-000001` | ✅ Yes | 6 | 🆕 High volume |

### Operational Entities

| Entity | Prefix | Format | Example | Year-Based | Digits | Description |
|--------|--------|--------|---------|------------|--------|-------------|
| **Events** | EVT | `EVT-YYYY-XXX` | `EVT-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Meetings** | MTG | `MTG-YYYY-XXX` | `MTG-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Announcements** | ANN | `ANN-YYYY-XXX` | `ANN-2025-001` | ✅ Yes | 3 | 🆕 New |
| **Activities** | ACT | `ACT-YYYY-XXX` | `ACT-2025-001` | ✅ Yes | 3 | 🆕 New |

### Inventory & Assets

| Entity | Prefix | Format | Example | Year-Based | Digits | Description |
|--------|--------|--------|---------|------------|--------|-------------|
| **Inventory Items** | ITM | `ITM-XXX` | `ITM-001` | ❌ No | 3 | 🆕 Permanent |
| **Assets** | AST | `AST-XXX` | `AST-001` | ❌ No | 3 | 🆕 Permanent |

---

## 🔧 Technical Implementation

### ID Generation Algorithm

```typescript
/**
 * Generate a standardized registration number
 * @param prefix - Entity prefix (e.g., 'MAT', 'ENS', 'CLS')
 * @param yearBased - Whether to include year in the ID
 * @param digits - Number of digits for sequential part (3 or 6)
 * @returns Generated registration number
 */
async generateRegistrationNumber(
  prefix: string, 
  yearBased: boolean = true, 
  digits: number = 3
): Promise<string> {
  const currentYear = new Date().getFullYear().toString();
  const basePrefix = yearBased ? `${prefix}-${currentYear}-` : `${prefix}-`;
  
  // Find the last record with this prefix
  const lastRecord = await this.repository
    .createQueryBuilder('entity')
    .where('entity.registrationNumber LIKE :prefix', { 
      prefix: `${basePrefix}%` 
    })
    .orderBy('entity.registrationNumber', 'DESC')
    .getOne();
  
  let nextNumber = 1;
  if (lastRecord?.registrationNumber) {
    const parts = lastRecord.registrationNumber.split('-');
    const lastNumber = parseInt(parts[parts.length - 1] || '0');
    nextNumber = lastNumber + 1;
  }
  
  return `${basePrefix}${nextNumber.toString().padStart(digits, '0')}`;
}
```

### Database Schema Requirements

**Add `registration_number` column to all entity tables**:

```sql
-- Template for adding registration_number column
ALTER TABLE {table_name} 
ADD COLUMN registration_number VARCHAR(20) UNIQUE NOT NULL;

-- Create index for performance
CREATE INDEX idx_{table_name}_registration_number 
ON {table_name}(registration_number);

-- Add constraint for format validation (optional)
ALTER TABLE {table_name}
ADD CONSTRAINT chk_{table_name}_registration_number_format
CHECK (registration_number ~ '^[A-Z]{3}-(\d{4}-)?(\d{3}|\d{6})$');
```

### Example Implementations

#### Classes Service

```typescript
// backend/apps/api-gateway/src/modules/classes/classes.service.ts

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(SchoolClass)
    private classRepository: Repository<SchoolClass>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<SchoolClass> {
    // Generate registration number
    const registrationNumber = await this.generateRegistrationNumber();
    
    const newClass = this.classRepository.create({
      ...createClassDto,
      registrationNumber,
    });
    
    return this.classRepository.save(newClass);
  }

  private async generateRegistrationNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString();
    const prefix = `CLS-${currentYear}-`;
    
    const lastClass = await this.classRepository
      .createQueryBuilder('class')
      .where('class.registrationNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('class.registrationNumber', 'DESC')
      .getOne();
    
    let nextNumber = 1;
    if (lastClass?.registrationNumber) {
      const lastNumber = parseInt(lastClass.registrationNumber.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }
}
```

#### Parents Service

```typescript
// backend/apps/api-gateway/src/modules/parents/parents.service.ts

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
  ) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    const registrationNumber = await this.generateRegistrationNumber();
    
    const newParent = this.parentRepository.create({
      ...createParentDto,
      registrationNumber,
    });
    
    return this.parentRepository.save(newParent);
  }

  private async generateRegistrationNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString();
    const prefix = `PAR-${currentYear}-`;
    
    const lastParent = await this.parentRepository
      .createQueryBuilder('parent')
      .where('parent.registrationNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('parent.registrationNumber', 'DESC')
      .getOne();
    
    let nextNumber = 1;
    if (lastParent?.registrationNumber) {
      const lastNumber = parseInt(lastParent.registrationNumber.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }
}
```

---

## 📋 Migration Strategy

### Phase 1: Priority Entities (Week 1)

**Classes** (`CLS-YYYY-XXX`)
1. Add `registration_number` column to `classes` table
2. Implement `generateRegistrationNumber()` in `classes.service.ts`
3. Run backfill script for existing classes
4. Update API responses to include registration number

**Parents** (`PAR-YYYY-XXX`)
1. Create parents module if not exists
2. Add `registration_number` column to `parents` table
3. Implement ID generation
4. Link to students via relationships

**Documents** (`DOC-YYYY-XXX`)
1. Add `registration_number` to `documents` table
2. Update `documents.service.ts`
3. Backfill existing documents

### Phase 2: Secondary Entities (Week 2)

**Subjects, Evaluations, Timetable Sessions**
- Follow same pattern as Phase 1
- Implement ID generation for each entity

### Phase 3: High-Volume Entities

**Grades & Attendance**
- Use 6-digit format for scalability
- Optimize bulk generation for performance
- Consider batch processing for backfill

### Backfill Script Template

```javascript
// scripts/backfill-entity-ids.cjs
const { DataSource } = require('typeorm');

async function backfillEntityIds(entityName, tableName, prefix, yearBased = true) {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await dataSource.initialize();
  const repository = dataSource.getRepository(entityName);

  // Get all entities without registration numbers
  const entities = await repository.find({
    where: { registrationNumber: null },
    order: { createdAt: 'ASC' },
  });

  console.log(`Found ${entities.length} ${entityName} records to backfill`);

  let count = 0;
  for (const entity of entities) {
    const regNumber = await generateId(repository, prefix, yearBased);
    await repository.update(entity.id, { registrationNumber: regNumber });
    count++;
    
    if (count % 10 === 0) {
      console.log(`Processed ${count}/${entities.length}`);
    }
  }

  console.log(`✅ Backfilled ${count} ${entityName} records`);
  await dataSource.destroy();
}

async function generateId(repository, prefix, yearBased) {
  const currentYear = new Date().getFullYear().toString();
  const basePrefix = yearBased ? `${prefix}-${currentYear}-` : `${prefix}-`;
  
  const lastRecord = await repository
    .createQueryBuilder('entity')
    .where('entity.registrationNumber LIKE :prefix', { prefix: `${basePrefix}%` })
    .orderBy('entity.registrationNumber', 'DESC')
    .getOne();
  
  let nextNumber = 1;
  if (lastRecord?.registrationNumber) {
    const parts = lastRecord.registrationNumber.split('-');
    nextNumber = parseInt(parts[parts.length - 1]) + 1;
  }
  
  return `${basePrefix}${nextNumber.toString().padStart(3, '0')}`;
}

// Run backfill
backfillEntityIds('SchoolClass', 'classes', 'CLS', true)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
```

---

## ✅ Validation & Testing

### Format Validation Tests

```typescript
describe('Registration Number Format', () => {
  it('should match year-based format', () => {
    const yearBasedRegex = /^[A-Z]{3}-\d{4}-\d{3}$/;
    expect('MAT-2025-001').toMatch(yearBasedRegex);
    expect('ENS-2025-123').toMatch(yearBasedRegex);
    expect('CLS-2025-045').toMatch(yearBasedRegex);
  });

  it('should match permanent format', () => {
    const permanentRegex = /^[A-Z]{3}-\d{3}$/;
    expect('SUB-001').toMatch(permanentRegex);
    expect('ITM-123').toMatch(permanentRegex);
  });

  it('should match high-volume format', () => {
    const highVolumeRegex = /^[A-Z]{3}-\d{4}-\d{6}$/;
    expect('GRD-2025-000001').toMatch(highVolumeRegex);
    expect('ATT-2025-123456').toMatch(highVolumeRegex);
  });
});
```

### Uniqueness Tests

```typescript
describe('Registration Number Uniqueness', () => {
  it('should not allow duplicate registration numbers', async () => {
    const student1 = await studentsService.create({ ...data });
    const student2 = await studentsService.create({ ...data });
    
    expect(student1.registrationNumber).not.toBe(student2.registrationNumber);
  });

  it('should detect duplicates in database', async () => {
    const duplicates = await repository
      .createQueryBuilder('entity')
      .select('entity.registrationNumber')
      .groupBy('entity.registrationNumber')
      .having('COUNT(*) > 1')
      .getRawMany();
    
    expect(duplicates).toHaveLength(0);
  });
});
```

### Sequential Numbering Tests

```typescript
describe('Sequential Numbering', () => {
  it('should increment sequentially', async () => {
    const entity1 = await service.create({ ...data });
    const entity2 = await service.create({ ...data });
    
    const num1 = parseInt(entity1.registrationNumber.split('-').pop());
    const num2 = parseInt(entity2.registrationNumber.split('-').pop());
    
    expect(num2).toBe(num1 + 1);
  });
});
```

---

## 📖 Usage Examples

### Creating a New Student

```typescript
const newStudent = await studentsService.create({
  firstName: 'Jean',
  lastName: 'Kouassi',
  // ... other fields
});

console.log(newStudent.registrationNumber); // MAT-2025-144
```

### Creating a New Class

```typescript
const newClass = await classesService.create({
  name: '6ème A',
  level: '6ème',
  academicYear: '2024-2025',
  // ... other fields
});

console.log(newClass.registrationNumber); // CLS-2025-007
```

### Querying by Registration Number

```typescript
const student = await studentsService.findByRegistrationNumber('MAT-2025-001');
const teacher = await teachersService.findByRegistrationNumber('ENS-2025-003');
const classEntity = await classesService.findByRegistrationNumber('CLS-2025-001');
```

---

## 🎯 Best Practices

### DO ✅

- Always generate IDs automatically in the service layer
- Use database constraints to enforce uniqueness
- Include registration numbers in API responses
- Display registration numbers in the UI for easy reference
- Use registration numbers in reports and exports
- Log ID generation for audit trails

### DON'T ❌

- Don't allow manual ID entry
- Don't reuse IDs from deleted entities
- Don't change ID formats mid-year
- Don't skip numbers in the sequence
- Don't use IDs as primary keys (use UUIDs for that)

---

## 📊 Benefits

1. **Human-Readable**: Easy to communicate (e.g., "Student MAT-2025-001")
2. **Searchable**: Quick lookup in UI and databases
3. **Auditable**: Year-based IDs help track when entities were created
4. **Organized**: Clear categorization by prefix
5. **Scalable**: 3-digit format supports 999 entities per year per type
6. **Professional**: Consistent with institutional standards

---

## 🚀 Roadmap

- **Week 1**: Implement Classes, Parents, Documents
- **Week 2**: Implement Subjects, Evaluations, Timetable
- **Week 3**: Implement High-Volume entities (Grades, Attendance)
- **Week 4**: Implement Financial and Operational entities
- **Week 5**: Testing, validation, and documentation updates

---

**Berakhot ve-Shalom! 🙏**

*This standardized ID system will bring consistency and professionalism to the entire KDS School Management System.*
