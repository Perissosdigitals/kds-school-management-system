import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateEnrollmentDto {
    @ApiProperty({
        description: 'Nouvelle classe (si transfert)',
        example: 'e8f9c1a2-3b4c-5d6e-7f8g-9h0i1j2k3l4m',
        required: false,
    })
    @IsOptional()
    @IsString()
    class_id?: string;

    @ApiProperty({
        description: 'Nouveau statut de l\'inscription',
        example: 'active',
        enum: ['active', 'transferred', 'withdrawn', 'completed'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['active', 'transferred', 'withdrawn', 'completed'])
    enrollment_status?: string;

    @ApiProperty({
        description: 'Date de retrait ou transfert',
        example: '2024-06-15',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    withdrawal_date?: string;

    @ApiProperty({
        description: 'Raison du retrait ou du transfert',
        example: 'Déménagement de la famille',
        required: false,
    })
    @IsOptional()
    @IsString()
    withdrawal_reason?: string;
}
