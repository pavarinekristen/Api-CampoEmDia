import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { SyncPushUseCase } from '../application/sync-push.use-case';
import { SyncPullUseCase } from '../application/sync-pull.use-case';
import { SyncPushDto } from './dto/sync-push.dto';

@ApiTags('Sincronização offline')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncPush: SyncPushUseCase,
    private readonly syncPull: SyncPullUseCase,
  ) {}

  @Post('push')
  async push(@Body() dto: SyncPushDto) {
    const results = await this.syncPush.execute(dto.operations);
    return { results };
  }

  @Get('pull')
  async pull(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.syncPull.execute({ cursor, limit: limit ? Number(limit) : 200 });
  }
}
