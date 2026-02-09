/**
 * Cloudflare Workers Backend for KSP School Management System
 * Lightweight API handler using Hono framework
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

// Cloudflare Bindings types
type D1Database = {
    prepare: (query: string) => D1PreparedStatement;
    batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
};

type D1PreparedStatement = {
    bind: (...values: any[]) => D1PreparedStatement;
    first: <T = any>(colName?: string) => Promise<T | null>;
    all: <T = any>() => Promise<D1Result<T>>;
    run: () => Promise<D1Result>;
};

type D1Result<T = any> = {
    results: T[];
    success: boolean;
    error?: string;
    meta: any;
};

type R2Bucket = {
    get: (key: string) => Promise<R2Object | null>;
    put: (key: string, value: any, options?: any) => Promise<R2Object>;
};

type R2Object = {
    key: string;
    size: number;
    httpEtag: string;
    body: ReadableStream;
    writeHttpMetadata: (headers: Headers) => void;
};

interface Env {
    DB: D1Database;
    DOCUMENTS: R2Bucket;
    JWT_SECRET: string;
    NODE_ENV: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// ========================================================================
// SYSTEM / HEALTH / STORAGE ROUTES
// ========================================================================

// Helper to update dashboard metrics atomically
const updateMetricSQL = (db: any, key: string, delta: number) => {
    return db.prepare(`
        INSERT INTO dashboard_metrics (metric_key, metric_value, last_updated)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(metric_key) DO UPDATE SET
            metric_value = metric_value + EXCLUDED.metric_value,
            last_updated = CURRENT_TIMESTAMP
    `).bind(key, delta);
};

// Helper to sync a metric from actual count via subquery
const syncMetricSQL = (db: any, key: string, query: string) => {
    return db.prepare(`
        INSERT INTO dashboard_metrics (metric_key, metric_value, last_updated)
        SELECT ?, (${query}), CURRENT_TIMESTAMP
        ON CONFLICT(metric_key) DO UPDATE SET
            metric_value = EXCLUDED.metric_value,
            last_updated = CURRENT_TIMESTAMP
    `).bind(key);
};

app.get('/api/v1/health', async (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'kds-backend-api',
        version: '1.5.0-persistence-fix',
        env_keys: Object.keys(c.env || {}),
    });
});

// Debug endpoint to verify D1 data connectivity
app.get('/api/v1/debug/db', async (c) => {
    try {
        const query = c.req.query('query');
        if (query) {
            const result = await c.env.DB.prepare(query).all();
            return c.json({ success: true, query, result });
        }

        const students = await c.env.DB.prepare("SELECT status, COUNT(*) as count FROM students GROUP BY status").all();
        const classes = await c.env.DB.prepare("SELECT COUNT(*) as count FROM classes").all();
        const teachers = await c.env.DB.prepare("SELECT COUNT(*) as count FROM teachers").all();

        return c.json({
            success: true,
            database: 'connected',
            students: students.results,
            classes_count: classes.results,
            teachers_count: teachers.results
        });
    } catch (error) {
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, 500);
    }
});

// SSE Real-time updates endpoint
app.get('/api/v1/updates', async (c) => {
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            // Send initial heartbeat
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`));

            // Send heartbeat every 25 seconds to keep connection alive
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', time: new Date().toISOString() })}\n\n`));
                } catch (e) {
                    clearInterval(heartbeat);
                    controller.close();
                }
            }, 25000);

            // Cleanup on close
            c.req.raw.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
    });
});

// Generic storage endpoint for R2
app.get('/api/v1/storage/:path{.+}', async (c) => {
    const path = c.req.param('path');
    const object = await c.env.DOCUMENTS.get(path);

    if (!object) {
        return c.text('File not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
});

// Upload endpoint for R2 (used by API)
// Enhanced document upload with student record sync and validation
app.post('/api/v1/documents/upload', async (c) => {
    try {
        const formData = await c.req.parseBody();
        const file = formData['file'] as File;
        const studentId = formData['studentId'] as string;
        const docType = formData['type'] as string || 'general';

        if (!file || !studentId) {
            return c.json({ error: 'Missing file or studentId' }, 400);
        }

        // 1. Validate student exists
        const student = await c.env.DB.prepare(
            'SELECT id, first_name, last_name, documents FROM students WHERE id = ?'
        ).bind(studentId).first();

        if (!student) {
            return c.json({ error: 'Student not found' }, 404);
        }

        // 2. Validate file type and size
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
            return c.json({ error: 'File too large (max 10MB)' }, 400);
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return c.json({ error: 'Invalid file type. Only PDF and Images (JPG/PNG) are allowed.' }, 400);
        }

        // 3. Generate secure file key with folder structure
        const timestamp = Date.now();
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `documents/${studentId}/${docType}/${timestamp}_${safeFilename}`;

        // 4. Store in R2 with metadata
        await c.env.DOCUMENTS.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type,
                contentDisposition: `attachment; filename="${safeFilename}"`
            },
            customMetadata: {
                studentId,
                docType,
                originalName: file.name,
                uploadedAt: new Date().toISOString()
            }
        });

        const fileUrl = `/api/v1/storage/${key}`;

        // 5. Record in D1 within a transaction (batch)
        const docId = `doc_${timestamp}_${crypto.randomUUID().slice(0, 8)}`;

        // Sync to students table JSON metadata as well for UI compatibility
        let studentDocs = [];
        try {
            studentDocs = JSON.parse((student as any).documents || '[]');
        } catch (e) {
            studentDocs = [];
        }

        studentDocs.push({
            id: docId,
            type: docType,
            title: docType,
            status: 'pending',
            fileName: file.name,
            fileData: fileUrl,
            updatedAt: new Date().toISOString()
        });

        await c.env.DB.batch([
            // Insert document record
            c.env.DB.prepare(`
                INSERT INTO documents (id, student_id, filename, doc_type, status, r2_key, uploaded_at)
                VALUES (?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP)
            `).bind(docId, studentId, file.name, docType, key),

            // Update student record (counters and JSON metadata)
            c.env.DB.prepare(`
                UPDATE students 
                SET document_count = COALESCE(document_count, 0) + 1,
                    pending_docs = COALESCE(pending_docs, 0) + 1,
                    documents = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(JSON.stringify(studentDocs), studentId),

            // NEW: Update global dashboard metric
            updateMetricSQL(c.env.DB, 'pending_documents', 1)
        ]);

        return c.json({
            success: true,
            id: docId,
            documentId: docId,
            url: fileUrl,
            student: `${(student as any).first_name} ${(student as any).last_name}`
        });
    } catch (error) {
        console.error('Document upload error:', error);
        return c.json({ error: 'Upload failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
});

// Generic storage upload
app.post('/api/v1/storage/upload', async (c) => {
    try {
        const formData = await c.req.parseBody();
        const file = formData['file'] as File;
        const path = formData['path'] as string;

        if (!file || !path) {
            return c.json({ error: 'Missing file or path' }, 400);
        }

        await c.env.DOCUMENTS.put(path, file.stream(), {
            httpMetadata: { contentType: file.type },
        });

        return c.json({ success: true, path, url: `/api/v1/storage/${path}` });
    } catch (error) {
        return c.json({ error: 'Upload failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
});

// ========================================================================
// DATA NORMALIZATION (MAPPING)
// ========================================================================

/**
 * Utility to map snake_case object to camelCase
 */
function mapKeys(obj: any, mapping: Record<string, string>): any {
    if (!obj) return null;
    const result: any = { ...obj };
    for (const [snake, camel] of Object.entries(mapping)) {
        if (result[snake] !== undefined) {
            result[camel] = result[snake];
            // Don't delete snake_case to avoid breaking existing code if any
        }
    }
    return result;
}

const mapStudent = (s: any) => {
    if (!s) return null;
    const mapped = mapKeys(s, {
        first_name: 'firstName',
        last_name: 'lastName',
        birth_date: 'dob',
        academic_level: 'gradeLevel',
        enrollment_date: 'registrationDate',
        student_code: 'registrationNumber',
        class_id: 'classId',
        created_at: 'createdAt',
        updated_at: 'updatedAt'
    });

    mapped.firstName = s.first_name || s.user_first_name || s.firstName;
    mapped.lastName = s.last_name || s.user_last_name || s.lastName;
    mapped.email = s.user_email || s.email;
    mapped.className = s.class_name || s.className;

    // Standardize documents array (parse JSON from D1)
    try {
        mapped.documents = typeof s.documents === 'string' ? JSON.parse(s.documents) : (s.documents || []);
    } catch (e) {
        mapped.documents = [];
    }

    return mapped;
};

const mapTeacher = (t: any) => {
    if (!t) return null;
    const mapped = mapKeys(t, {
        specialization: 'specialization',
        hire_date: 'hireDate',
        registration_number: 'registrationNumber',
        created_at: 'createdAt',
        updated_at: 'updatedAt'
    });

    mapped.firstName = t.first_name || t.user_first_name || t.firstName;
    mapped.lastName = t.last_name || t.user_last_name || t.lastName;
    mapped.email = t.user_email || t.email;
    mapped.subject = t.subject || t.specialization;

    // Fallback for missing registration number to avoid "En attente..."
    if (!mapped.registrationNumber) {
        mapped.registrationNumber = t.id ? `ENS-2025-${t.id.substring(0, 3).toUpperCase()}` : 'ENS-2025-XXX';
    }

    return mapped;
};

const mapClass = (c: any) => {
    if (!c) return null;
    const mapped = mapKeys(c, {
        main_teacher_id: 'teacherId',
        room_number: 'room',
        room_number_number: 'room',
        academic_year: 'academicYear',
        capacity: 'capacity',
        student_count: 'currentOccupancy',
        teacher_name: 'teacherName',
        created_at: 'createdAt',
        updated_at: 'updatedAt'
    });
    // Compatibility with different frontend expectations
    mapped.maxStudents = mapped.capacity;
    mapped.academic_year = mapped.academicYear;
    mapped.currentOccupancy = mapped.currentOccupancy || mapped.student_count || 0;
    return mapped;
};

const mapDocument = (d: any) => {
    if (!d) return null;
    const mapped = mapKeys(d, {
        document_type: 'type',
        file_url: 'fileUrl',
        file_name: 'fileName',
        uploaded_at: 'updatedAt'
    });

    // Add student name fields from joint users u through students s
    mapped.studentName = (d.user_first_name || d.user_last_name)
        ? `${d.user_first_name} ${d.user_last_name}`.trim()
        : 'Candidat';

    return mapped;
};

const mapUser = (u: any) => mapKeys(u, {
    first_name: 'firstName',
    last_name: 'lastName',
    avatar_url: 'avatarUrl',
    is_active: 'isActive',
    created_at: 'createdAt',
    updated_at: 'updatedAt'
});

const mapActivity = (a: any) => mapKeys(a, {
    user_id: 'userId',
    user_name: 'userName',
    user_role: 'userRole',
    class_id: 'classId',
    student_id: 'studentId'
});

// ========================================================================
// DATA PREVIEW & SEARCH
// ========================================================================

app.get('/api/v1/data/preview/:table', async (c) => {
    try {
        const table = c.req.param('table');
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '50');
        const search = c.req.query('search') || '';
        const offset = (page - 1) * limit;

        const allowedTables = ['students', 'classes', 'teachers', 'grades', 'attendance', 'users', 'subjects', 'parents'];
        if (!allowedTables.includes(table)) {
            return c.json({ error: 'Invalid table name' }, 400);
        }

        let query = '';
        let countQuery = '';
        const searchPattern = search ? `%${search}%` : '';

        if (table === 'students') {
            query = `
        SELECT s.*, c.name as class_name
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.status = 'active'
        ${search ? `AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_code LIKE ?)` : ''}
        ORDER BY s.last_name, s.first_name
        LIMIT ? OFFSET ?
      `;
            countQuery = `SELECT COUNT(*) as count FROM students WHERE status = 'active' ${search ? `AND (first_name LIKE ? OR last_name LIKE ? OR student_code LIKE ?)` : ''}`;
        } else {
            query = `SELECT * FROM ${table} ${search ? `WHERE name LIKE ?` : ''} LIMIT ? OFFSET ?`;
            countQuery = `SELECT COUNT(*) as count FROM ${table} ${search ? `WHERE name LIKE ?` : ''}`;
        }

        const { results } = search
            ? await c.env.DB.prepare(query).bind(searchPattern, searchPattern, searchPattern, limit, offset).all()
            : await c.env.DB.prepare(query).bind(limit, offset).all();

        const totalCount = search
            ? await c.env.DB.prepare(countQuery).bind(searchPattern, searchPattern, searchPattern).first()
            : await c.env.DB.prepare(countQuery).first();

        // Map results if needed
        let mappedData = results;
        if (table === 'students') mappedData = results.map(mapStudent);
        if (table === 'teachers') mappedData = results.map(mapTeacher);
        if (table === 'classes') mappedData = results.map(mapClass);
        if (table === 'users') mappedData = results.map(mapUser);

        return c.json({
            table,
            data: mappedData,
            pagination: { page, limit, total: (totalCount as any)?.count || 0 }
        });
    } catch (error) {
        return c.json({ error: 'Failed to preview data' }, 500);
    }
});

// ========================================================================
// AUTH ROUTES
// ========================================================================

app.post('/api/v1/auth/login', async (c) => {
    try {
        const { email } = await c.req.json();
        const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').bind(email).first();

        if (!user) return c.json({ error: 'Invalid credentials' }, 401);

        const payload = {
            sub: (user as any).id,
            email: (user as any).email,
            role: (user as any).role,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        };

        const token = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify(payload)) + '.mock_signature';

        return c.json({
            access_token: token,
            user: mapUser(user),
        });
    } catch (error) {
        return c.json({ error: 'Login failed' }, 500);
    }
});

app.post('/api/v1/users', async (c) => {
    try {
        const data = await c.req.json();
        const id = data.id || `user-${crypto.randomUUID()}`;

        await c.env.DB.prepare(`
            INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `).bind(
            id,
            data.email,
            data.password_hash || 'placeholder_hash',
            data.role || 'staff',
            data.firstName || data.first_name,
            data.lastName || data.last_name,
            data.phone || null
        ).run();

        const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
        return c.json(mapUser(user), 201);
    } catch (error) {
        return c.json({ error: 'Failed to create user', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
});

app.put('/api/v1/users/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();

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
            data.email || null,
            data.role || null,
            data.firstName || data.first_name || null,
            data.lastName || data.last_name || null,
            data.phone || null,
            data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
            id
        ).run();

        const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
        return c.json(mapUser(user));
    } catch (error) {
        return c.json({ error: 'Failed to update user' }, 500);
    }
});

// ========================================================================
// STATISTICS ROUTES
// ========================================================================

// ========================================================================
// STATISTICS ROUTES
// ========================================================================

// New consolidated stats endpoint
app.get('/api/v1/stats/summary', async (c) => {
    try {
        const [students, teachers, classes, pending, rejected, rev, exp] = await Promise.all([
            c.env.DB.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'active'").first(),
            c.env.DB.prepare("SELECT COUNT(*) as count FROM teachers WHERE status = 'active'").first(),
            c.env.DB.prepare("SELECT COUNT(*) as count FROM classes WHERE is_active = 1").first(),
            c.env.DB.prepare("SELECT COUNT(*) as count FROM documents WHERE status = 'En attente' OR status = 'pending'").first(),
            c.env.DB.prepare("SELECT COUNT(*) as count FROM documents WHERE status = 'Rejeté' OR status = 'rejected'").first(),
            c.env.DB.prepare("SELECT SUM(amount_paid) as total FROM transactions WHERE type = 'revenue'").first(),
            c.env.DB.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'").first(),
        ]);

        // REFINED JSON-BASED CALCULATION FOR MISSING DOCS
        const { results } = await c.env.DB.prepare("SELECT documents FROM students WHERE status = 'active'").all();
        let missingDocs = 0;
        const mandatoryTypes = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];

        results.forEach((row: any) => {
            try {
                const docs = typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || []);
                const presentTypes = docs.map((d: any) => d.type || d.document_type).filter((t: any) => mandatoryTypes.includes(t));
                const implicitMissing = mandatoryTypes.filter(t => !presentTypes.includes(t)).length;
                missingDocs += implicitMissing;
            } catch (e) {
                missingDocs += 4;
            }
        });

        return c.json({
            students: (students as any)?.count || 0,
            teachers: (teachers as any)?.count || 0,
            classes: (classes as any)?.count || 0,
            pendingDocs: (pending as any)?.count || 0,
            missingDocs: missingDocs,
            rejectedDocs: (rejected as any)?.count || 0,
            revenue: (rev as any)?.total || 0,
            expenses: (exp as any)?.total || 0,
            balance: ((rev as any)?.total || 0) - ((exp as any)?.total || 0)
        });
    } catch (e) {
        return c.json({ error: 'Stats error', message: e instanceof Error ? e.message : 'Unknown' }, 500);
    }
});

app.get('/api/v1/students/stats/count', async (c) => {
    const res = await c.env.DB.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'active'").first();
    return c.json(res || { count: 0 });
});

app.get('/api/v1/teachers/stats/count', async (c) => {
    const res = await c.env.DB.prepare("SELECT COUNT(*) as count FROM teachers WHERE status = 'active'").first();
    return c.json(res || { count: 0 });
});

app.get('/api/v1/classes/stats/count', async (c) => {
    const res = await c.env.DB.prepare("SELECT COUNT(*) as count FROM classes WHERE is_active = 1").first();
    return c.json(res || { count: 0 });
});

app.get('/api/v1/students/stats/pending-docs', async (c) => {
    try {
        // DERIVE FROM JSON METADATA IN STUDENTS TABLE
        const { results } = await c.env.DB.prepare("SELECT documents FROM students WHERE status = 'active'").all();
        let count = 0;

        results.forEach((row: any) => {
            try {
                const docs = typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || []);
                count += docs.filter((d: any) => d.status === 'En attente' || d.status === 'pending').length;
            } catch (e) { }
        });

        // Add docs from the dedicated documents table that might not be synced yet
        const legacyRes = await c.env.DB.prepare("SELECT COUNT(*) as count FROM documents WHERE status = 'En attente' OR status = 'pending'").first();
        const legacyCount = (legacyRes as any)?.count || 0;

        return c.json({ count: count + legacyCount });
    } catch (e) {
        console.error('Pending docs stat error:', e);
        return c.json({ count: 0, error: 'Failed to fetch pending docs', message: e instanceof Error ? e.message : 'Unknown' }, 500);
    }
});

app.get('/api/v1/students/stats/missing-docs', async (c) => {
    try {
        const { results } = await c.env.DB.prepare("SELECT documents FROM students WHERE status = 'active'").all();
        let count = 0;
        const mandatoryTypes = ['Extrait de naissance', 'Carnet de vaccination', 'Autorisation parentale', 'Fiche scolaire'];

        results.forEach((row: any) => {
            try {
                const docs = typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || []);
                const presentTypes = docs.map((d: any) => d.type || d.document_type || d.type).filter((t: any) => mandatoryTypes.includes(t));

                // Add default missing (those not present in the list)
                const implicitMissing = mandatoryTypes.filter(t => !presentTypes.includes(t)).length;
                count += implicitMissing;
            } catch (e) {
                count += 4;
            }
        });

        return c.json({ count });
    } catch (e) {
        console.error('Missing docs stat error:', e);
        return c.json({ count: 0, error: 'Failed to calculate missing docs', message: e instanceof Error ? e.message : 'Unknown' }, 500);
    }
});

app.get('/api/v1/students/stats/rejected-docs', async (c) => {
    try {
        const { results } = await c.env.DB.prepare("SELECT documents FROM students WHERE status = 'active'").all();
        let count = 0;

        results.forEach((row: any) => {
            try {
                const docs = typeof row.documents === 'string' ? JSON.parse(row.documents) : (row.documents || []);
                count += docs.filter((d: any) => d.status === 'Rejeté' || d.status === 'rejected').length;
            } catch (e) { }
        });

        return c.json({ count });
    } catch (e) {
        console.error('Rejected docs stat error:', e);
        return c.json({ count: 0, error: 'Failed to fetch rejected docs', message: e instanceof Error ? e.message : 'Unknown' }, 500);
    }
});

const mapTransaction = (t: any) => mapKeys(t, {
    amount_paid: 'amountPaid',
    payment_method: 'paymentMethod',
    payment_date: 'paymentDate',
    created_at: 'createdAt',
    updated_at: 'updatedAt'
});

// ========================================================================
// FINANCE ROUTES
// ========================================================================

app.get('/api/v1/finance/transactions', async (c) => {
    const studentId = c.req.query('studentId');
    const status = c.req.query('status');
    const type = c.req.query('type');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM transactions WHERE 1=1`;
    const params: any[] = [];

    if (studentId) {
        query += ` AND student_id = ?`;
        params.push(studentId);
    }
    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }
    if (type) {
        query += ` AND type = ?`;
        params.push(type);
    }
    if (startDate) {
        query += ` AND date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND date <= ?`;
        params.push(endDate);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
    const countRes = await c.env.DB.prepare(countQuery).bind(...params).first();
    const total = (countRes as any)?.count || 0;

    query += ` ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
        data: results.map(mapTransaction),
        total,
        page,
        limit
    });
});

app.get('/api/v1/finance/stats/revenue', async (c) => {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let query = "SELECT SUM(amount_paid) as total FROM transactions WHERE type = 'revenue'";
    const params: any[] = [];

    if (startDate) {
        query += " AND date >= ?";
        params.push(startDate);
    }
    if (endDate) {
        query += " AND date <= ?";
        params.push(endDate);
    }

    try {
        const res = await c.env.DB.prepare(query).bind(...params).first();
        return c.json({ total: (res as any)?.total || 0 });
    } catch (e) {
        return c.json({ total: 0 });
    }
});

app.get('/api/v1/finance/stats/expenses', async (c) => {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let query = "SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'";
    const params: any[] = [];

    if (startDate) {
        query += " AND date >= ?";
        params.push(startDate);
    }
    if (endDate) {
        query += " AND date <= ?";
        params.push(endDate);
    }

    try {
        const res = await c.env.DB.prepare(query).bind(...params).first();
        return c.json({ total: (res as any)?.total || 0 });
    } catch (e) {
        return c.json({ total: 0 });
    }
});

app.get('/api/v1/finance/stats/balance', async (c) => {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let revQuery = "SELECT SUM(amount_paid) as total FROM transactions WHERE type = 'revenue'";
    let expQuery = "SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'";
    const params: any[] = [];

    if (startDate) {
        revQuery += " AND date >= ?";
        expQuery += " AND date >= ?";
        params.push(startDate);
    }
    if (endDate) {
        revQuery += " AND date <= ?";
        expQuery += " AND date <= ?";
        params.push(endDate);
    }

    try {
        const [rev, exp] = await Promise.all([
            c.env.DB.prepare(revQuery).bind(...params).first(),
            c.env.DB.prepare(expQuery).bind(...params).first(),
        ]);
        const balance = ((rev as any)?.total || 0) - ((exp as any)?.total || 0);
        return c.json({ balance });
    } catch (e) {
        return c.json({ balance: 0 });
    }
});

// Dashboard Analytics with Caching Strategy
const DASHBOARD_CACHE_TTL = 30; // seconds

app.get('/api/v1/analytics/dashboard', async (c) => {
    try {
        // Check Cloudflare Cache
        const cacheKey = c.req.url;
        const cache = (caches as any).default;
        let response = await cache.match(cacheKey);

        if (response) {
            return response;
        }

        if (c.req.query('sync') === 'true') {
            const syncStatements = [
                syncMetricSQL(c.env.DB, 'total_students', "SELECT COUNT(*) FROM students WHERE LOWER(status) IN ('active', 'actif')"),
                syncMetricSQL(c.env.DB, 'total_teachers', "SELECT COUNT(*) FROM teachers WHERE LOWER(status) IN ('active', 'actif')"),
                syncMetricSQL(c.env.DB, 'active_classes', "SELECT COUNT(*) FROM classes WHERE is_active = 1"),
                syncMetricSQL(c.env.DB, 'pending_documents', "SELECT COUNT(*) FROM documents WHERE LOWER(status) IN ('pending', 'en attente')"),
                syncMetricSQL(c.env.DB, 'total_revenue', "SELECT COALESCE(SUM(amount_paid), 0) FROM transactions WHERE type = 'revenue'"),
                syncMetricSQL(c.env.DB, 'students_male', "SELECT COUNT(*) FROM students WHERE LOWER(gender) IN ('masculin', 'male', 'm') AND LOWER(status) IN ('active', 'actif')"),
                syncMetricSQL(c.env.DB, 'students_female', "SELECT COUNT(*) FROM students WHERE LOWER(gender) IN ('féminin', 'female', 'f') AND LOWER(status) IN ('active', 'actif')"),
            ];
            await c.env.DB.batch(syncStatements);
        }

        const batchResults = await c.env.DB.batch([
            // Fast metrics from aggregation table
            c.env.DB.prepare("SELECT metric_key, metric_value FROM dashboard_metrics"),

            // Classes with occupancy and teacher info (Still dynamic for accuracy)
            c.env.DB.prepare(`
                SELECT c.id, c.name as class_name, c.capacity,
                       (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND LOWER(s.status) IN ('active', 'actif')) as student_count,
                       COALESCE(u.first_name || ' ' || u.last_name, t.first_name || ' ' || t.last_name) as teacher_name
                FROM classes c
                LEFT JOIN teachers t ON c.main_teacher_id = t.id
                LEFT JOIN users u ON t.user_id = u.id
                WHERE c.is_active = 1
                ORDER BY c.level, c.name
            `),

            // 30-day Document status breakdown (Still dynamic as it's time-sensitive)
            c.env.DB.prepare(`
                SELECT 
                    COUNT(*) as total_docs,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_docs,
                    SUM(CASE WHEN status = 'approved' OR status = 'Validé' THEN 1 ELSE 0 END) as approved_docs,
                    SUM(CASE WHEN status = 'rejected' OR status = 'Rejeté' THEN 1 ELSE 0 END) as rejected_docs,
                    SUM(CASE WHEN status = 'missing' THEN 1 ELSE 0 END) as missing_docs
                FROM documents
                WHERE DATE(uploaded_at) >= DATE('now', '-30 days')
            `),

            // Academic Performance
            c.env.DB.prepare(`
                SELECT c.id, c.name, AVG((g.value / g.max_value) * 100) as average
                FROM classes c
                JOIN students s ON s.class_id = c.id
                JOIN grades g ON g.student_id = s.id
                WHERE c.is_active = 1
                GROUP BY c.id, c.name
                ORDER BY average DESC
            `),
        ]);

        const metricsRaw = batchResults[0]?.results || [];
        const metrics: Record<string, number> = {};
        metricsRaw.forEach((m: any) => { metrics[m.metric_key] = m.metric_value; });

        const classesRows = batchResults[1]?.results || [];
        const documentsRow = batchResults[2]?.results?.[0] as any || { total_docs: 0, pending_docs: 0, approved_docs: 0, rejected_docs: 0, missing_docs: 0 };
        const performanceRows = batchResults[3]?.results || [];

        const dashboardData = {
            timestamp: new Date().toISOString(),
            students: {
                total: metrics['total_students'] || 0,
                male: metrics['students_male'] || 0,
                female: metrics['students_female'] || 0
            },
            teachers: {
                total: metrics['total_teachers'] || 0
            },
            classes: classesRows,
            documents: {
                total_docs: documentsRow.total_docs || 0,
                pending_docs: metrics['pending_documents'] || documentsRow.pending_docs || 0,
                approved_docs: documentsRow.approved_docs || 0,
                rejected_docs: documentsRow.rejected_docs || 0,
                missing_docs: documentsRow.missing_docs || 0
            },
            classPerformances: performanceRows,
            totalRevenue: metrics['total_revenue'] || 0,

            // Legacy flat fields
            studentsCount: metrics['total_students'] || 0,
            teachersCount: metrics['total_teachers'] || 0,
            classesCount: classesRows.length || 0,
            pendingDocs: metrics['pending_documents'] || 0,
            missingDocs: documentsRow.missing_docs || 0,
            approvedDocs: documentsRow.approved_docs || 0,
            rejectedDocs: documentsRow.rejected_docs || 0,

            server: 'cloudflare-d1-optimized'
        };

        // Cache the response
        response = c.json(dashboardData);
        response.headers.set('Cache-Control', `public, max-age=${DASHBOARD_CACHE_TTL}`);
        c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

        return response;
    } catch (e) {
        console.error('Dashboard analytics error:', e);
        return c.json({ error: 'Failed to generate dashboard statistics' }, 500);
    }
});

// ========================================================================
// STUDENTS ROUTES
// ========================================================================

app.get('/api/v1/students', async (c) => {
    const search = c.req.query('search') || c.req.query('q');
    const classId = c.req.query('classId');
    const gradeLevel = c.req.query('gradeLevel');
    const status = c.req.query('status');
    const gender = c.req.query('gender');
    const teacherId = c.req.query('teacherId');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let query = `
        SELECT s.*, 
               u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
               c.name as class_name 
        FROM students s 
        LEFT JOIN users u ON s.user_id = u.id 
        LEFT JOIN classes c ON s.class_id = c.id 
        WHERE 1=1
    `;

    const params: any[] = [];

    if (status && status !== 'all') {
        const dbStatus = (status === 'Actif' || status === 'active') ? 'active' :
            (status === 'Inactif' || status === 'inactive') ? 'inactive' :
                (status === 'En attente' || status === 'pending') ? 'pending' : status;
        query += ` AND s.status = ?`;
        params.push(dbStatus);
    } else {
        // Default: show both 'active' and 'pending' unless 'all' or specific status is requested
        query += ` AND s.status IN ('active', 'pending')`;
    }

    if (classId) {
        query += ` AND s.class_id = ?`;
        params.push(classId);
    }

    if (gradeLevel) {
        query += ` AND (s.academic_level = ? OR c.level = ?)`;
        params.push(gradeLevel, gradeLevel);
    }

    if (gender) {
        // Handle both 'Masculin'/'Féminin' and 'male'/'female'
        if (gender === 'Masculin' || gender === 'male') {
            query += ` AND (s.gender = 'Masculin' OR s.gender = 'male')`;
        } else if (gender === 'Féminin' || gender === 'female') {
            query += ` AND (s.gender = 'Féminin' OR s.gender = 'female')`;
        }
    }

    if (teacherId) {
        query += ` AND c.main_teacher_id = ?`;
        params.push(teacherId);
    }

    if (startDate) {
        query += ` AND s.enrollment_date >= ?`;
        params.push(startDate);
    }

    if (endDate) {
        query += ` AND s.enrollment_date <= ?`;
        params.push(endDate);
    }

    if (search) {
        query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_code LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY s.last_name ASC, s.first_name ASC`;

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results.map(mapStudent));
});

app.get('/api/v1/students/:id', async (c) => {
    const id = c.req.param('id');
    if (id === 'stats') return c.notFound(); // Safety for overlapping routes

    const student = await c.env.DB.prepare(`
        SELECT s.*, 
               u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
               c.name as class_name 
        FROM students s 
        LEFT JOIN users u ON s.user_id = u.id 
        LEFT JOIN classes c ON s.class_id = c.id 
        WHERE s.id = ?
    `).bind(id).first();
    return student ? c.json(mapStudent(student)) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/v1/students', async (c) => {
    try {
        const data = await c.req.json();
        const id = data.id || crypto.randomUUID();

        // Check for existing user by email to avoid FOREIGN KEY constraint failure
        let userId = data.userId;
        let existingUser = null;

        if (data.email) {
            existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(data.email).first();
            if (existingUser) {
                userId = (existingUser as any).id;
            }
        }

        if (!userId) {
            userId = `user-student-${id}`;
        }

        const isEntryActive = (data.status === 'Actif' || data.status === 'active');
        const statements = [];

        // Prepare User statement - only if user doesn't exist
        if (!existingUser) {
            statements.push(c.env.DB.prepare(`
                INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active)
                VALUES (?, ?, 'placeholder', 'student', ?, ?, 1)
                ON CONFLICT(email) DO UPDATE SET is_active = 1
            `).bind(userId, data.email || `s-${id}@ksp.ci`, data.firstName || '', data.lastName || ''));
        } else {
            // Update existing user instead
            statements.push(c.env.DB.prepare(`
                UPDATE users SET first_name = ?, last_name = ?, is_active = 1 WHERE id = ?
            `).bind(data.firstName || '', data.lastName || '', userId));
        }

        // Prepare Student statement
        statements.push(c.env.DB.prepare(`
            INSERT INTO students (
                id, user_id, student_code, birth_date, gender, nationality, 
                birth_place, address, enrollment_date, class_id, academic_level, 
                emergency_contact_name, emergency_contact_phone, medical_info, 
                status, photo_url, documents, phone, email, first_name, last_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, userId, data.registrationNumber || `KSP-S-${id.substring(0, 4)}`,
            data.dob || '2010-01-01', data.gender || 'other', data.nationality || 'Ivoirienne',
            data.birthPlace || null, data.address || null,
            data.classId || null, data.gradeLevel || null,
            data.emergencyContactName || null,
            data.emergencyContactPhone || null,
            data.medicalInfo || null,
            isEntryActive ? 'active' : (data.status === 'En attente' || data.status === 'pending' || !data.status) ? 'pending' : 'inactive',
            data.photoUrl || null,
            JSON.stringify(data.documents || []),
            data.phone || null,
            data.email || null,
            data.firstName || '',
            data.lastName || ''
        ));

        // Update metrics if active
        if (isEntryActive) {
            statements.push(updateMetricSQL(c.env.DB, 'total_students', 1));
            const gen = (data.gender || '').toLowerCase();
            const genderKey = (gen === 'masculin' || gen === 'male' || gen === 'm') ? 'students_male' :
                (gen === 'féminin' || gen === 'female' || gen === 'f') ? 'students_female' : null;
            if (genderKey) {
                statements.push(updateMetricSQL(c.env.DB, genderKey, 1));
            }
        }

        await c.env.DB.batch(statements);

        // Persistence confirmation
        const student = await c.env.DB.prepare(`
            SELECT s.*, 
                   u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
                   c.name as class_name 
            FROM students s 
            LEFT JOIN users u ON s.user_id = u.id 
            LEFT JOIN classes c ON s.class_id = c.id 
            WHERE s.id = ?
        `).bind(id).first();

        return c.json(mapStudent(student), 201);
    } catch (error) {
        console.error('Student creation error:', error);
        return c.json({ error: 'Failed to create student', message: error instanceof Error ? error.message : 'Unknown' }, 500);
    }
});

app.put('/api/v1/students/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();

        const result = await c.env.DB.prepare(`
            UPDATE students SET 
                student_code = COALESCE(?, student_code),
                birth_date = COALESCE(?, birth_date),
                gender = COALESCE(?, gender),
                nationality = COALESCE(?, nationality),
                birth_place = COALESCE(?, birth_place),
                address = COALESCE(?, address),
                class_id = COALESCE(?, class_id),
                academic_level = COALESCE(?, academic_level),
                emergency_contact_name = COALESCE(?, emergency_contact_name),
                emergency_contact_phone = COALESCE(?, emergency_contact_phone),
                medical_info = COALESCE(?, medical_info),
                status = COALESCE(?, status),
                photo_url = COALESCE(?, photo_url),
                documents = COALESCE(?, documents),
                phone = COALESCE(?, phone),
                email = COALESCE(?, email),
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(
            data.registrationNumber || null,
            data.dob || null,
            data.gender || null,
            data.nationality || null,
            data.birthPlace || null,
            data.address || null,
            data.classId || null,
            data.gradeLevel || null,
            data.emergencyContactName || null,
            data.emergencyContactPhone || null,
            data.medicalInfo || null,
            (data.status === 'Actif' || data.status === 'active') ? 'active' : data.status === 'inactive' ? 'inactive' : null,
            data.photoUrl || null,
            data.documents ? JSON.stringify(data.documents) : null,
            data.phone || null,
            data.email || null,
            data.firstName || null,
            data.lastName || null,
            id
        ).run();

        if (result.meta.changes === 0) {
            return c.json({ error: 'Student not found or no changes were made' }, 404);
        }

        // NEW: Sync metrics if status or gender was updated
        if (data.status || data.gender) {
            await c.env.DB.batch([
                syncMetricSQL(c.env.DB, 'total_students', "SELECT COUNT(*) FROM students WHERE LOWER(status) IN ('active', 'actif')"),
                syncMetricSQL(c.env.DB, 'students_male', "SELECT COUNT(*) FROM students WHERE LOWER(gender) IN ('masculin', 'male', 'm') AND LOWER(status) IN ('active', 'actif')"),
                syncMetricSQL(c.env.DB, 'students_female', "SELECT COUNT(*) FROM students WHERE LOWER(gender) IN ('féminin', 'female', 'f') AND LOWER(status) IN ('active', 'actif')"),
            ]);
        }

        // Persistence confirmation and return updated record
        const updated = await c.env.DB.prepare(`
            SELECT s.*, 
                   u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
                   c.name as class_name 
            FROM students s 
            LEFT JOIN users u ON s.user_id = u.id 
            LEFT JOIN classes c ON s.class_id = c.id 
            WHERE s.id = ?
        `).bind(id).first();

        return c.json(mapStudent(updated));
    } catch (error) {
        console.error('Student update error:', error);
        return c.json({ error: 'Failed to update student', message: error instanceof Error ? error.message : 'Unknown' }, 500);
    }
});

app.patch('/api/v1/students/:id/documents', async (c) => {
    try {
        const studentId = c.req.param('id');
        const { documents } = await c.req.json();

        if (!Array.isArray(documents)) {
            return c.json({ error: 'Documents must be an array' }, 400);
        }

        const statements = documents.map((doc: any) => {
            const docId = doc.id || crypto.randomUUID();
            return c.env.DB.prepare(`
                INSERT INTO documents (id, student_id, document_type, status, file_path, uploaded_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(student_id, document_type) DO UPDATE SET
                    status = EXCLUDED.status,
                    file_path = COALESCE(EXCLUDED.file_path, documents.file_path),
                    uploaded_at = CURRENT_TIMESTAMP
            `).bind(docId, studentId, doc.type || doc.document_type, doc.status || 'Manquant', doc.fileUrl || doc.file_path || null);
        });

        // NEW: Sync pending documents metric after bulk update
        statements.push(syncMetricSQL(c.env.DB, 'pending_documents', "SELECT COUNT(*) FROM documents WHERE LOWER(status) IN ('pending', 'en attente')"));

        await c.env.DB.batch(statements);

        // Sync metadata back to students table for real-time stats
        const updatedDocsRaw = await c.env.DB.prepare('SELECT * FROM documents WHERE student_id = ?').bind(studentId).all();
        const updatedDocs = updatedDocsRaw.results.map(mapDocument);

        await c.env.DB.prepare('UPDATE students SET documents = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(JSON.stringify(updatedDocs), studentId)
            .run();

        // Fetch and return the updated student state (with all docs)
        const student = await c.env.DB.prepare(`
            SELECT s.*, 
                   u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
                   c.name as class_name 
            FROM students s 
            LEFT JOIN users u ON s.user_id = u.id 
            LEFT JOIN classes c ON s.class_id = c.id 
            WHERE s.id = ?
        `).bind(studentId).first();

        const studentDocs = await c.env.DB.prepare('SELECT * FROM documents WHERE student_id = ?').bind(studentId).all();

        const mappedStudent = mapStudent(student);
        mappedStudent.documents = studentDocs.results.map(mapDocument);

        return c.json(mappedStudent);
    } catch (error) {
        console.error('Documents bulk update error:', error);
        return c.json({ error: 'Failed to update documents', message: error instanceof Error ? error.message : 'Unknown' }, 500);
    }
});

app.delete('/api/v1/students/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const student = await c.env.DB.prepare('SELECT status, gender FROM students WHERE id = ?').bind(id).first();

        if (!student) {
            return c.json({ error: 'Student not found' }, 404);
        }

        const wasActive = ((student as any).status === 'active' || (student as any).status === 'Actif');

        await c.env.DB.prepare("UPDATE students SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();

        if (wasActive) {
            const gen = ((student as any).gender || '').toLowerCase();
            const genderKey = (gen === 'masculin' || gen === 'male' || gen === 'm') ? 'students_male' :
                (gen === 'féminin' || gen === 'female' || gen === 'f') ? 'students_female' : null;

            const batch = [updateMetricSQL(c.env.DB, 'total_students', -1)];
            if (genderKey) {
                batch.push(updateMetricSQL(c.env.DB, genderKey, -1));
            }
            await c.env.DB.batch(batch);
        }

        return c.json({ success: true });
    } catch (error) {
        console.error('Student deletion error:', error);
        return c.json({ error: 'Failed to delete student', message: error instanceof Error ? error.message : 'Unknown' }, 500);
    }
});

// ========================================================================
// TEACHERS ROUTES
// ========================================================================

app.get('/api/v1/teachers', async (c) => {
    const { results } = await c.env.DB.prepare(`
        SELECT t.*, 
               COALESCE(u.first_name, t.first_name) as first_name, 
               COALESCE(u.last_name, t.last_name) as last_name, 
               COALESCE(u.email, t.email) as email
        FROM teachers t 
        LEFT JOIN users u ON t.user_id = u.id 
        WHERE t.status = 'active'
    `).all();
    return c.json(results.map(mapTeacher));
});

app.get('/api/v1/teachers/:id', async (c) => {
    const teacher = await c.env.DB.prepare(`
        SELECT t.*, 
               COALESCE(u.first_name, t.first_name) as first_name, 
               COALESCE(u.last_name, t.last_name) as last_name, 
               COALESCE(u.email, t.email) as email,
               COALESCE(u.phone, t.phone) as phone, 
               u.avatar_url
        FROM teachers t 
        LEFT JOIN users u ON t.user_id = u.id 
        WHERE t.id = ?
    `).bind(c.req.param('id')).first();
    return teacher ? c.json(mapTeacher(teacher)) : c.json({ error: 'Not found' }, 404);
});

app.post('/api/v1/teachers', async (c) => {
    try {
        const data = await c.req.json();
        const id = data.id || crypto.randomUUID();
        const userId = data.userId || `user-teacher-${id}`;
        const isEntryActive = (data.status === 'Actif' || data.status === 'active');

        const statements = [];

        // Prepare User statement
        statements.push(c.env.DB.prepare(`
            INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active)
            VALUES (?, ?, 'placeholder', 'teacher', ?, ?, 1)
            ON CONFLICT(email) DO UPDATE SET is_active = 1
        `).bind(userId, data.email || `t-${id}@ksp.ci`, data.firstName || '', data.lastName || ''));

        // Prepare Teacher statement
        statements.push(c.env.DB.prepare(`
            INSERT INTO teachers (
                id, user_id, registration_number, specialization, 
                hire_date, status, qualifications, address, emergency_contact
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, userId, data.registrationNumber || `ENS-2025-${id.substring(0, 3).toUpperCase()}`,
            data.subject || data.specialization || 'Non spécifié',
            data.hireDate || new Date().toISOString().split('T')[0],
            isEntryActive ? 'active' : 'inactive',
            data.qualifications || null,
            data.address || null,
            data.emergencyContact || null
        ));

        // Update metrics if active
        if (isEntryActive) {
            statements.push(updateMetricSQL(c.env.DB, 'total_teachers', 1));
        }

        await c.env.DB.batch(statements);

        // Persistence confirmation
        const teacher = await c.env.DB.prepare(`
            SELECT t.*, u.first_name, u.last_name, u.email, u.phone 
            FROM teachers t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.id = ?
        `).bind(id).first();

        return c.json(mapTeacher(teacher), 201);
    } catch (error) {
        console.error('Teacher creation error:', error);
        return c.json({ error: 'Failed to create teacher', message: error instanceof Error ? error.message : 'Unknown' }, 500);
    }
});

app.put('/api/v1/teachers/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();

        // 1. Fetch current teacher to check for user_id
        const currentTeacher = await c.env.DB.prepare('SELECT user_id FROM teachers WHERE id = ?').bind(id).first() as { user_id: string | null };
        if (!currentTeacher) {
            return c.json({ error: 'Teacher not found' }, 404);
        }

        const statements = [];

        // 2. Update teachers table
        statements.push(c.env.DB.prepare(`
            UPDATE teachers SET 
                registration_number = COALESCE(?, registration_number),
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                specialization = COALESCE(?, specialization),
                hire_date = COALESCE(?, hire_date),
                status = COALESCE(?, status),
                qualifications = COALESCE(?, qualifications),
                address = COALESCE(?, address),
                emergency_contact = COALESCE(?, emergency_contact),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(
            data.registrationNumber || null,
            data.firstName || null,
            data.lastName || null,
            data.email || null,
            data.phone || null,
            data.subject || data.specialization || null,
            data.hireDate || null,
            (data.status === 'Actif' || data.status === 'active') ? 'active' : data.status === 'inactive' ? 'inactive' : null,
            data.qualifications || null,
            data.address || null,
            data.emergencyContact || null,
            id
        ));

        // 3. Update users table if linked
        if (currentTeacher.user_id) {
            statements.push(c.env.DB.prepare(`
                UPDATE users SET 
                    first_name = COALESCE(?, first_name),
                    last_name = COALESCE(?, last_name),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(
                data.firstName || null,
                data.lastName || null,
                data.email || null,
                data.phone || null,
                currentTeacher.user_id
            ));
        }

        // 4. Sync metrics if status was updated
        if (data.status) {
            statements.push(updateMetricSQL(c.env.DB, 'total_teachers', 0)); // Placeholder or trigger sync
        }

        await c.env.DB.batch(statements);

        // Extra sync for metrics if needed
        if (data.status) {
            await syncMetricSQL(c.env.DB, 'total_teachers', "SELECT COUNT(*) FROM teachers WHERE LOWER(status) IN ('active', 'actif')").run();
        }

        // 5. Return updated record with LEFT JOIN to support teachers without users
        const updated = await c.env.DB.prepare(`
            SELECT t.*, 
                   COALESCE(u.first_name, t.first_name) as first_name, 
                   COALESCE(u.last_name, t.last_name) as last_name, 
                   COALESCE(u.email, t.email) as email,
                   COALESCE(u.phone, t.phone) as phone
            FROM teachers t 
            LEFT JOIN users u ON t.user_id = u.id 
            WHERE t.id = ?
        `).bind(id).first();

        return c.json(mapTeacher(updated));
    } catch (error) {
        console.error('Teacher update error:', error);
        return c.json({ error: 'Failed to update teacher', message: error instanceof Error ? error.message : 'Unknown' }, 500);
    }
});

app.delete('/api/v1/teachers/:id', async (c) => {
    try {
        const id = c.req.param('id');
        await c.env.DB.batch([
            c.env.DB.prepare("UPDATE teachers SET status = 'inactive' WHERE id = ?").bind(id),
            updateMetricSQL(c.env.DB, 'total_teachers', -1)
        ]);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed' }, 500);
    }
});

app.get('/api/v1/teachers/:id/classes', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM classes WHERE main_teacher_id = ? AND is_active = 1').bind(c.req.param('id')).all();
    return c.json(results.map(mapClass));
});

// ========================================================================
// TIMETABLE ROUTES
// ========================================================================

app.get('/api/v1/timetable', async (c) => {
    const classId = c.req.query('classId');
    const teacherId = c.req.query('teacherId');

    let query = `
        SELECT ts.*, sub.name as subject_name, sub.color as subject_color
        FROM timetable_slots ts
        LEFT JOIN subjects sub ON ts.subject_id = sub.id
        WHERE 1=1
    `;

    const params = [];
    if (classId) {
        query += " AND ts.class_id = ?";
        params.push(classId);
    }
    if (teacherId) {
        query += " AND ts.teacher_id = ?";
        params.push(teacherId);
    }

    query += " ORDER BY CASE day_of_week WHEN 'Lundi' THEN 1 WHEN 'Mardi' THEN 2 WHEN 'Mercredi' THEN 3 WHEN 'Jeudi' THEN 4 WHEN 'Vendredi' THEN 5 WHEN 'Samedi' THEN 6 WHEN 'Dimanche' THEN 7 ELSE 8 END, start_time";

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
});

// ========================================================================
// ATTENDANCE ROUTES
// ========================================================================

app.get('/api/v1/attendance', async (c) => {
    const classId = c.req.query('classId');
    const date = c.req.query('date');
    const studentId = c.req.query('studentId');

    let query = `SELECT * FROM attendance WHERE 1=1`;
    const params = [];

    if (classId) {
        query += " AND class_id = ?";
        params.push(classId);
    }
    if (date) {
        query += " AND date = ?";
        params.push(date);
    }
    if (studentId) {
        query += " AND student_id = ?";
        params.push(studentId);
    }

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
});

// ========================================================================
// CLASSES ROUTES
// ========================================================================

app.get('/api/v1/classes', async (c) => {
    const search = c.req.query('search');
    const level = c.req.query('level');
    const academicYear = c.req.query('academicYear');
    const mainTeacherId = c.req.query('mainTeacherId');
    const isActive = c.req.query('isActive');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    let query = `
        SELECT c.*, 
               COALESCE(u.first_name || ' ' || u.last_name, t.first_name || ' ' || t.last_name) as teacher_name,
               (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND LOWER(s.status) IN ('active', 'actif')) as student_count
        FROM classes c 
        LEFT JOIN teachers t ON c.main_teacher_id = t.id 
        LEFT JOIN users u ON t.user_id = u.id 
        WHERE 1=1
    `;

    const params: any[] = [];

    if (level) {
        query += ` AND c.level = ?`;
        params.push(level);
    }

    if (academicYear) {
        query += ` AND c.academic_year = ?`;
        params.push(academicYear);
    }

    if (mainTeacherId) {
        query += ` AND c.main_teacher_id = ?`;
        params.push(mainTeacherId);
    }

    if (isActive !== undefined) {
        query += ` AND c.is_active = ?`;
        params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    } else {
        query += ` AND c.is_active = 1`;
    }

    if (search) {
        query += ` AND (c.name LIKE ? OR c.level LIKE ? OR teacher_name LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
    const countRes = await c.env.DB.prepare(countQuery).bind(...params).first();
    const total = (countRes as any)?.count || 0;

    query += ` ORDER BY c.level ASC, c.name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
        data: results.map(mapClass),
        total,
        page,
        limit
    });
});

app.get('/api/v1/classes/:id', async (c) => {
    const classId = c.req.param('id');

    // Fetch class info with student count
    const cls = await c.env.DB.prepare(`
        SELECT c.*, 
               COALESCE(u.first_name || ' ' || u.last_name, t.first_name || ' ' || t.last_name) as teacher_name,
               (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND LOWER(s.status) IN ('active', 'actif')) as student_count
        FROM classes c 
        LEFT JOIN teachers t ON c.main_teacher_id = t.id 
        LEFT JOIN users u ON t.user_id = u.id 
        WHERE c.id = ?
    `).bind(classId).first();

    if (!cls) return c.json({ error: 'Not found' }, 404);

    // Fetch students list
    const { results: students } = await c.env.DB.prepare(`
        SELECT s.*, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email
        FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.class_id = ? AND LOWER(s.status) IN ('active', 'actif')
    `).bind(classId).all();

    // Fetch teacher details
    let teacher = null;
    if (cls.main_teacher_id) {
        teacher = await c.env.DB.prepare(`
            SELECT t.*, 
                   COALESCE(u.first_name, t.first_name) as first_name, 
                   COALESCE(u.last_name, t.last_name) as last_name, 
                   COALESCE(u.email, t.email) as email,
                   COALESCE(u.phone, t.phone) as phone
                FROM teachers t 
                LEFT JOIN users u ON t.user_id = u.id 
                WHERE t.id = ?
            `).bind(cls.main_teacher_id).first();
    }

    // Return flat enriched object for the frontend service to map
    return c.json({
        ...mapClass(cls),
        students: students.map(mapStudent),
        mainTeacher: teacher ? mapTeacher(teacher) : null,
        // Also keep raw fields as fallback for service mapper
        academic_year: cls.academic_year,
        capacity: cls.capacity,
        main_teacher_id: cls.main_teacher_id
    });
});

app.post('/api/v1/classes', async (c) => {
    try {
        const data = await c.req.json();
        const id = data.id || crypto.randomUUID();
        const isActive = data.isActive === true || data.is_active === 1 || data.isActive === 'true';

        const statements = [];
        statements.push(c.env.DB.prepare(`
            INSERT INTO classes (id, name, level, academic_year, main_teacher_id, room_number, capacity, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, data.name, data.level, data.academicYear || '2025-2026',
            data.teacherId || null, data.room || null, data.maxStudents || 40,
            isActive ? 1 : 0
        ));

        if (isActive) {
            statements.push(updateMetricSQL(c.env.DB, 'active_classes', 1));
        }

        await c.env.DB.batch(statements);

        return c.json({ success: true, id }, 201);
    } catch (error) {
        console.error('Class creation error:', error);
        return c.json({ error: 'Failed to create class', message: error instanceof Error ? error.message : 'Unknown' }, 500);
    }
});

app.put('/api/v1/classes/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();
        await c.env.DB.prepare(`
            UPDATE classes SET 
                name = COALESCE(?, name),
                level = COALESCE(?, level),
                main_teacher_id = COALESCE(?, main_teacher_id),
                room_number = COALESCE(?, room_number),
                capacity = COALESCE(?, capacity),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(data.name || null, data.level || null, data.teacherId || null, data.room || null, data.maxStudents || null, id).run();
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to update class' }, 500);
    }
});

app.delete('/api/v1/classes/:id', async (c) => {
    try {
        await c.env.DB.prepare('UPDATE classes SET is_active = 0 WHERE id = ?').bind(c.req.param('id')).run();
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete class' }, 500);
    }
});

app.get('/api/v1/classes/:id/students', async (c) => {
    const { results } = await c.env.DB.prepare(`
        SELECT s.*, u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email
        FROM students s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.class_id = ? AND s.status = 'active'
    `).bind(c.req.param('id')).all();
    return c.json(results.map(mapStudent));
});

// ========================================================================
// DOCUMENTS ROUTES
// ========================================================================

app.get('/api/v1/documents', async (c) => {
    const { results } = await c.env.DB.prepare(`
        SELECT d.*, u.first_name as user_first_name, u.last_name as user_last_name
        FROM documents d
        LEFT JOIN students s ON d.student_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
    `).all();
    return c.json(results.map(mapDocument));
});

app.get('/api/v1/students/:id/documents', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM documents WHERE student_id = ?').bind(c.req.param('id')).all();
    return c.json(results.map(mapDocument));
});

// ========================================================================
// ATTENDANCE & GRADES
// ========================================================================

app.post('/api/v1/attendance/bulk', async (c) => {
    try {
        const records = await c.req.json();
        const statements = records.map((r: any) => {
            const id = crypto.randomUUID();
            return c.env.DB.prepare(`
                INSERT INTO attendance (id, student_id, class_id, date, status, period, is_justified)
                VALUES (?, ?, ?, ?, ?, ?, 0)
            `).bind(id, r.studentId, r.classId, r.date, r.status, r.period || null);
        });

        await c.env.DB.batch(statements);
        return c.json({ success: true, count: records.length });
    } catch (error) {
        return c.json({ error: 'Failed to save attendance' }, 500);
    }
});

app.post('/api/v1/grades/bulk', async (c) => {
    try {
        const records = await c.req.json();
        const statements = records.map((r: any) => {
            const id = crypto.randomUUID();
            return c.env.DB.prepare(`
                INSERT INTO grades (id, student_id, subject_id, teacher_id, evaluation_type, value, max_value, coefficient, trimester, academic_year, evaluation_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id, r.studentId, r.subjectId, r.teacherId, r.evaluationType,
                r.value, r.maxValue || 20, r.coefficient || 1,
                r.trimester || '1er Trimestre', r.academicYear || '2025-2026',
                r.date || new Date().toISOString().split('T')[0]
            );
        });

        await c.env.DB.batch(statements);
        return c.json({ success: true, count: records.length });
    } catch (error) {
        return c.json({ error: 'Failed to save grades' }, 500);
    }
});

// ========================================================================
// ACTIVITY LOG ROUTES
// ========================================================================

app.get('/api/v1/activities', async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '100');
        const category = c.req.query('category');
        const search = c.req.query('search');
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM activity_logs WHERE 1=1`;
        const params: any[] = [];

        if (category && category !== 'all') {
            query += ` AND category = ?`;
            params.push(category);
        }

        if (search) {
            query += ` AND (user_name LIKE ? OR action LIKE ? OR details LIKE ?)`;
            const pattern = `%${search}%`;
            params.push(pattern, pattern, pattern);
        }

        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const { results } = await c.env.DB.prepare(query).bind(...params).all();
        return c.json(results.map(mapActivity));
    } catch (error) {
        return c.json({ error: 'Failed to fetch activities' }, 500);
    }
});

app.post('/api/v1/activities', async (c) => {
    try {
        const body = await c.req.json();
        const id = body.id || `act-${crypto.randomUUID()}`;
        const timestamp = body.timestamp || new Date().toISOString();

        await c.env.DB.prepare(`
            INSERT INTO activity_logs (id, timestamp, user_id, user_name, user_role, action, category, details, class_id, student_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            timestamp,
            body.userId,
            body.userName,
            body.userRole,
            body.action,
            body.category,
            body.details || null,
            body.classId || null,
            body.studentId || null
        ).run();

        return c.json({ success: true, id }, 201);
    } catch (error) {
        console.error('Error logging activity:', error);
        return c.json({ error: 'Failed to log activity' }, 500);
    }
});

export default app;
