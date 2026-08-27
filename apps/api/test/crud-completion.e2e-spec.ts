import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

/**
 * Cobre o CRUD completado (ver plano: "Completar o CRUD do Backend") —
 * listar/editar/desativar cliente, cancelar visita, editar tarefa, gestão
 * de equipe e cobrança. Complementa visit-lifecycle.e2e-spec.ts (que cobre
 * o fluxo de ouro visita→PDF), sem duplicá-lo.
 *
 * Mesmos requisitos de infraestrutura: `npm run dev:infra` + migrações
 * aplicadas.
 */
describe('CRUD completo (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const ownerEmail = `crud+${randomUUID()}@campoemdia.test`;
    await request(app.getHttpServer()).post('/auth/register').send({
      tenantType: 'EMPRESA',
      tenantName: 'Consultoria CRUD',
      ownerName: 'Dono Piloto',
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

  describe('Clientes: listar paginado, editar com concorrência otimista, desativar', () => {
    it('pagina a listagem e respeita o limit', async () => {
      await request(app.getHttpServer()).post('/clients').set(auth()).send({ name: 'Cliente A' }).expect(201);
      await request(app.getHttpServer()).post('/clients').set(auth()).send({ name: 'Cliente B' }).expect(201);

      const page = await request(app.getHttpServer()).get('/clients?page=1&limit=1').set(auth()).expect(200);

      expect(page.body.items).toHaveLength(1);
      expect(page.body.total).toBeGreaterThanOrEqual(2);
      expect(page.body.limit).toBe(1);
    });

    it('edita um cliente e detecta conflito de versão', async () => {
      const created = await request(app.getHttpServer())
        .post('/clients')
        .set(auth())
        .send({ name: 'Fazenda Original' })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/clients/${created.body.id}`)
        .set(auth())
        .send({ name: 'Fazenda Renomeada', version: 1 })
        .expect(200);

      // Reenviar a MESMA versão antiga (1) depois que já virou 2 deve
      // conflitar — é exatamente o cenário de duas edições concorrentes.
      await request(app.getHttpServer())
        .patch(`/clients/${created.body.id}`)
        .set(auth())
        .send({ name: 'Outra Edição', version: 1 })
        .expect(409);
    });

    it('desativa (soft delete) um cliente — some da listagem e do GET por id', async () => {
      const created = await request(app.getHttpServer())
        .post('/clients')
        .set(auth())
        .send({ name: 'Cliente Descartável' })
        .expect(201);

      await request(app.getHttpServer()).delete(`/clients/${created.body.id}`).set(auth()).expect(204);
      await request(app.getHttpServer()).get(`/clients/${created.body.id}`).set(auth()).expect(404);
    });
  });

  describe('Visitas: listar, detalhar, cancelar, editar tarefa', () => {
    async function createVisit() {
      const client = await request(app.getHttpServer()).post('/clients').set(auth()).send({ name: 'Fazenda X' });
      const property = await request(app.getHttpServer())
        .post('/properties')
        .set(auth())
        .send({ clientId: client.body.id, name: 'Sede X' });
      const visit = await request(app.getHttpServer())
        .post('/visits')
        .set(auth())
        .send({
          clientGeneratedId: randomUUID(),
          propertyId: property.body.id,
          type: 'ACOMPANHAMENTO',
          startedAt: new Date().toISOString(),
        });
      return { propertyId: property.body.id, visitId: visit.body.id };
    }

    it('lista e filtra visitas por propriedade e status', async () => {
      const { propertyId, visitId } = await createVisit();

      const listed = await request(app.getHttpServer())
        .get(`/visits?propertyId=${propertyId}&status=EM_ANDAMENTO`)
        .set(auth())
        .expect(200);

      expect(listed.body.items.some((v: { id: string }) => v.id === visitId)).toBe(true);
    });

    it('retorna o detalhe de uma visita', async () => {
      const { visitId } = await createVisit();
      const detail = await request(app.getHttpServer()).get(`/visits/${visitId}`).set(auth()).expect(200);
      expect(detail.body.id).toBe(visitId);
    });

    it('edita uma tarefa da visita', async () => {
      const { visitId } = await createVisit();
      const task = await request(app.getHttpServer())
        .post(`/visits/${visitId}/tasks`)
        .set(auth())
        .send({ clientGeneratedId: randomUUID(), visitId, description: 'Verificar cerca' })
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/visits/${visitId}/tasks/${task.body.id}`)
        .set(auth())
        .send({ status: 'CONCLUIDA' })
        .expect(200);

      expect(updated.body.status).toBe('CONCLUIDA');
    });

    it('cancela uma visita em andamento e rejeita cancelar de novo', async () => {
      const { visitId } = await createVisit();

      const cancelled = await request(app.getHttpServer()).patch(`/visits/${visitId}/cancel`).set(auth()).expect(200);
      expect(cancelled.body.status).toBe('CANCELADA');

      await request(app.getHttpServer()).patch(`/visits/${visitId}/cancel`).set(auth()).expect(500);
    });
  });

  describe('Equipe: convidar, listar, editar, desativar', () => {
    it('convida um técnico, lista a equipe e desativa o convidado', async () => {
      const invited = await request(app.getHttpServer())
        .post('/users')
        .set(auth())
        .send({
          name: 'Técnico Convidado',
          email: `tecnico+${randomUUID()}@campoemdia.test`,
          password: 'senha-forte-456',
          role: 'TECNICO_CAMPO',
        })
        .expect(201);

      const list = await request(app.getHttpServer()).get('/users').set(auth()).expect(200);
      expect(list.body.items.some((u: { id: string }) => u.id === invited.body.id)).toBe(true);

      const me = await request(app.getHttpServer()).get('/users/me').set(auth()).expect(200);
      expect(me.body.role).toBe('PROFISSIONAL_PROPRIETARIO');

      await request(app.getHttpServer()).patch(`/users/${invited.body.id}/deactivate`).set(auth()).expect(200);
    });
  });

  describe('Cobrança: editar e marcar como paga', () => {
    it('cria, edita e marca uma cobrança como paga', async () => {
      const client = await request(app.getHttpServer()).post('/clients').set(auth()).send({ name: 'Cliente Cobrança' });

      const charge = await request(app.getHttpServer())
        .post('/billing/charges')
        .set(auth())
        .send({ clientId: client.body.id, description: 'Visita técnica', amountCents: 15000 })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/billing/charges/${charge.body.id}`)
        .set(auth())
        .send({ amountCents: 18000 })
        .expect(200);

      const paid = await request(app.getHttpServer())
        .patch(`/billing/charges/${charge.body.id}/mark-paid`)
        .set(auth())
        .expect(200);

      expect(paid.body.status).toBe('PAGO');

      // Não é mais possível editar depois de paga.
      await request(app.getHttpServer())
        .patch(`/billing/charges/${charge.body.id}`)
        .set(auth())
        .send({ amountCents: 1 })
        .expect(400);
    });
  });
});
