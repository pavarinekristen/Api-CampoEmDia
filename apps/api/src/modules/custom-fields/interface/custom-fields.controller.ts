import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CreateCustomFieldUseCase } from '../application/use-cases/create-custom-field.use-case';
import { ListCustomFieldsUseCase } from '../application/use-cases/list-custom-fields.use-case';
import { UpdateCustomFieldUseCase } from '../application/use-cases/update-custom-field.use-case';
import { DeactivateCustomFieldUseCase } from '../application/use-cases/deactivate-custom-field.use-case';
import { ApplySpecialtyTemplateUseCase } from '../application/use-cases/apply-specialty-template.use-case';
import { Specialty } from '../application/specialty-templates';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { ListCustomFieldsQueryDto } from './dto/list-custom-fields-query.dto';

const MANAGEMENT_ROLES = ['PROFISSIONAL_PROPRIETARIO', 'GESTOR_EQUIPE'];

@ApiTags('Campos Customizáveis')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(
    private readonly createCustomField: CreateCustomFieldUseCase,
    private readonly listCustomFields: ListCustomFieldsUseCase,
    private readonly updateCustomField: UpdateCustomFieldUseCase,
    private readonly deactivateCustomField: DeactivateCustomFieldUseCase,
    private readonly applySpecialtyTemplate: ApplySpecialtyTemplateUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListCustomFieldsQueryDto) {
    return this.listCustomFields.execute(query.entityType);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  async create(@Body() dto: CreateCustomFieldDto) {
    return this.createCustomField.execute(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCustomFieldDto) {
    return this.updateCustomField.execute({ id, ...dto });
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.deactivateCustomField.execute(id);
  }

  @Post('apply-template/:specialty')
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  async applyTemplate(@Param('specialty') specialty: Specialty) {
    return this.applySpecialtyTemplate.execute(specialty);
  }
}
