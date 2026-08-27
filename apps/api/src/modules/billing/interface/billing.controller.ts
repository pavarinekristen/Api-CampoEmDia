import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { paginationToSkipTake, buildPaginatedResult } from '../../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateChargeUseCase } from '../application/create-charge.use-case';
import { GetChargeUseCase } from '../application/get-charge.use-case';
import { UpdateChargeUseCase } from '../application/update-charge.use-case';
import { MarkChargePaidUseCase } from '../application/mark-charge-paid.use-case';
import { CancelChargeUseCase } from '../application/cancel-charge.use-case';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';

@ApiTags('Cobrança')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('billing/charges')
export class BillingController {
  constructor(
    private readonly createCharge: CreateChargeUseCase,
    private readonly getCharge: GetChargeUseCase,
    private readonly updateCharge: UpdateChargeUseCase,
    private readonly markChargePaid: MarkChargePaidUseCase,
    private readonly cancelCharge: CancelChargeUseCase,
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
  async list(@Query() query: PaginationQueryDto) {
    const { skip, take } = paginationToSkipTake(query.page, query.limit);
    const [items, total] = await Promise.all([
      this.prisma.serviceCharge.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.serviceCharge.count(),
    ]);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getCharge.execute(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateChargeDto) {
    return this.updateCharge.execute({
      chargeId: id,
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  @Patch(':id/mark-paid')
  async markPaid(@Param('id', ParseUUIDPipe) id: string) {
    return this.markChargePaid.execute(id);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancelCharge.execute(id);
  }
}
