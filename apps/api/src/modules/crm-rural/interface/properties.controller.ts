import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { buildPaginatedResult } from '../../../common/dto/paginated-result';
import { CreatePropertyUseCase } from '../application/use-cases/create-property.use-case';
import { GetPropertyUseCase } from '../application/use-cases/get-property.use-case';
import { UpdatePropertyUseCase } from '../application/use-cases/update-property.use-case';
import { DeactivatePropertyUseCase } from '../application/use-cases/deactivate-property.use-case';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../domain/repositories/property.repository';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

const MANAGEMENT_ROLES = ['PROFISSIONAL_PROPRIETARIO', 'GESTOR_EQUIPE'];

@ApiTags('CRM Rural — Propriedades')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly createProperty: CreatePropertyUseCase,
    private readonly getProperty: GetPropertyUseCase,
    private readonly updateProperty: UpdatePropertyUseCase,
    private readonly deactivateProperty: DeactivatePropertyUseCase,
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreatePropertyDto) {
    return this.createProperty.execute(dto);
  }

  @Get('by-client/:clientId')
  async byClient(@Param('clientId', ParseUUIDPipe) clientId: string, @Query() query: PaginationQueryDto) {
    const { items, total } = await this.properties.findByClientIdPaginated(clientId, query.page, query.limit);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getProperty.execute(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePropertyDto) {
    return this.updateProperty.execute({ propertyId: id, ...dto });
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    await this.deactivateProperty.execute(id);
  }
}
