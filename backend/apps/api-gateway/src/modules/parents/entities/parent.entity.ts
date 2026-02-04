import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('parents')
export class Parent {
    @ApiProperty({ description: 'ID unique du parent' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Numéro d\'enregistrement unique (ex: PAR-2025-001)' })
    @Column({ name: 'registration_number', length: 20, unique: true })
    registrationNumber: string;

    @ApiProperty({ description: 'Prénom', example: 'Jean' })
    @Column({ name: 'first_name', length: 100 })
    firstName: string;

    @ApiProperty({ description: 'Nom de famille', example: 'Kouassi' })
    @Column({ name: 'last_name', length: 100 })
    lastName: string;

    @ApiProperty({ description: 'Email', example: 'jean.kouassi@email.com', required: false })
    @Column({ length: 150, nullable: true })
    email?: string;

    @ApiProperty({ description: 'Téléphone', example: '+225 07 07 07 07 07' })
    @Column({ length: 20 })
    phone: string;

    @ApiProperty({ description: 'Adresse', example: 'Cocody, Abidjan', required: false })
    @Column({ type: 'text', nullable: true })
    address?: string;

    @ApiProperty({ description: 'ID utilisateur associé', required: false })
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId?: string;

    @ApiProperty({ type: () => User, description: 'Compte utilisateur associé' })
    @OneToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
