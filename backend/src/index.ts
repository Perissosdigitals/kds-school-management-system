/**
 * Cloudflare Workers Backend for KSP School Management System
 * Lightweight API handler using Hono framework
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { bearerAuth } from 'hono/bearer-auth';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ========================================================================
// AUTH ROUTES
// ========================================================================

app.post('/api/v1/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    ).bind(email).first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // In production, verify password hash with bcrypt
    // For now, accepting any password for demo

    const token = await generateJWT(user, c.env.JWT_SECRET);

    return c.json({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
});

// ========================================================================
// STUDENTS ROUTES
// ========================================================================

app.get('/api/v1/students', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT s.*, c.name as class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.status = 'active'
      ORDER BY s.last_name, s.first_name
    `).all();

    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch students' }, 500);
  }
});

app.get('/api/v1/students/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const student = await c.env.DB.prepare(`
      SELECT s.*, c.name as class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `).bind(id).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    return c.json(student);
  } catch (error) {
    return c.json({ error: 'Failed to fetch student' }, 500);
  }
});

app.get('/api/v1/students/stats/count', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM students WHERE status = 'active'
    `).first();

    return c.json({ count: result?.count || 0 });
  } catch (error) {
    return c.json({ error: 'Failed to get count' }, 500);
  }
});

// POST - Create new student
app.post('/api/v1/students', async (c) => {
  try {
    const body = await c.req.json();
    const studentId = crypto.randomUUID();

    // Create student record with first_name and last_name directly
    await c.env.DB.prepare(`
      INSERT INTO students (id, student_code, first_name, last_name, birth_date, gender, nationality, 
        birth_place, address, enrollment_date, class_id, parent_id, emergency_contact, medical_info, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      studentId,
      body.studentCode || `KDS${Date.now()}`,
      body.firstName,
      body.lastName,
      body.birthDate,
      body.gender,
      body.nationality || null,
      body.birthPlace || null,
      body.address || null,
      body.enrollmentDate || new Date().toISOString().split('T')[0],
      body.classId || null,
      body.parentId || null,
      body.emergencyContact || null,
      body.medicalInfo || null
    ).run();

    return c.json({ id: studentId, message: 'Student created successfully' }, 201);
  } catch (error) {
    console.error('Create student error:', error);
    return c.json({ error: 'Failed to create student' }, 500);
  }
});

// PUT - Update student
app.put('/api/v1/students/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    // Update student record with first_name and last_name directly
    await c.env.DB.prepare(`
      UPDATE students SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        birth_date = COALESCE(?, birth_date),
        gender = COALESCE(?, gender),
        nationality = COALESCE(?, nationality),
        birth_place = COALESCE(?, birth_place),
        address = COALESCE(?, address),
        class_id = COALESCE(?, class_id),
        emergency_contact = COALESCE(?, emergency_contact),
        medical_info = COALESCE(?, medical_info),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.firstName || null,
      body.lastName || null,
      body.birthDate || null,
      body.gender || null,
      body.nationality || null,
      body.birthPlace || null,
      body.address || null,
      body.classId || null,
      body.emergencyContact || null,
      body.medicalInfo || null,
      body.status || null,
      id
    ).run();

    return c.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    return c.json({ error: 'Failed to update student' }, 500);
  }
});

// DELETE - Delete student (soft delete)
app.delete('/api/v1/students/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await c.env.DB.prepare(`
      UPDATE students SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return c.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete student' }, 500);
  }
});

// ========================================================================
// TEACHERS ROUTES
// ========================================================================

app.get('/api/v1/teachers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status = 'active'
      ORDER BY u.last_name, u.first_name
    `).all();

    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch teachers' }, 500);
  }
});

app.get('/api/v1/teachers/stats/count', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM teachers WHERE status = 'active'
    `).first();

    return c.json({ count: result?.count || 0 });
  } catch (error) {
    return c.json({ error: 'Failed to get count' }, 500);
  }
});

// POST - Create teacher
app.post('/api/v1/teachers', async (c) => {
  try {
    const body = await c.req.json();
    const userId = crypto.randomUUID();
    const teacherId = crypto.randomUUID();

    // Create user record first
    await c.env.DB.prepare(`
      INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 'student', 1)
    `).bind(
      userId,
      body.firstName,
      body.lastName,
      body.email,
      body.phone || null,
      body.password || 'default_password_hash'
    ).run();

    // Create teacher record
    await c.env.DB.prepare(`
      INSERT INTO teachers (id, user_id, hire_date, specialization, status)
      VALUES (?, ?, ?, ?, 'active')
    `).bind(
      teacherId,
      userId,
      body.hireDate || new Date().toISOString().split('T')[0],
      body.specializations ? JSON.stringify(body.specializations) : '[]'
    ).run();

    return c.json({ id: teacherId, message: 'Teacher created successfully' }, 201);
  } catch (error) {
    console.error('Create teacher error:', error);
    return c.json({ error: 'Failed to create teacher' }, 500);
  }
});

// PUT - Update teacher
app.put('/api/v1/teachers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    // Update user info
    if (body.firstName || body.lastName || body.email || body.phone) {
      const teacher = await c.env.DB.prepare('SELECT user_id FROM teachers WHERE id = ?').bind(id).first();
      if (teacher) {
        await c.env.DB.prepare(`
          UPDATE users SET 
            first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          body.firstName || null,
          body.lastName || null,
          body.email || null,
          body.phone || null,
          teacher.user_id
        ).run();
      }
    }

    // Update teacher info
    await c.env.DB.prepare(`
      UPDATE teachers SET
        hire_date = COALESCE(?, hire_date),
        specialization = COALESCE(?, specialization),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.hireDate || null,
      body.specializations ? JSON.stringify(body.specializations) : null,
      id
    ).run();

    return c.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    return c.json({ error: 'Failed to update teacher' }, 500);
  }
});

// DELETE - Delete teacher (soft delete)
app.delete('/api/v1/teachers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await c.env.DB.prepare(`
      UPDATE teachers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return c.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete teacher' }, 500);
  }
});

// ========================================================================
// CLASSES ROUTES
// ========================================================================

app.get('/api/v1/classes', async (c) => {
  try {
    // Get pagination parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = (page - 1) * limit;

    // Get filters
    const level = c.req.query('level');
    const academicYear = c.req.query('academicYear');
    const mainTeacherId = c.req.query('mainTeacherId');
    const search = c.req.query('search');

    // Build WHERE clause
    let whereConditions = ['c.is_active = 1'];
    const params: any[] = [];

    if (level) {
      whereConditions.push('c.level = ?');
      params.push(level);
    }
    if (academicYear) {
      whereConditions.push('c.academic_year = ?');
      params.push(academicYear);
    }
    if (mainTeacherId) {
      whereConditions.push('c.main_teacher_id = ?');
      params.push(mainTeacherId);
    }
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.level LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM classes c WHERE ${whereClause}
    `).bind(...params).first();
    const total = countResult?.count || 0;

    // Get paginated results
    const { results } = await c.env.DB.prepare(`
      SELECT c.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
             (SELECT COUNT(*) FROM students WHERE class_id = c.id AND status = 'active') as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.main_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE ${whereClause}
      ORDER BY c.level, c.name
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    return c.json({
      data: results,
      total: total,
      page: page,
      limit: limit
    });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return c.json({ error: 'Failed to fetch classes' }, 500);
  }
});

// Get single class by ID with full details
app.get('/api/v1/classes/:id', async (c) => {
  try {
    const classId = c.req.param('id');

    // Get class details
    const classData = await c.env.DB.prepare(`
      SELECT c.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
             (SELECT COUNT(*) FROM students WHERE class_id = c.id AND status = 'active') as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.main_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE c.id = ?
    `).bind(classId).first();

    if (!classData) {
      return c.json({ error: 'Class not found' }, 404);
    }

    // Get students in this class
    const { results: students } = await c.env.DB.prepare(`
      SELECT 
        s.id,
        s.student_code as registrationNumber,
        s.first_name as firstName,
        s.last_name as lastName,
        s.birth_date as dob,
        s.gender,
        s.nationality,
        s.birth_place as birthPlace,
        s.address,
        s.enrollment_date as enrollmentDate,
        s.enrollment_date as registrationDate,
        s.class_id as classId,
        s.academic_level as gradeLevel,
        s.previous_school as previousSchool,
        s.emergency_contact as emergencyContactPhone,
        s.medical_info as medicalInfo,
        s.status
      FROM students s
      WHERE s.class_id = ? AND s.status = 'active'
      ORDER BY s.last_name, s.first_name
    `).bind(classId).all();

    // Get main teacher details if exists
    let mainTeacher = null;
    if (classData.main_teacher_id) {
      const teacherData = await c.env.DB.prepare(`
        SELECT 
          t.id,
          u.first_name as firstName,
          u.last_name as lastName,
          t.specialization,
          u.email,
          u.phone,
          t.status
        FROM teachers t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
      `).bind(classData.main_teacher_id).first();

      if (teacherData) {
        mainTeacher = teacherData;
      }
    }

    // Get timetable for this class (try both table names for compatibility)
    let timetable = [];
    try {
      const result = await c.env.DB.prepare(`
        SELECT 
          ts.id,
          ts.day_of_week as day,
          ts.start_time as startTime,
          ts.end_time as endTime,
          ts.subject as subject,
          ts.class_id as classId,
          ts.teacher_id as teacherId,
          ts.room
        FROM timetable_slots ts
        WHERE ts.class_id = ?
        ORDER BY 
          CASE ts.day_of_week
            WHEN 'Lundi' THEN 1
            WHEN 'Mardi' THEN 2
            WHEN 'Mercredi' THEN 3
            WHEN 'Jeudi' THEN 4
            WHEN 'Vendredi' THEN 5
            ELSE 6
          END,
          ts.start_time
      `).bind(classId).all();
      timetable = result.results || [];
    } catch (e) {
      // Table might not exist or be empty, that's okay
      console.log('No timetable found:', e);
      timetable = [];
    }

    // Return full class details
    return c.json({
      ...classData,
      students: students,
      mainTeacher: mainTeacher,
      timetable: timetable || []
    });

  } catch (error) {
    console.error('Failed to fetch class details:', error);
    return c.json({ error: 'Failed to fetch class details' }, 500);
  }
});

app.get('/api/v1/classes/stats/count', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM classes WHERE is_active = 1
    `).first();

    return c.json({ count: result?.count || 0 });
  } catch (error) {
    return c.json({ error: 'Failed to get count' }, 500);
  }
});

// POST - Create class
app.post('/api/v1/classes', async (c) => {
  try {
    const body = await c.req.json();
    const classId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, 
        capacity, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      classId,
      body.name,
      body.level,
      body.academicYear || '2024-2025',
      body.mainTeacherId || null,
      body.roomNumber || null,
      body.capacity || 30
    ).run();

    return c.json({ id: classId, message: 'Class created successfully' }, 201);
  } catch (error) {
    console.error('Create class error:', error);
    return c.json({ error: 'Failed to create class' }, 500);
  }
});

// PUT - Update class
app.put('/api/v1/classes/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE classes SET
        name = COALESCE(?, name),
        level = COALESCE(?, level),
        academic_year = COALESCE(?, academic_year),
        main_teacher_id = COALESCE(?, main_teacher_id),
        room_number = COALESCE(?, room_number),
        capacity = COALESCE(?, capacity),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.name || null,
      body.level || null,
      body.academicYear || null,
      body.mainTeacherId || null,
      body.roomNumber || null,
      body.capacity || null,
      id
    ).run();

    return c.json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('Update class error:', error);
    return c.json({ error: 'Failed to update class' }, 500);
  }
});

// DELETE - Delete class (soft delete)
app.delete('/api/v1/classes/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await c.env.DB.prepare(`
      UPDATE classes SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();

    return c.json({ message: 'Class deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete class' }, 500);
  }
});

// ========================================================================
// GRADES ROUTES
// ========================================================================

app.get('/api/v1/grades', async (c) => {
  try {
    const { studentId, subjectId } = c.req.query();
    
    let query = `
      SELECT g.*, u.first_name as student_first_name, u.last_name as student_last_name,
             s.name as subject_name
      FROM grades g
      LEFT JOIN students st ON g.student_id = st.id
      LEFT JOIN users u ON st.user_id = u.id
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    if (studentId) {
      query += ' AND g.student_id = ?';
      params.push(studentId);
    }
    if (subjectId) {
      query += ' AND g.subject_id = ?';
      params.push(subjectId);
    }
    
    query += ' ORDER BY g.evaluation_date DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch grades' }, 500);
  }
});

// POST - Create grade
app.post('/api/v1/grades', async (c) => {
  try {
    const body = await c.req.json();
    const gradeId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO grades (id, student_id, subject_id, category_id, grade, max_grade, 
        evaluation_date, comment, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      gradeId,
      body.studentId,
      body.subjectId,
      body.categoryId || null,
      body.grade,
      body.maxGrade || 20,
      body.evaluationDate || new Date().toISOString().split('T')[0],
      body.comment || null,
      body.recordedBy || null
    ).run();

    return c.json({ id: gradeId, message: 'Grade created successfully' }, 201);
  } catch (error) {
    console.error('Create grade error:', error);
    return c.json({ error: 'Failed to create grade' }, 500);
  }
});

// PUT - Update grade
app.put('/api/v1/grades/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE grades SET
        grade = COALESCE(?, grade),
        max_grade = COALESCE(?, max_grade),
        evaluation_date = COALESCE(?, evaluation_date),
        comment = COALESCE(?, comment),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.grade || null,
      body.maxGrade || null,
      body.evaluationDate || null,
      body.comment || null,
      id
    ).run();

    return c.json({ message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Update grade error:', error);
    return c.json({ error: 'Failed to update grade' }, 500);
  }
});

// DELETE - Delete grade
app.delete('/api/v1/grades/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await c.env.DB.prepare(`DELETE FROM grades WHERE id = ?`).bind(id).run();

    return c.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete grade' }, 500);
  }
});

// ========================================================================
// ATTENDANCE ROUTES
// ========================================================================

app.get('/api/v1/attendance', async (c) => {
  try {
    const { studentId, date } = c.req.query();
    
    let query = `
      SELECT a.*, s.first_name, s.last_name, s.student_code
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    if (studentId) {
      query += ' AND a.student_id = ?';
      params.push(studentId);
    }
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY a.date DESC, s.last_name, s.first_name';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch attendance' }, 500);
  }
});

// POST - Create attendance
app.post('/api/v1/attendance', async (c) => {
  try {
    const body = await c.req.json();
    const attendanceId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO attendance (id, student_id, date, status, period, reason, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      attendanceId,
      body.studentId,
      body.date || new Date().toISOString().split('T')[0],
      body.status,
      body.period || null,
      body.reason || null,
      body.recordedBy || null
    ).run();

    return c.json({ id: attendanceId, message: 'Attendance recorded successfully' }, 201);
  } catch (error) {
    console.error('Create attendance error:', error);
    return c.json({ error: 'Failed to record attendance' }, 500);
  }
});

// POST - Bulk create/update attendance (for class attendance sheet)
app.post('/api/v1/attendance/bulk', async (c) => {
  try {
    const body = await c.req.json();
    const { date, classId, records } = body;

    if (!date || !classId || !Array.isArray(records)) {
      return c.json({ error: 'Invalid request: date, classId, and records array required' }, 400);
    }

    console.log(`Bulk attendance save: ${records.length} records for class ${classId} on ${date}`);

    // Process each attendance record
    const results = await Promise.all(
      records.map(async (record: any) => {
        try {
          const attendanceId = crypto.randomUUID();
          
          // Check if attendance already exists for this student/date
          const existing = await c.env.DB.prepare(`
            SELECT id FROM attendance 
            WHERE student_id = ? AND date = ?
            LIMIT 1
          `).bind(record.studentId, date).first();

          if (existing) {
            // Update existing record
            await c.env.DB.prepare(`
              UPDATE attendance 
              SET status = ?, reason = ?, recorded_by = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(
              record.status,
              record.note || null,
              record.recordedBy || null,
              existing.id
            ).run();
            return { studentId: record.studentId, action: 'updated' };
          } else {
            // Insert new record
            await c.env.DB.prepare(`
              INSERT INTO attendance (id, student_id, date, status, reason, recorded_by, created_at)
              VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              attendanceId,
              record.studentId,
              date,
              record.status,
              record.note || null,
              record.recordedBy || null
            ).run();
            return { studentId: record.studentId, action: 'created' };
          }
        } catch (recordError) {
          console.error(`Error processing record for student ${record.studentId}:`, recordError);
          return { studentId: record.studentId, action: 'error', error: recordError };
        }
      })
    );

    const summary = {
      total: records.length,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      errors: results.filter(r => r.action === 'error').length
    };

    console.log('Bulk attendance save complete:', summary);

    return c.json({ 
      success: true,
      message: 'Attendance bulk save completed',
      summary,
      date,
      classId
    }, 201);
  } catch (error) {
    console.error('Bulk attendance save error:', error);
    return c.json({ error: 'Failed to save bulk attendance' }, 500);
  }
});

// PUT - Update attendance
app.put('/api/v1/attendance/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE attendance SET
        status = COALESCE(?, status),
        period = COALESCE(?, period),
        reason = COALESCE(?, reason)
      WHERE id = ?
    `).bind(
      body.status || null,
      body.period || null,
      body.reason || null,
      id
    ).run();

    return c.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    return c.json({ error: 'Failed to update attendance' }, 500);
  }
});

// DELETE - Delete attendance
app.delete('/api/v1/attendance/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await c.env.DB.prepare(`DELETE FROM attendance WHERE id = ?`).bind(id).run();

    return c.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete attendance' }, 500);
  }
});

// ========================================================================
// DASHBOARD/ANALYTICS ROUTES
// ========================================================================

app.get('/api/v1/analytics/dashboard', async (c) => {
  try {
    // Get all stats in parallel
    const [students, teachers, classes, avgGrade, absences] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM students WHERE status = "active"').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM teachers WHERE status = "active"').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM classes WHERE is_active = 1').first(),
      c.env.DB.prepare('SELECT AVG(grade) as avg FROM grades').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM attendance WHERE status = "absent" AND date >= date("now", "-30 days")').first(),
    ]);

    return c.json({
      studentsCount: students?.count || 0,
      teachersCount: teachers?.count || 0,
      classesCount: classes?.count || 0,
      averageGrade: avgGrade?.avg || 0,
      absencesCount: absences?.count || 0,
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// ========================================================================
// FINANCIAL TRANSACTIONS ROUTES
// ========================================================================

app.get('/api/v1/finance/transactions', async (c) => {
  try {
    const { studentId, status, type } = c.req.query();
    
    let query = `
      SELECT ft.*, s.first_name, s.last_name, s.student_code
      FROM financial_transactions ft
      LEFT JOIN students s ON ft.student_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    if (studentId) {
      query += ' AND ft.student_id = ?';
      params.push(studentId);
    }
    if (status) {
      query += ' AND ft.status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND ft.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY ft.created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

app.post('/api/v1/finance/transactions', async (c) => {
  try {
    const body = await c.req.json();
    const transactionId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO financial_transactions (id, student_id, type, amount, currency, status, 
        due_date, description, reference, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      transactionId,
      body.studentId,
      body.type,
      body.amount,
      body.currency || 'EUR',
      body.status || 'pending',
      body.dueDate || null,
      body.description || null,
      body.reference || `TXN${Date.now()}`,
      body.createdBy || null
    ).run();

    return c.json({ id: transactionId, message: 'Transaction created successfully' }, 201);
  } catch (error) {
    console.error('Create transaction error:', error);
    return c.json({ error: 'Failed to create transaction' }, 500);
  }
});

app.put('/api/v1/finance/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE financial_transactions SET
        status = COALESCE(?, status),
        paid_date = COALESCE(?, paid_date),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.status || null,
      body.paidDate || null,
      body.description || null,
      id
    ).run();

    return c.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Update transaction error:', error);
    return c.json({ error: 'Failed to update transaction' }, 500);
  }
});

app.delete('/api/v1/finance/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM financial_transactions WHERE id = ?`).bind(id).run();
    return c.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete transaction' }, 500);
  }
});

// ========================================================================
// TIMETABLE ROUTES
// ========================================================================

app.get('/api/v1/timetable', async (c) => {
  try {
    const { classId, teacherId, dayOfWeek } = c.req.query();
    
    let query = `
      SELECT ts.*, c.name as class_name, s.name as subject_name, 
             u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM timetable_slots ts
      LEFT JOIN classes c ON ts.class_id = c.id
      LEFT JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN teachers t ON ts.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE ts.is_active = 1
    `;
    
    const params: any[] = [];
    if (classId) {
      query += ' AND ts.class_id = ?';
      params.push(classId);
    }
    if (teacherId) {
      query += ' AND ts.teacher_id = ?';
      params.push(teacherId);
    }
    if (dayOfWeek) {
      query += ' AND ts.day_of_week = ?';
      params.push(dayOfWeek);
    }
    
    query += ' ORDER BY ts.day_of_week, ts.start_time';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch timetable' }, 500);
  }
});

app.post('/api/v1/timetable', async (c) => {
  try {
    const body = await c.req.json();
    const slotId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO timetable_slots (id, class_id, subject_id, teacher_id, room, 
        day_of_week, start_time, end_time, recurrence_pattern, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      slotId,
      body.classId,
      body.subjectId,
      body.teacherId,
      body.room || null,
      body.dayOfWeek,
      body.startTime,
      body.endTime,
      body.recurrencePattern || 'weekly'
    ).run();

    return c.json({ id: slotId, message: 'Timetable slot created successfully' }, 201);
  } catch (error) {
    console.error('Create timetable slot error:', error);
    return c.json({ error: 'Failed to create timetable slot' }, 500);
  }
});

app.put('/api/v1/timetable/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE timetable_slots SET
        teacher_id = COALESCE(?, teacher_id),
        room = COALESCE(?, room),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.teacherId || null,
      body.room || null,
      body.startTime || null,
      body.endTime || null,
      id
    ).run();

    return c.json({ message: 'Timetable slot updated successfully' });
  } catch (error) {
    console.error('Update timetable slot error:', error);
    return c.json({ error: 'Failed to update timetable slot' }, 500);
  }
});

app.delete('/api/v1/timetable/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`
      UPDATE timetable_slots SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();
    return c.json({ message: 'Timetable slot deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete timetable slot' }, 500);
  }
});

// ========================================================================
// USERS/MANAGEMENT ROUTES
// ========================================================================

app.get('/api/v1/users', async (c) => {
  try {
    const { role, isActive } = c.req.query();
    
    let query = 'SELECT id, email, role, first_name, last_name, phone, is_active, last_login_at, created_at FROM users WHERE 1=1';
    
    const params: any[] = [];
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.post('/api/v1/users', async (c) => {
  try {
    const body = await c.req.json();
    const userId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      userId,
      body.email,
      body.password || 'hashed_password_placeholder',
      body.role,
      body.firstName,
      body.lastName,
      body.phone || null
    ).run();

    return c.json({ id: userId, message: 'User created successfully' }, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.put('/api/v1/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE users SET
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.email || null,
      body.role || null,
      body.firstName || null,
      body.lastName || null,
      body.phone || null,
      body.isActive !== undefined ? (body.isActive ? 1 : 0) : null,
      id
    ).run();

    return c.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

app.delete('/api/v1/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`
      UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(id).run();
    return c.json({ message: 'User deactivated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to deactivate user' }, 500);
  }
});

// ========================================================================
// SCHOOL EVENTS ROUTES (Vie Scolaire)
// ========================================================================

app.get('/api/v1/school-life/events', async (c) => {
  try {
    const { eventType, status, startDate, endDate } = c.req.query();
    
    let query = 'SELECT * FROM school_events WHERE 1=1';
    
    const params: any[] = [];
    if (eventType) {
      query += ' AND event_type = ?';
      params.push(eventType);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (startDate) {
      query += ' AND start_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND start_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY start_date DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

app.post('/api/v1/school-life/events', async (c) => {
  try {
    const body = await c.req.json();
    const eventId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO school_events (id, title, description, event_type, start_date, end_date, 
        location, participants, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventId,
      body.title,
      body.description || null,
      body.eventType,
      body.startDate,
      body.endDate || null,
      body.location || null,
      body.participants ? JSON.stringify(body.participants) : null,
      body.status || 'scheduled',
      body.createdBy || null
    ).run();

    return c.json({ id: eventId, message: 'Event created successfully' }, 201);
  } catch (error) {
    console.error('Create event error:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

app.put('/api/v1/school-life/events/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE school_events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        event_type = COALESCE(?, event_type),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        location = COALESCE(?, location),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.title || null,
      body.description || null,
      body.eventType || null,
      body.startDate || null,
      body.endDate || null,
      body.location || null,
      body.status || null,
      id
    ).run();

    return c.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

app.delete('/api/v1/school-life/events/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM school_events WHERE id = ?`).bind(id).run();
    return c.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// ========================================================================
// INVENTORY ROUTES
// ========================================================================

app.get('/api/v1/inventory', async (c) => {
  try {
    const { category, status } = c.req.query();
    
    let query = 'SELECT * FROM inventory WHERE 1=1';
    
    const params: any[] = [];
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY name';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

app.post('/api/v1/inventory', async (c) => {
  try {
    const body = await c.req.json();
    const itemId = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO inventory (id, name, category, quantity, unit, location, status, 
        purchase_date, purchase_price, condition, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      itemId,
      body.name,
      body.category,
      body.quantity || 0,
      body.unit || null,
      body.location || null,
      body.status || 'available',
      body.purchaseDate || null,
      body.purchasePrice || null,
      body.condition || null,
      body.notes || null,
      body.createdBy || null
    ).run();

    return c.json({ id: itemId, message: 'Inventory item created successfully' }, 201);
  } catch (error) {
    console.error('Create inventory item error:', error);
    return c.json({ error: 'Failed to create inventory item' }, 500);
  }
});

app.put('/api/v1/inventory/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE inventory SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        location = COALESCE(?, location),
        status = COALESCE(?, status),
        condition = COALESCE(?, condition),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.name || null,
      body.category || null,
      body.quantity !== undefined ? body.quantity : null,
      body.unit || null,
      body.location || null,
      body.status || null,
      body.condition || null,
      body.notes || null,
      id
    ).run();

    return c.json({ message: 'Inventory item updated successfully' });
  } catch (error) {
    console.error('Update inventory item error:', error);
    return c.json({ error: 'Failed to update inventory item' }, 500);
  }
});

app.delete('/api/v1/inventory/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM inventory WHERE id = ?`).bind(id).run();
    return c.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete inventory item' }, 500);
  }
});

// ========================================================================
// SUBJECTS ROUTES
// ========================================================================

app.get('/api/v1/subjects', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM subjects WHERE is_active = 1 ORDER BY name
    `).all();

    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch subjects' }, 500);
  }
});

// ========================================================================
// HEALTH CHECK
// ========================================================================

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================

async function generateJWT(user: any, secret: string): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  };

  // Simple JWT generation (in production use proper library)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${header}.${body}.${secret}`)
  );
  
  return `${header}.${body}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
}

export default app;
