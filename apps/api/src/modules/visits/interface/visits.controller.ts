import {
  Body,
  Controller,
  Get,
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
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { RequestContext } from '../../../common/context/tenant-context';
import { StartVisitUseCase } from '../application/use-cases/start-visit.use-case';
import { AddEvidenceUseCase } from '../application/use-cases/add-evidence.use-case';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { EndVisitUseCase } from '../application/use-cases/end-visit.use-case';
import { CancelVisitUseCase } from '../application/use-cases/cancel-visit.use-case';
import { ListVisitsUseCase } from '../application/use-cases/list-visits.use-case';
import { GetVisitUseCase } from '../application/use-cases/get-visit.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/update-task.use-case';
import { ListEvidencesUseCase } from '../application/use-cases/list-evidences.use-case';
import { TASK_REPOSITORY, TaskRepository } from '../domain/repositories/task.repository';
import { StartVisitDto } from './dto/start-visit.dto';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { EndVisitDto } from './dto/end-visit.dto';
import { ListVisitsQueryDto } from './dto/list-visits-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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
    private readonly cancelVisit: CancelVisitUseCase,
    private readonly listVisits: ListVisitsUseCase,
    private readonly getVisit: GetVisitUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly listEvidences: ListEvidencesUseCase,
    @Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository,
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

  @Get()
  async list(@Query() query: ListVisitsQueryDto) {
    return this.listVisits.execute({ propertyId: query.propertyId, status: query.status }, query.page, query.limit);
  }

  @Get(':visitId')
  async get(@Param('visitId', ParseUUIDPipe) visitId: string) {
    return this.getVisit.execute(visitId);
  }

  @Post(':visitId/evidences')
  async attachEvidence(@Param('visitId', ParseUUIDPipe) visitId: string, @Body() dto: AddEvidenceDto) {
    return this.addEvidence.execute({ ...dto, visitId });
  }

  @Get(':visitId/evidences')
  async getEvidences(@Param('visitId', ParseUUIDPipe) visitId: string) {
    return this.listEvidences.execute(visitId);
  }

  @Post(':visitId/tasks')
  async attachTask(@Param('visitId', ParseUUIDPipe) visitId: string, @Body() dto: CreateTaskDto) {
    return this.createTask.execute({
      ...dto,
      visitId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  @Get(':visitId/tasks')
  async getTasks(@Param('visitId', ParseUUIDPipe) visitId: string) {
    return this.tasks.findByVisitId(visitId);
  }

  @Patch(':visitId/tasks/:taskId')
  async updateOneTask(
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.updateTask.execute({
      visitId,
      taskId,
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  @Patch(':visitId/end')
  async close(@Param('visitId', ParseUUIDPipe) visitId: string, @Body() dto: EndVisitDto) {
    return this.endVisit.execute({ visitId, endedAt: new Date(dto.endedAt), summary: dto.summary });
  }

  @Patch(':visitId/cancel')
  async cancel(@Param('visitId', ParseUUIDPipe) visitId: string) {
    return this.cancelVisit.execute(visitId);
  }
}
