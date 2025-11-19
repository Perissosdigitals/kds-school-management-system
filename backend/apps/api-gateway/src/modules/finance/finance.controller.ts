import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { PaymentStatus, TransactionType } from './entities/transaction.entity';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters' })
  async findAll(@Query() query: QueryTransactionDto) {
    return this.financeService.findAll(query);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Count transactions' })
  async count(@Query() query: QueryTransactionDto) {
    const count = await this.financeService.count(query);
    return { count };
  }

  @Get('stats/revenue')
  @ApiOperation({ summary: 'Get total revenue' })
  async getTotalRevenue(@Query('startDate') startDate?: Date, @Query('endDate') endDate?: Date) {
    return this.financeService.getTotalRevenue(startDate, endDate);
  }

  @Get('stats/expenses')
  @ApiOperation({ summary: 'Get total expenses' })
  async getTotalExpenses(@Query('startDate') startDate?: Date, @Query('endDate') endDate?: Date) {
    return this.financeService.getTotalExpenses(startDate, endDate);
  }

  @Get('stats/balance')
  @ApiOperation({ summary: 'Get balance (revenue - expenses)' })
  async getBalance(@Query('startDate') startDate?: Date, @Query('endDate') endDate?: Date) {
    return this.financeService.getBalance(startDate, endDate);
  }

  @Get('stats/by-category')
  @ApiOperation({ summary: 'Get statistics by category' })
  async getStatsByCategory(
    @Query('type') type?: TransactionType,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.financeService.getStatsByCategory(type, startDate, endDate);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending payments' })
  async getPendingPayments(@Query('studentId') studentId?: string) {
    return this.financeService.getPendingPayments(studentId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue payments' })
  async getOverduePayments(@Query('studentId') studentId?: string) {
    return this.financeService.getOverduePayments(studentId);
  }

  @Get('student/:studentId/balance')
  @ApiOperation({ summary: 'Get student balance' })
  async getStudentBalance(@Param('studentId') studentId: string) {
    return this.financeService.getStudentBalance(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async findOne(@Param('id') id: string) {
    return this.financeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.financeService.create(createTransactionDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple transactions' })
  async createBulk(@Body() createTransactionDtos: CreateTransactionDto[]) {
    return this.financeService.createBulk(createTransactionDtos);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaction' })
  async update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.financeService.update(id, updateTransactionDto);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Record payment' })
  async updatePayment(
    @Param('id') id: string,
    @Body() body: { amountPaid: number; paymentMethod?: string },
  ) {
    return this.financeService.updatePayment(id, body.amountPaid, body.paymentMethod);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transaction status' })
  async updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.financeService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  async remove(@Param('id') id: string) {
    return this.financeService.remove(id);
  }
}
