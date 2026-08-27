import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { StorageService } from '../../../infra/storage/storage.service';

@ApiTags('Relatórios')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get('by-visit/:visitId')
  async statusByVisit(@Param('visitId', ParseUUIDPipe) visitId: string) {
    const report = await this.prisma.report.findUnique({ where: { visitId } });
    if (!report) {
      throw new NotFoundException('Relatório ainda não solicitado para esta visita.');
    }

    const shareUrl =
      report.status === 'PRONTO' && report.storageKey
        ? await this.storage.createDownloadUrl(report.storageKey, 3600)
        : null;

    return { status: report.status, shareUrl };
  }
}
