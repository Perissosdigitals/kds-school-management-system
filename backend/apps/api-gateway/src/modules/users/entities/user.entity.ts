import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'Identifiant unique de l\'utilisateur' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Email de l\'utilisateur', example: 'user@kds.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Hash du mot de passe' })
  @Column({ select: false })
  password_hash: string;

  @ApiProperty({ description: 'Rôle de l\'utilisateur', enum: UserRole })
  @Column({ type: 'varchar' })
  role: UserRole;

  @ApiProperty({ description: 'Prénom de l\'utilisateur' })
  @Column()
  first_name: string;

  @ApiProperty({ description: 'Nom de l\'utilisateur' })
  @Column()
  last_name: string;

  @ApiProperty({ description: 'Numéro de téléphone', required: false })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ description: 'URL de l\'avatar', required: false })
  @Column({ nullable: true })
  avatar_url?: string;

  @ApiProperty({ description: 'Statut actif de l\'utilisateur' })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Date de dernière connexion', required: false })
  @Column({ nullable: true })
  last_login_at?: Date;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updated_at: Date;
}
