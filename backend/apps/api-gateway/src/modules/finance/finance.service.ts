import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Transaction, TransactionType, PaymentStatus, TransactionCategory } from './entities/transaction.entity';
import { Student } from '../students/entities/student.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async findAll(query: QueryTransactionDto) {
    const { type, category, status, studentId, startDate, endDate, page = 1, limit = 50 } = query;
    const where: any = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    if (startDate && endDate) {
      where.transactionDate = Between(startDate, endDate);
    } else if (startDate) {
      where.transactionDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.transactionDate = LessThanOrEqual(endDate);
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ['student'],
      order: { transactionDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async create(createTransactionDto: CreateTransactionDto) {
    // Calculate remaining amount if not provided
    const amountPaid = createTransactionDto.amountPaid || 0;
    const amountRemaining = createTransactionDto.amount - amountPaid;

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      amountPaid,
      amountRemaining,
    });

    return this.transactionRepository.save(transaction);
  }

  async createBulk(createTransactionDtos: CreateTransactionDto[]) {
    const transactions = createTransactionDtos.map((dto) => {
      const amountPaid = dto.amountPaid || 0;
      const amountRemaining = dto.amount - amountPaid;
      return this.transactionRepository.create({
        ...dto,
        amountPaid,
        amountRemaining,
      });
    });

    return this.transactionRepository.save(transactions);
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.findOne(id);

    // Recalculate remaining amount if amount or amountPaid changed
    if (updateTransactionDto.amount !== undefined || updateTransactionDto.amountPaid !== undefined) {
      const newAmount = updateTransactionDto.amount ?? transaction.amount;
      const newAmountPaid = updateTransactionDto.amountPaid ?? transaction.amountPaid;
      updateTransactionDto.amountRemaining = newAmount - newAmountPaid;
    }

    Object.assign(transaction, updateTransactionDto);
    return this.transactionRepository.save(transaction);
  }

  async updatePayment(id: string, amountPaid: number, paymentMethod?: string) {
    const transaction = await this.findOne(id);
    
    transaction.amountPaid += amountPaid;
    transaction.amountRemaining = transaction.amount - transaction.amountPaid;

    if (paymentMethod) {
      transaction.paymentMethod = paymentMethod;
    }

    // Update status based on payment
    if (transaction.amountRemaining <= 0) {
      transaction.status = PaymentStatus.PAID;
    } else if (transaction.amountPaid > 0) {
      transaction.status = PaymentStatus.PARTIAL;
    }

    return this.transactionRepository.save(transaction);
  }

  async updateStatus(id: string, status: PaymentStatus) {
    const transaction = await this.findOne(id);
    transaction.status = status;
    return this.transactionRepository.save(transaction);
  }

  async remove(id: string) {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
    return { deleted: true, id };
  }

  async count(query: QueryTransactionDto) {
    const { type, category, status, studentId, startDate, endDate } = query;
    const where: any = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    if (startDate && endDate) {
      where.transactionDate = Between(startDate, endDate);
    } else if (startDate) {
      where.transactionDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.transactionDate = LessThanOrEqual(endDate);
    }

    return this.transactionRepository.count({ where });
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date) {
    const where: any = { type: TransactionType.REVENUE };

    if (startDate && endDate) {
      where.transactionDate = Between(startDate, endDate);
    } else if (startDate) {
      where.transactionDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.transactionDate = LessThanOrEqual(endDate);
    }

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amountPaid)', 'total')
      .where(where)
      .getRawOne();

    return { total: parseFloat(result.total) || 0 };
  }

  async getTotalExpenses(startDate?: Date, endDate?: Date) {
    const where: any = { type: TransactionType.EXPENSE };

    if (startDate && endDate) {
      where.transactionDate = Between(startDate, endDate);
    } else if (startDate) {
      where.transactionDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.transactionDate = LessThanOrEqual(endDate);
    }

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where(where)
      .getRawOne();

    return { total: parseFloat(result.total) || 0 };
  }

  async getBalance(startDate?: Date, endDate?: Date) {
    const revenue = await this.getTotalRevenue(startDate, endDate);
    const expenses = await this.getTotalExpenses(startDate, endDate);
    
    return {
      revenue: revenue.total,
      expenses: expenses.total,
      balance: revenue.total - expenses.total,
    };
  }

  async getStatsByCategory(type?: TransactionType, startDate?: Date, endDate?: Date) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'total')
      .addSelect('SUM(transaction.amountPaid)', 'totalPaid')
      .groupBy('transaction.category');

    if (type) {
      query.where('transaction.type = :type', { type });
    }

    if (startDate && endDate) {
      query.andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    } else if (startDate) {
      query.andWhere('transaction.transactionDate >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('transaction.transactionDate <= :endDate', { endDate });
    }

    const results = await query.getRawMany();

    return results.map((r) => ({
      category: r.category,
      count: parseInt(r.count),
      total: parseFloat(r.total) || 0,
      totalPaid: parseFloat(r.totalPaid) || 0,
    }));
  }

  async getPendingPayments(studentId?: string) {
    const where: any = {
      status: PaymentStatus.PENDING,
    };

    if (studentId) {
      where.studentId = studentId;
    }

    return this.transactionRepository.find({
      where,
      relations: ['student'],
      order: { dueDate: 'ASC' },
    });
  }

  async getOverduePayments(studentId?: string) {
    const where: any = {
      status: PaymentStatus.OVERDUE,
    };

    if (studentId) {
      where.studentId = studentId;
    }

    return this.transactionRepository.find({
      where,
      relations: ['student'],
      order: { dueDate: 'ASC' },
    });
  }

  async getStudentBalance(studentId: string) {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const transactions = await this.transactionRepository.find({
      where: { studentId, type: TransactionType.REVENUE },
    });

    const totalDue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPaid = transactions.reduce((sum, t) => sum + Number(t.amountPaid), 0);
    const totalRemaining = totalDue - totalPaid;

    return {
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      totalDue,
      totalPaid,
      totalRemaining,
      transactions: transactions.length,
    };
  }
}
