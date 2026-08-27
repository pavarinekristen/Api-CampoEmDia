import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CreateAnimalUseCase } from '../application/use-cases/create-animal.use-case';
import { GetAnimalUseCase } from '../application/use-cases/get-animal.use-case';
import { ListAnimalsUseCase } from '../application/use-cases/list-animals.use-case';
import { UpdateAnimalUseCase } from '../application/use-cases/update-animal.use-case';
import { ChangeAnimalStatusUseCase } from '../application/use-cases/change-animal-status.use-case';
import { ExportAnimalsCsvUseCase } from '../application/use-cases/export-animals-csv.use-case';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { ChangeAnimalStatusDto } from './dto/change-animal-status.dto';
import { ListAnimalsQueryDto } from './dto/list-animals-query.dto';

@ApiTags('Veterinária — Animais')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller()
export class AnimalsController {
  constructor(
    private readonly createAnimal: CreateAnimalUseCase,
    private readonly getAnimal: GetAnimalUseCase,
    private readonly listAnimals: ListAnimalsUseCase,
    private readonly updateAnimal: UpdateAnimalUseCase,
    private readonly changeAnimalStatus: ChangeAnimalStatusUseCase,
    private readonly exportAnimalsCsv: ExportAnimalsCsvUseCase,
  ) {}

  @Post('properties/:propertyId/animals')
  async create(@Param('propertyId', ParseUUIDPipe) propertyId: string, @Body() dto: CreateAnimalDto) {
    return this.createAnimal.execute({
      ...dto,
      propertyId,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
    });
  }

  @Get('properties/:propertyId/animals')
  async list(@Param('propertyId', ParseUUIDPipe) propertyId: string, @Query() query: ListAnimalsQueryDto) {
    return this.listAnimals.execute({ propertyId, status: query.status, loteId: query.loteId }, query.page, query.limit);
  }

  @Get('properties/:propertyId/animals/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="animais.csv"')
  async exportCsv(@Param('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.exportAnimalsCsv.execute(propertyId);
  }

  @Get('animals/:id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getAnimal.execute(id);
  }

  @Patch('animals/:id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAnimalDto) {
    return this.updateAnimal.execute({
      ...dto,
      animalId: id,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
    });
  }

  @Patch('animals/:id/status')
  async changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ChangeAnimalStatusDto) {
    return this.changeAnimalStatus.execute({ animalId: id, status: dto.status, reason: dto.reason, at: new Date(dto.at) });
  }
}
