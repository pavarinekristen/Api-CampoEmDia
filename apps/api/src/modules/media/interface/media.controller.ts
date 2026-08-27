import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantInterceptor } from '../../../common/interceptors/tenant.interceptor';
import { CreateUploadUrlUseCase } from '../application/create-upload-url.use-case';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';

@ApiTags('Mídia')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('media')
export class MediaController {
  constructor(private readonly createUploadUrl: CreateUploadUrlUseCase) {}

  @Post('upload-url')
  async requestUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.createUploadUrl.execute(dto);
  }
}
