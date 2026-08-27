import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

/**
 * Cobre o motor de campos customizáveis + o módulo de veterinária (ver
 * plano: "Motor de Campos Customizáveis + Módulo de Veterinária").
 * Mesmos requisitos de infraestrutura dos demais e2e: `npm run dev:infra`
 * + migrações aplicadas.
 *
 * IMPORTANTE: os testes rodam em ordem e compartilham o mesmo tenant —
 * "cria um campo customizado obrigatório..." precisa vir por ÚLTIMO entre
 * os que cadastram animal, porque a partir dali todo POST /animals sem
 * `escore_corporal` passa a ser rejeitado (é justamente o comportamento
 * sendo testado).
 */
describe('Campos customizáveis + Veterinária (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let propertyId: string;

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const ownerEmail = `vet+${randomUUID()}@campoemdia.test`;
    await request(app.getHttpServer()).post('/auth/register').send({
      tenantType: 'AUTONOMO',
      tenantName: 'Clínica Veterinária Piloto',
      ownerName: 'Veterinário Piloto',
      ownerEmail,
      ownerPassword: 'senha-forte-123',
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ownerEmail, password: 'senha-forte-123' });
    accessToken = login.body.accessToken;

    const client = await request(app.getHttpServer()).post('/clients').set(auth()).send({ name: 'Fazenda do Zé' });
    const property = await request(app.getHttpServer())
      .post('/properties')
      .set(auth())
      .send({ clientId: client.body.id, name: 'Sede' });
    propertyId = property.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('não permite dois animais com a mesma identificação na mesma propriedade', async () => {
    await request(app.getHttpServer())
      .post(`/properties/${propertyId}/animals`)
      .set(auth())
      .send({ identifier: 'DUPLICADO', species: 'Bovino' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/properties/${propertyId}/animals`)
      .set(auth())
      .send({ identifier: 'DUPLICADO', species: 'Bovino' })
      .expect(409);
  });

  it('cria evento sanitário com vencimento próximo e ele aparece em /health-events/upcoming', async () => {
    const animal = await request(app.getHttpServer())
      .post(`/properties/${propertyId}/animals`)
      .set(auth())
      .send({ identifier: 'VAC-001', species: 'Bovino' })
      .expect(201);

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 5);

    await request(app.getHttpServer())
      .post(`/animals/${animal.body.id}/health-events`)
      .set(auth())
      .send({
        type: 'VACINACAO',
        description: 'Vacina febre aftosa',
        appliedAt: new Date().toISOString(),
        nextDueDate: nextDueDate.toISOString(),
      })
      .expect(201);

    const upcoming = await request(app.getHttpServer())
      .get('/health-events/upcoming?withinDays=30')
      .set(auth())
      .expect(200);

    expect(upcoming.body.some((e: { animalId: string }) => e.animalId === animal.body.id)).toBe(true);
  });

  it('aplica o template de especialidade de veterinária e cria os campos padrão', async () => {
    const result = await request(app.getHttpServer())
      .post('/custom-fields/apply-template/VETERINARIA')
      .set(auth())
      .expect(201);

    expect(result.body.totalInTemplate).toBeGreaterThan(0);

    const fields = await request(app.getHttpServer())
      .get('/custom-fields?entityType=ANIMAL')
      .set(auth())
      .expect(200);

    expect(fields.body.some((f: { key: string }) => f.key === 'categoria_reprodutiva')).toBe(true);
  });

  it('exporta os animais da propriedade em CSV', async () => {
    const response = await request(app.getHttpServer())
      .get(`/properties/${propertyId}/animals/export.csv`)
      .set(auth())
      .expect(200);

    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.text).toContain('identifier');
  });

  it('cria um campo customizado obrigatório pra ANIMAL e passa a exigi-lo em todo cadastro novo', async () => {
    await request(app.getHttpServer())
      .post('/custom-fields')
      .set(auth())
      .send({ entityType: 'ANIMAL', key: 'idade_estimada_meses', label: 'Idade estimada (meses)', fieldType: 'NUMERO', required: true })
      .expect(201);

    // Sem o campo obrigatório → 400
    await request(app.getHttpServer())
      .post(`/properties/${propertyId}/animals`)
      .set(auth())
      .send({ identifier: 'REQ-001', species: 'Bovino' })
      .expect(400);

    // Com o campo obrigatório → 201
    const animal = await request(app.getHttpServer())
      .post(`/properties/${propertyId}/animals`)
      .set(auth())
      .send({ identifier: 'REQ-001', species: 'Bovino', customFields: { idade_estimada_meses: 18 } })
      .expect(201);

    expect(animal.body.customFields).toEqual({ idade_estimada_meses: 18 });

    // Chave desconhecida → 400
    await request(app.getHttpServer())
      .post(`/properties/${propertyId}/animals`)
      .set(auth())
      .send({ identifier: 'REQ-002', species: 'Bovino', customFields: { idade_estimada_meses: 12, campo_que_nao_existe: 'x' } })
      .expect(400);
  });
});
