import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

/**
 * E2E do fluxo de ouro do produto (ver plano arquitetural, seção
 * Estratégia de Testes): cadastrar propriedade → iniciar visita →
 * registrar evidência → criar tarefa → encerrar visita → relatório é
 * enfileirado para geração.
 *
 * Deliberadamente o ÚNICO teste e2e do MVP — cobertura ampla de e2e é
 * cara e lenta; o resto da confiança vem dos testes unitários de
 * use-case (ver tenant-scoping.spec.ts e start-visit.use-case.spec.ts).
 *
 * Requer a infraestrutura local no ar: `npm run dev:infra` (Postgres,
 * Redis, MinIO) e migrações aplicadas (`npm run prisma:migrate:deploy`).
 * Em CI, o pipeline substitui isso por service containers efêmeros.
 */
describe('Fluxo completo de visita (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const ownerEmail = `piloto+${randomUUID()}@campoemdia.test`;
    await request(app.getHttpServer()).post('/auth/register').send({
      tenantType: 'AUTONOMO',
      tenantName: 'Consultoria Piloto',
      ownerName: 'Técnico Piloto',
      ownerEmail,
      ownerPassword: 'senha-forte-123',
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ownerEmail, password: 'senha-forte-123' });
    accessToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('cadastra propriedade, executa a visita completa e enfileira o relatório', async () => {
    const auth = () => ({ Authorization: `Bearer ${accessToken}` });

    const client = await request(app.getHttpServer())
      .post('/clients')
      .set(auth())
      .send({ name: 'Fazenda Boa Vista' })
      .expect(201);

    const property = await request(app.getHttpServer())
      .post('/properties')
      .set(auth())
      .send({ clientId: client.body.id, name: 'Sede' })
      .expect(201);

    const visit = await request(app.getHttpServer())
      .post('/visits')
      .set(auth())
      .send({
        clientGeneratedId: randomUUID(),
        propertyId: property.body.id,
        type: 'ACOMPANHAMENTO',
        startedAt: new Date().toISOString(),
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/visits/${visit.body.id}/evidences`)
      .set(auth())
      .send({ clientGeneratedId: randomUUID(), visitId: visit.body.id, type: 'TEXTO', note: 'Pastagem em bom estado.' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/visits/${visit.body.id}/tasks`)
      .set(auth())
      .send({ clientGeneratedId: randomUUID(), visitId: visit.body.id, description: 'Aplicar calcário no talhão 2' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/visits/${visit.body.id}/end`)
      .set(auth())
      .send({ endedAt: new Date().toISOString(), summary: 'Visita concluída sem pendências críticas.' })
      .expect(200);

    // O PDF é gerado de forma assíncrona (worker) — aqui validamos apenas
    // que o relatório foi corretamente colocado em processamento, não que
    // o PDF já existe (isso seria escopo do worker rodando).
    const report = await request(app.getHttpServer())
      .get(`/reports/by-visit/${visit.body.id}`)
      .set(auth())
      .expect(200);

    expect(['PENDENTE', 'PROCESSANDO', 'PRONTO']).toContain(report.body.status);
  });
});
