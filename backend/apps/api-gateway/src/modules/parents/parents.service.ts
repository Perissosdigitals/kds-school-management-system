import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { IdGenerator, EntityCode } from '../../common/utils/id-generator.util';

@Injectable()
export class ParentsService {
    constructor(
        @InjectRepository(Parent)
        private parentsRepository: Repository<Parent>,
    ) { }

    async create(createParentDto: CreateParentDto): Promise<Parent> {
        const registrationNumber = await this.generateRegistrationNumber();

        const parent = this.parentsRepository.create({
            ...createParentDto,
            registrationNumber,
        });

        return this.parentsRepository.save(parent);
    }

    async findAll(): Promise<Parent[]> {
        return this.parentsRepository.find();
    }

    async findOne(id: string): Promise<Parent | null> {
        return this.parentsRepository.findOne({ where: { id } });
    }

    private async generateRegistrationNumber(): Promise<string> {
        const yearCode = IdGenerator.getAcademicYearCode();

        return IdGenerator.generateNextId(
            this.parentsRepository,
            EntityCode.PARENT,
            yearCode
        );
    }
}
