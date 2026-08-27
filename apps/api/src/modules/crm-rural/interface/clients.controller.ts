import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CreateClientUseCase } from '../application/use-cases/create-client.use-case';
import { ListClientsUseCase } from '../application/use-cases/list-clients.use-case';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('CRM Rural — Clientes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly listClients: ListClientsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateClientDto) {
    return this.createClient.execute(dto);
  }

  @Get()
  async list() {
    return this.listClients.execute();
  }
}
