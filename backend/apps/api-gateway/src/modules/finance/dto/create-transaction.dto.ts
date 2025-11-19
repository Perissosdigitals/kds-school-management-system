import { IsEnum, IsNotEmpty, IsNumber, IsDate, IsOptional, IsUUID, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, PaymentStatus, TransactionCategory } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsEnum(TransactionCategory)
  @IsNotEmpty()
  category: TransactionCategory;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  transactionDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  description: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  referenceNumber?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  amountPaid?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  amountRemaining?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsNotEmpty()
  recordedBy: string;
}
