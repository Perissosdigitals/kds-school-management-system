import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { SchoolClass } from '../../classes/entities/class.entity';

export enum TeacherRole {
    MAIN = 'main',
    SPORTS = 'sports',
    ART = 'art',
    MUSIC = 'music',
    SCIENCE = 'science',
    LANGUAGE = 'language',
    COMPUTER = 'computer',
    OTHER = 'other',
}

@Entity('teacher_class_assignments')
export class TeacherClassAssignment {
    @ApiProperty({ description: 'ID unique de l\'affectation' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'ID de l\'enseignant' })
    @Column({ name: 'teacher_id', type: 'uuid' })
    teacherId: string;

    @ApiProperty({ description: 'ID de la classe' })
    @Column({ name: 'class_id', type: 'uuid' })
    classId: string;

    @ApiProperty({
        description: 'Rôle de l\'enseignant dans cette classe',
        enum: TeacherRole,
        example: TeacherRole.MAIN,
    })
    @Column({
        type: 'varchar',
        length: 50,
        default: TeacherRole.OTHER,
    })
    role: TeacherRole;

    @ApiProperty({ description: 'Date d\'affectation' })
    @CreateDateColumn({ name: 'assigned_at' })
    assignedAt: Date;

    // Relations
    @ApiProperty({ type: () => Teacher, description: 'Enseignant affecté' })
    @ManyToOne(() => Teacher, teacher => teacher.classAssignments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'teacher_id' })
    teacher?: Teacher;

    @ApiProperty({ type: () => SchoolClass, description: 'Classe concernée' })
    @ManyToOne(() => SchoolClass, schoolClass => schoolClass.teacherAssignments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'class_id' })
    class?: SchoolClass;
}
