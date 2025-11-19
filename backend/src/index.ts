/**
 * Cloudflare Workers Backend for KDS School Management System
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
      SELECT s.*, u.first_name, u.last_name, u.email, c.name as class_name
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.status = 'active'
      ORDER BY u.last_name, u.first_name
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
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, c.name as class_name
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
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
    const userId = crypto.randomUUID();

    // Create user first
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
      VALUES (?, ?, ?, 'student', ?, ?, ?, 1)
    `).bind(
      userId,
      body.email,
      'hashed_password', // In production, hash the password
      body.firstName,
      body.lastName,
      body.phone || null
    ).run();

    // Create student record
    await c.env.DB.prepare(`
      INSERT INTO students (id, user_id, student_code, birth_date, gender, nationality, 
        birth_place, address, enrollment_date, class_id, parent_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      studentId,
      userId,
      body.studentCode || `KDS${Date.now()}`,
      body.birthDate,
      body.gender,
      body.nationality || null,
      body.birthPlace || null,
      body.address || null,
      body.enrollmentDate || new Date().toISOString().split('T')[0],
      body.classId || null,
      body.parentId || null
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

    // Update user info
    if (body.firstName || body.lastName || body.email || body.phone) {
      const student = await c.env.DB.prepare('SELECT user_id FROM students WHERE id = ?').bind(id).first();
      if (student) {
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
          student.user_id
        ).run();
      }
    }

    // Update student record
    await c.env.DB.prepare(`
      UPDATE students SET
        birth_date = COALESCE(?, birth_date),
        gender = COALESCE(?, gender),
        nationality = COALESCE(?, nationality),
        birth_place = COALESCE(?, birth_place),
        address = COALESCE(?, address),
        class_id = COALESCE(?, class_id),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.birthDate || null,
      body.gender || null,
      body.nationality || null,
      body.birthPlace || null,
      body.address || null,
      body.classId || null,
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
    const { results } = await c.env.DB.prepare(`
      SELECT c.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
             (SELECT COUNT(*) FROM students WHERE class_id = c.id AND status = 'active') as student_count
      FROM classes c
      LEFT JOIN teachers t ON c.main_teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE c.is_active = 1
      ORDER BY c.level, c.name
    `).all();

    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch classes' }, 500);
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

// ========================================================================
// ATTENDANCE ROUTES
// ========================================================================

app.get('/api/v1/attendance', async (c) => {
  try {
    const { studentId, date } = c.req.query();
    
    let query = `
      SELECT a.*, u.first_name, u.last_name, s.student_code
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
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
    
    query += ' ORDER BY a.date DESC, u.last_name, u.first_name';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch attendance' }, 500);
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
