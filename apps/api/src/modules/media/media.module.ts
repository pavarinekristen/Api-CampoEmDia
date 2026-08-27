import { Module } from '@nestjs/common';
import { MediaController } from './interface/media.controller';
import { CreateUploadUrlUseCase } from './application/create-upload-url.use-case';

@Module({
  controllers: [MediaController],
  providers: [CreateUploadUrlUseCase],
})
export class MediaModule {}
