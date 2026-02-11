import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { TeacherRole } from '../entities/teacher-class-assignment.entity';

export class AssignTeacherDto {
    @ApiProperty({ description: 'ID de l\'enseignant à affecter', example: 'uuid-123' })
    @IsUUID()
    teacherId: string;

    @ApiProperty({
        description: 'Rôle de l\'enseignant dans cette classe',
        enum: TeacherRole,
        example: TeacherRole.SPORTS,
    })
    @IsEnum(TeacherRole)
    role: TeacherRole;
}
