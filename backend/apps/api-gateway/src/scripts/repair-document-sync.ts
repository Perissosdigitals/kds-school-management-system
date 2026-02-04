#!/usr/bin/env ts-node
/**
 * Document Synchronization Repair Script
 * 
 * This script repairs orphaned document references in the students.documents JSONB column.
 * It removes references to documents that no longer exist in the documents table.
 * 
 * Usage: npm run repair:documents
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocumentsService } from '../modules/documents/documents.service';
import { StudentsService } from '../modules/students/students.service';

async function bootstrap() {
    console.log('🔧 Starting Document Synchronization Repair...\n');

    const app = await NestFactory.createApplicationContext(AppModule);
    const documentsService = app.get(DocumentsService);
    const studentsService = app.get(StudentsService);

    try {
        // Get all students
        const students = await studentsService.findAll({});
        console.log(`📊 Found ${students.length} students to process\n`);

        let totalOrphaned = 0;
        let studentsAffected = 0;
        const results: any[] = [];

        // Process each student
        for (const student of students) {
            try {
                const result = await documentsService.syncStudentDocuments(student.id);

                if (result.cleanedCount > 0) {
                    studentsAffected++;
                    totalOrphaned += result.cleanedCount;
                    results.push({
                        studentId: student.id,
                        studentName: `${student.firstName} ${student.lastName}`,
                        orphanedIds: result.orphanedIds,
                        cleanedCount: result.cleanedCount,
                        remainingCount: result.remainingCount,
                    });

                    console.log(`✅ ${student.firstName} ${student.lastName} (${student.registrationNumber})`);
                    console.log(`   Cleaned: ${result.cleanedCount} orphaned references`);
                    console.log(`   Remaining: ${result.remainingCount} valid documents\n`);
                }
            } catch (error) {
                console.error(`❌ Error processing student ${student.id}:`, error.message);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 REPAIR SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total students processed: ${students.length}`);
        console.log(`Students with orphaned references: ${studentsAffected}`);
        console.log(`Total orphaned references removed: ${totalOrphaned}`);
        console.log('='.repeat(60) + '\n');

        if (results.length > 0) {
            console.log('📝 Detailed Results:');
            console.log(JSON.stringify(results, null, 2));
        }

        console.log('\n✨ Repair completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Repair failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

bootstrap();
