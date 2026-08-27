import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateClientUseCase } from '../application/use-cases/create-client.use-case';
import { ListClientsUseCase } from '../application/use-cases/list-clients.use-case';
import { GetClientUseCase } from '../application/use-cases/get-client.use-case';
import { UpdateClientUseCase } from '../application/use-cases/update-client.use-case';
import { DeactivateClientUseCase } from '../application/use-cases/deactivate-client.use-case';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

const MANAGEMENT_ROLES = ['PROFISSIONAL_PROPRIETARIO', 'GESTOR_EQUIPE'];

@ApiTags('CRM Rural — Clientes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly listClients: ListClientsUseCase,
    private readonly getClient: GetClientUseCase,
    private readonly updateClient: UpdateClientUseCase,
    private readonly deactivateClient: DeactivateClientUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateClientDto) {
    return this.createClient.execute(dto);
  }

  @Get()
  async list(@Query() query: PaginationQueryDto) {
    return this.listClients.execute(query.page, query.limit);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getClient.execute(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClientDto) {
    return this.updateClient.execute({ clientId: id, ...dto });
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    await this.deactivateClient.execute(id);
  }
}
