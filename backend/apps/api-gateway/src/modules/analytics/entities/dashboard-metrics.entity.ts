import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('dashboard_metrics')
export class DashboardMetrics {
    @ApiProperty({ description: 'Date de la métrique' })
    @PrimaryColumn({ name: 'metric_date', type: 'date' })
    metricDate: string;

    @Column({ name: 'total_students', type: 'integer', default: 0 })
    totalStudents: number;

    @Column({ name: 'active_students', type: 'integer', default: 0 })
    activeStudents: number;

    @Column({ name: 'male_students', type: 'integer', default: 0 })
    male_students: number;

    @Column({ name: 'female_students', type: 'integer', default: 0 })
    female_students: number;

    @Column({ name: 'total_documents', type: 'integer', default: 0 })
    totalDocuments: number;

    @Column({ name: 'pending_documents', type: 'integer', default: 0 })
    pendingDocuments: number;

    @Column({ name: 'validated_documents', type: 'integer', default: 0 })
    validatedDocuments: number;

    @Column({ name: 'total_classes', type: 'integer', default: 0 })
    totalClasses: number;

    @Column({ name: 'average_class_occupancy', type: 'decimal', precision: 5, scale: 2, default: 0 })
    averageClassOccupancy: number;

    @Column({ name: 'total_teachers', type: 'integer', default: 0 })
    totalTeachers: number;

    @Column({ name: 'documents_per_student', type: 'decimal', precision: 5, scale: 2, default: 0 })
    documentsPerStudent: number;

    @Column({ name: 'validation_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
    validationRate: number;

    @Column({ name: 'calculated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    calculatedAt: Date;

    @Column({ name: 'extra_data', type: 'jsonb', nullable: true })
    extraData: any;
}
