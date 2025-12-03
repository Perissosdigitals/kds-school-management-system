import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolLifeController } from './school-life.controller';
import { SchoolLifeService } from './school-life.service';
import { SchoolEvent } from './entities/school-event.entity';
import { Incident } from './entities/incident.entity';
import { Association } from './entities/association.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolEvent, Incident, Association])],
  controllers: [SchoolLifeController],
  providers: [SchoolLifeService],
  exports: [SchoolLifeService],
})
export class SchoolLifeModule {}
