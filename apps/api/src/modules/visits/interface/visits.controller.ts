import { Body, Controller, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { RequestContext } from '../../../common/context/tenant-context';
import { StartVisitUseCase } from '../application/use-cases/start-visit.use-case';
import { AddEvidenceUseCase } from '../application/use-cases/add-evidence.use-case';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { EndVisitUseCase } from '../application/use-cases/end-visit.use-case';
import { StartVisitDto } from './dto/start-visit.dto';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { EndVisitDto } from './dto/end-visit.dto';

@ApiTags('Visitas')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('visits')
export class VisitsController {
  constructor(
    private readonly startVisit: StartVisitUseCase,
    private readonly addEvidence: AddEvidenceUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly endVisit: EndVisitUseCase,
  ) {}

  @Post()
  async start(@Body() dto: StartVisitDto, @CurrentTenant() ctx: RequestContext) {
    return this.startVisit.execute({
      clientGeneratedId: dto.clientGeneratedId,
      propertyId: dto.propertyId,
      professionalId: ctx.userId,
      type: dto.type,
      startedAt: new Date(dto.startedAt),
    });
  }

  @Post(':visitId/evidences')
  async attachEvidence(@Param('visitId', ParseUUIDPipe) visitId: string, @Body() dto: AddEvidenceDto) {
    return this.addEvidence.execute({ ...dto, visitId });
  }

  @Post(':visitId/tasks')
  async attachTask(@Param('visitId', ParseUUIDPipe) visitId: string, @Body() dto: CreateTaskDto) {
    return this.createTask.execute({
      ...dto,
      visitId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  @Patch(':visitId/end')
  async close(@Param('visitId', ParseUUIDPipe) visitId: string, @Body() dto: EndVisitDto) {
    return this.endVisit.execute({ visitId, endedAt: new Date(dto.endedAt), summary: dto.summary });
  }
}
