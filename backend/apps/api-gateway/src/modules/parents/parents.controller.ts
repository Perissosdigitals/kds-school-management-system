import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { Parent } from './entities/parent.entity';

@ApiTags('parents')
@Controller('parents')
export class ParentsController {
    constructor(private readonly parentsService: ParentsService) { }

    @Post()
    @ApiOperation({ summary: 'Créer un nouveau parent' })
    @ApiResponse({ status: 201, description: 'Le parent a été créé avec succès.', type: Parent })
    create(@Body() createParentDto: CreateParentDto) {
        return this.parentsService.create(createParentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lister tous les parents' })
    @ApiResponse({ status: 200, description: 'Liste des parents.', type: [Parent] })
    findAll() {
        return this.parentsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir un parent par ID' })
    @ApiResponse({ status: 200, description: 'Le parent trouvé.', type: Parent })
    findOne(@Param('id') id: string) {
        return this.parentsService.findOne(id);
    }
}
