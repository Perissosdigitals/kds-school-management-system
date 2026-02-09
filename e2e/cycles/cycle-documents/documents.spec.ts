// e2e/cycles/cycle-documents/documents.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('R2 Document Storage Integration', () => {
    let authToken: string;
    let testStudentId: string;
    const TEST_PDF_PATH = path.join(__dirname, 'fixtures/test-document.pdf');

    test.beforeAll(async ({ request }) => {
        // 1. Créer un document test
        // Ensure dir exists
        const fixtureDir = path.dirname(TEST_PDF_PATH);
        if (!fs.existsSync(fixtureDir)) {
            fs.mkdirSync(fixtureDir, { recursive: true });
        }

        if (!fs.existsSync(TEST_PDF_PATH)) {
            fs.writeFileSync(TEST_PDF_PATH, '%PDF-1.4\nTest Document for R2 Verification\n');
        }

        // 2. Login pour obtenir token
        const loginResponse = await request.post(`${process.env.API_URL}/api/v1/auth/login`, {
            data: {
                email: process.env.ADMIN_EMAIL || 'admin@kds.edu',
                password: process.env.ADMIN_PASSWORD || 'admin123'
            }
        });

        expect(loginResponse.ok()).toBeTruthy();
        const loginData = await loginResponse.json();
        authToken = loginData.access_token;

        // 3. Créer un étudiant test
        const studentResponse = await request.post(`${process.env.API_URL}/api/v1/students`, {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Test',
                lastName: `R2Verification-${Date.now()}`,
                dateOfBirth: '2015-06-15',
                gender: 'M',
                placeOfBirth: 'Abidjan',
                nationality: 'Ivoirienne',
                address: 'Rue Test',
                parentName: 'Parent Test',
                parentPhone: '0102030405',
                parentEmail: 'parent@test.com'
            }
        });

        expect(studentResponse.ok()).toBeTruthy();
        const studentData = await studentResponse.json();
        testStudentId = studentData.id;
    });

    test('should upload PDF to R2 and store metadata in D1', async ({ request }) => {
        // 1. Upload document
        const formData = new FormData();
        const pdfBuffer = fs.readFileSync(TEST_PDF_PATH);
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData.append('file', pdfBlob, 'test-verification.pdf');
        formData.append('studentId', testStudentId);
        formData.append('type', 'BULLETIN');
        formData.append('title', 'Bulletin Test Verification');

        const uploadResponse = await request.post(`${process.env.API_URL}/api/v1/documents/upload`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                // Note: Playwright handles FormData automatically
            },
            multipart: {
                file: {
                    name: 'test-verification.pdf',
                    mimeType: 'application/pdf',
                    buffer: pdfBuffer
                },
                studentId: testStudentId,
                type: 'BULLETIN',
                title: 'Bulletin Test Verification'
            }
        });

        expect(uploadResponse.ok()).toBeTruthy();
        const uploadData = await uploadResponse.json();

        // 2. Vérifier metadata dans D1
        expect(uploadData.success).toBe(true);
        // Depending on backend implementation, it might return the document object directly or wrapped
        const documentId = uploadData.document?.id || uploadData.id;
        expect(documentId).toBeTruthy();

        // 3. Récupérer metadata depuis D1
        const getResponse = await request.get(`${process.env.API_URL}/api/v1/documents/${documentId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(getResponse.ok()).toBeTruthy();
        const documentData = await getResponse.json();

        // Vérifications D1
        expect(documentData.id).toBe(documentId);
        expect(documentData.studentId).toBe(testStudentId);

        // 4. Télécharger depuis R2
        const downloadResponse = await request.get(`${process.env.API_URL}/api/v1/documents/${documentId}/view`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(downloadResponse.ok()).toBeTruthy();
        expect(downloadResponse.headers()['content-type']).toBe('application/pdf');

        // 5. Vérifier dans la liste des documents de l'étudiant
        const listResponse = await request.get(`${process.env.API_URL}/api/v1/documents/student/${testStudentId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(listResponse.ok()).toBeTruthy();
        const documentsList = await listResponse.json();
        expect(documentsList.some((doc: any) => doc.id === documentId)).toBeTruthy();
    });

    test.afterAll(async ({ request }) => {
        // Nettoyage
        if (testStudentId) {
            await request.delete(`${process.env.API_URL}/api/v1/students/${testStudentId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        }
    });
});
