import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  // Documentação interativa para testar a API manualmente durante o
  // desenvolvimento (fluxo: POST /auth/register → /auth/login → clicar em
  // "Authorize" com o accessToken → testar os demais endpoints).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Campo em Dia — API')
    .setDescription(
      'Plataforma de assistência técnica rural. Fluxo mínimo: registre um tenant em /auth/register, ' +
        'faça login em /auth/login e use o accessToken retornado no botão "Authorize" abaixo.',
    )
    .setVersion('0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = process.env.PORT ? Number(process.env.PORT) : 3333;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[campo-em-dia-api] listening on :${port}`);
  // eslint-disable-next-line no-console
  console.log(`[campo-em-dia-api] swagger docs at :${port}/docs`);
}

bootstrap();
