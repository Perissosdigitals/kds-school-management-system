import { ApiProperty } from '@nestjs/swagger';

export class CreateParentDto {
    @ApiProperty({ description: 'Prénom', example: 'Jean' })
    firstName: string;

    @ApiProperty({ description: 'Nom de famille', example: 'Kouassi' })
    lastName: string;

    @ApiProperty({ description: 'Email', example: 'jean.kouassi@email.com', required: false })
    email?: string;

    @ApiProperty({ description: 'Téléphone', example: '+225 07 07 07 07 07' })
    phone: string;

    @ApiProperty({ description: 'Adresse', example: 'Cocody, Abidjan', required: false })
    address?: string;

    @ApiProperty({ description: 'ID utilisateur associé', required: false })
    userId?: string;
}
