import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateHealthEventUseCase } from '../application/use-cases/create-health-event.use-case';
import { ListHealthEventsUseCase } from '../application/use-cases/list-health-events.use-case';
import { ListUpcomingHealthEventsUseCase } from '../application/use-cases/list-upcoming-health-events.use-case';
import { CreateHealthEventDto } from './dto/create-health-event.dto';

@ApiTags('Veterinária — Eventos Sanitários')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller()
export class HealthEventsController {
  constructor(
    private readonly createHealthEvent: CreateHealthEventUseCase,
    private readonly listHealthEvents: ListHealthEventsUseCase,
    private readonly listUpcomingHealthEvents: ListUpcomingHealthEventsUseCase,
  ) {}

  @Post('animals/:animalId/health-events')
  async create(@Param('animalId', ParseUUIDPipe) animalId: string, @Body() dto: CreateHealthEventDto) {
    return this.createHealthEvent.execute({
      ...dto,
      animalId,
      appliedAt: new Date(dto.appliedAt),
      withdrawalUntil: dto.withdrawalUntil ? new Date(dto.withdrawalUntil) : undefined,
      nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : undefined,
      expectedBirthDate: dto.expectedBirthDate ? new Date(dto.expectedBirthDate) : undefined,
    });
  }

  @Get('animals/:animalId/health-events')
  async list(@Param('animalId', ParseUUIDPipe) animalId: string, @Query() query: PaginationQueryDto) {
    return this.listHealthEvents.execute(animalId, query.page, query.limit);
  }

  @Get('health-events/upcoming')
  async upcoming(@Query('withinDays') withinDays?: string) {
    return this.listUpcomingHealthEvents.execute(withinDays ? Number(withinDays) : 30);
  }
}
