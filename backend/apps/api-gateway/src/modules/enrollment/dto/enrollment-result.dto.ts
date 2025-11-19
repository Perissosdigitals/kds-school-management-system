import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../students/entities/student.entity';
import { Transaction } from '../../finance/entities/transaction.entity';

export class EnrollmentResultDto {
  @ApiProperty({ description: 'Statut de l\'inscription' })
  success: boolean;

  @ApiProperty({ description: 'Message de confirmation' })
  message: string;

  @ApiProperty({ description: 'Informations de l\'élève inscrit', type: () => Student })
  student: Student;

  @ApiProperty({ description: 'Transactions financières créées', type: () => [Transaction] })
  financialRecords: Transaction[];

  @ApiProperty({ description: 'Informations de la classe' })
  classInfo: {
    id: string;
    name: string;
    level: string;
    capacity: number;
    currentStudents: number;
    mainTeacher?: {
      id: string;
      firstName: string;
      lastName: string;
      subject: string;
    };
  };

  @ApiProperty({ description: 'Documents requis pour l\'inscription' })
  requiredDocuments: Array<{
    type: string;
    status: string;
    required: boolean;
  }>;

  @ApiProperty({ description: 'Prochaines étapes' })
  nextSteps: string[];
}
