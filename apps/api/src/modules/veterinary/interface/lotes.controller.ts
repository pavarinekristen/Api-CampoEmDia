import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CreateLoteUseCase } from '../application/use-cases/create-lote.use-case';
import { ListLotesUseCase } from '../application/use-cases/list-lotes.use-case';
import { UpdateLoteUseCase } from '../application/use-cases/update-lote.use-case';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@ApiTags('Veterinária — Lotes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller()
export class LotesController {
  constructor(
    private readonly createLote: CreateLoteUseCase,
    private readonly listLotes: ListLotesUseCase,
    private readonly updateLote: UpdateLoteUseCase,
  ) {}

  @Post('properties/:propertyId/lotes')
  async create(@Param('propertyId', ParseUUIDPipe) propertyId: string, @Body() dto: CreateLoteDto) {
    return this.createLote.execute({ ...dto, propertyId });
  }

  @Get('properties/:propertyId/lotes')
  async list(@Param('propertyId', ParseUUIDPipe) propertyId: string) {
    return this.listLotes.execute(propertyId);
  }

  @Patch('lotes/:id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLoteDto) {
    return this.updateLote.execute({ ...dto, loteId: id });
  }
}
