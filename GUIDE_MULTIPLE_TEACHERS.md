# Guide: Multiple Teachers per Class

## Overview
This feature allows assigning multiple teachers to a single class, enabling better representation of real-world scenarios where classes are taught by different subject teachers or have co-teachers.

## How to Use

### Assigning Teachers to a Class
1. Navigate to **Class Management**.
2. Click on the **Edit** icon for a specific class.
3. In the "Teachers" field, you can now select multiple teachers from the dropdown list.
4. Separate the "Main Teacher" (Titulaire) from other subject teachers if applicable (depending on the specific implementation details).

### Viewing Teacher Assignments
- In **Teacher Management**, the "Classes" column will list all classes a teacher is assigned to.
- In **Class Details**, all assigned teachers will be listed.

## Technical Details
- **Frontend**: Updated `ClassManagement.tsx` and `TeacherEditForm.tsx` to handle array of teachers.
- **Backend**: Updated `classes.service.ts` and `teachers.service.ts` to manage the many-to-many relationship.
- **Database**: Uses a join table or array storage to link teachers and classes (verify specific implementation in `class.entity.ts`).
