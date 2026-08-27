import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateChargeUseCase } from '../application/create-charge.use-case';
import { CreateChargeDto } from './dto/create-charge.dto';

@ApiTags('Cobrança')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('billing/charges')
export class BillingController {
  constructor(
    private readonly createCharge: CreateChargeUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() dto: CreateChargeDto) {
    return this.createCharge.execute({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  @Get()
  async list() {
    return this.prisma.serviceCharge.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
