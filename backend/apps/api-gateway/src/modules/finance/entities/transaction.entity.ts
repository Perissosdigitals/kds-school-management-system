import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export enum TransactionType {
  REVENUE = 'Revenu',
  EXPENSE = 'Dépense',
}

export enum PaymentStatus {
  PENDING = 'En attente',
  PAID = 'Payé',
  PARTIAL = 'Partiel',
  OVERDUE = 'En retard',
  CANCELLED = 'Annulé',
}

export enum TransactionCategory {
  TUITION = 'Frais de scolarité',
  REGISTRATION = "Frais d'inscription",
  BOOKS = 'Manuels scolaires',
  UNIFORM = 'Uniforme',
  TRANSPORT = 'Transport',
  CANTEEN = 'Cantine',
  ACTIVITIES = 'Activités extra-scolaires',
  SALARY = 'Salaires',
  SUPPLIES = 'Fournitures',
  MAINTENANCE = 'Maintenance',
  UTILITIES = 'Charges',
  OTHER = 'Autre',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: TransactionType;

  @Column({ type: 'varchar', length: 50 })
  category: TransactionCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', length: 20 })
  status: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  studentId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountRemaining: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  recordedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
