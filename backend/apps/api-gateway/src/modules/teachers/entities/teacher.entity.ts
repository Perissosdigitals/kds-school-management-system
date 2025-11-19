import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../auth/entities/user.entity';

export type TeacherStatus = 'Actif' | 'Inactif';

@Entity('teachers')
export class Teacher {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'TRAORÉ' })
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @ApiProperty({ example: 'Mamadou' })
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ example: 'Mathématiques' })
  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @ApiProperty({ example: '+225 07 11 22 33 44' })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({ example: 'mamadou.traore@kds.school' })
  @Column({ type: 'varchar', length: 150 })
  email: string;

  @ApiProperty({ enum: ['Actif', 'Inactif'], default: 'Actif' })
  @Column({ type: 'enum', enum: ['Actif', 'Inactif'], default: 'Actif' })
  status: TeacherStatus;

  // Relation optionnelle vers User pour authentification
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
