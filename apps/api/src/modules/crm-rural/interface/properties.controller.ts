import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CreatePropertyUseCase } from '../application/use-cases/create-property.use-case';
import { PROPERTY_REPOSITORY, PropertyRepository } from '../domain/repositories/property.repository';
import { Inject } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';

@ApiTags('CRM Rural — Propriedades')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly createProperty: CreatePropertyUseCase,
    @Inject(PROPERTY_REPOSITORY) private readonly properties: PropertyRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreatePropertyDto) {
    return this.createProperty.execute(dto);
  }

  @Get('by-client/:clientId')
  async byClient(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.properties.findByClientId(clientId);
  }
}
