import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('activity_logs')
export class ActivityLog {
    @ApiProperty({ description: 'Identifiant unique de l\'activité' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Date et heure de l\'activité' })
    @CreateDateColumn()
    timestamp: Date;

    @ApiProperty({ description: 'ID de l\'utilisateur' })
    @Column({ nullable: true })
    user_id: string;

    @ApiProperty({ description: 'Nom de l\'utilisateur' })
    @Column({ nullable: true })
    user_name: string;

    @ApiProperty({ description: 'Rôle de l\'utilisateur' })
    @Column({ nullable: true })
    user_role: string;

    @ApiProperty({ description: 'Action effectuée' })
    @Column()
    action: string;

    @ApiProperty({ description: 'Catégorie de l\'activité' })
    @Column()
    category: string;

    @ApiProperty({ description: 'Détails supplémentaires' })
    @Column({ type: 'text', nullable: true })
    details: string;

    @ApiProperty({ description: 'ID de la classe associée', required: false })
    @Column({ nullable: true })
    class_id?: string;

    @ApiProperty({ description: 'ID de l\'élève associé', required: false })
    @Column({ nullable: true })
    student_id?: string;
}
