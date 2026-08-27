-- CreateEnum
CREATE TYPE "CustomFieldEntityType" AS ENUM ('CLIENT', 'PROPERTY', 'VISIT', 'ANIMAL');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXTO', 'NUMERO', 'DATA', 'SIM_NAO', 'LISTA', 'LISTA_MULTIPLA');

-- CreateEnum
CREATE TYPE "AnimalSex" AS ENUM ('MACHO', 'FEMEA');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ATIVO', 'VENDIDO', 'MORTO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "HealthEventType" AS ENUM ('VACINACAO', 'MEDICAMENTO', 'EXAME', 'PROCEDIMENTO', 'REPRODUCAO');

-- CreateEnum
CREATE TYPE "PregnancyStatus" AS ENUM ('NAO_CONFIRMADA', 'CONFIRMADA', 'PERDIDA');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "customFields" JSONB;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "customFields" JSONB;

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "customFields" JSONB;

-- CreateTable
CREATE TABLE "custom_field_definitions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" "CustomFieldEntityType" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" "CustomFieldType" NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "loteId" TEXT,
    "identifier" TEXT NOT NULL,
    "name" TEXT,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "sex" "AnimalSex",
    "birthDate" TIMESTAMP(3),
    "status" "AnimalStatus" NOT NULL DEFAULT 'ATIVO',
    "statusReason" TEXT,
    "statusAt" TIMESTAMP(3),
    "customFields" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_health_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "visitId" TEXT,
    "type" "HealthEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "productName" TEXT,
    "doseInfo" TEXT,
    "appliedById" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL,
    "withdrawalUntil" TIMESTAMP(3),
    "nextDueDate" TIMESTAMP(3),
    "pregnancyStatus" "PregnancyStatus",
    "expectedBirthDate" TIMESTAMP(3),
    "notes" TEXT,
    "customFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_health_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_field_definitions_tenantId_entityType_idx" ON "custom_field_definitions"("tenantId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definitions_tenantId_entityType_key_key" ON "custom_field_definitions"("tenantId", "entityType", "key");

-- CreateIndex
CREATE INDEX "lotes_tenantId_idx" ON "lotes"("tenantId");

-- CreateIndex
CREATE INDEX "lotes_propertyId_idx" ON "lotes"("propertyId");

-- CreateIndex
CREATE INDEX "animals_tenantId_idx" ON "animals"("tenantId");

-- CreateIndex
CREATE INDEX "animals_propertyId_idx" ON "animals"("propertyId");

-- CreateIndex
CREATE INDEX "animals_loteId_idx" ON "animals"("loteId");

-- CreateIndex
CREATE UNIQUE INDEX "animals_tenantId_propertyId_identifier_key" ON "animals"("tenantId", "propertyId", "identifier");

-- CreateIndex
CREATE INDEX "animal_health_events_tenantId_idx" ON "animal_health_events"("tenantId");

-- CreateIndex
CREATE INDEX "animal_health_events_animalId_idx" ON "animal_health_events"("animalId");

-- CreateIndex
CREATE INDEX "animal_health_events_tenantId_nextDueDate_idx" ON "animal_health_events"("tenantId", "nextDueDate");

-- CreateIndex
CREATE INDEX "animal_health_events_tenantId_withdrawalUntil_idx" ON "animal_health_events"("tenantId", "withdrawalUntil");

-- AddForeignKey
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_health_events" ADD CONSTRAINT "animal_health_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_health_events" ADD CONSTRAINT "animal_health_events_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_health_events" ADD CONSTRAINT "animal_health_events_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_health_events" ADD CONSTRAINT "animal_health_events_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
