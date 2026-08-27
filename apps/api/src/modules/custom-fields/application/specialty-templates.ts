import { CustomFieldEntityType, CustomFieldType } from '../domain/entities/custom-field-definition.entity';

export type Specialty = 'VETERINARIA' | 'AGRONOMIA' | 'ZOOTECNIA';

export interface SpecialtyTemplateField {
  entityType: CustomFieldEntityType;
  key: string;
  label: string;
  fieldType: CustomFieldType;
  options?: string[];
  required?: boolean;
  order: number;
}

/**
 * Ponto de partida editável — não a lista definitiva de campos "certos"
 * por profissão. O tenant recebe isto como seed (via POST
 * /custom-fields/apply-template/:specialty) e edita/remove/adiciona à
 * vontade depois. Curadoria completa do conteúdo é trabalho de produto,
 * não desta implementação (ver plano).
 *
 * Deliberadamente não duplica campos que já existem como coluna própria em
 * Animal (identifier, name, species, breed, sex, birthDate, status).
 */
export const SPECIALTY_TEMPLATES: Record<Specialty, SpecialtyTemplateField[]> = {
  VETERINARIA: [
    { entityType: 'ANIMAL', key: 'escore_corporal', label: 'Escore corporal (1-5)', fieldType: 'NUMERO', order: 1 },
    { entityType: 'ANIMAL', key: 'ultima_vermifugacao', label: 'Última vermifugação', fieldType: 'DATA', order: 2 },
    {
      entityType: 'ANIMAL',
      key: 'categoria_reprodutiva',
      label: 'Categoria reprodutiva',
      fieldType: 'LISTA',
      options: ['Bezerro(a)', 'Novilha(o)', 'Vaca', 'Touro', 'Descarte'],
      order: 3,
    },
    { entityType: 'ANIMAL', key: 'observacoes_clinicas', label: 'Observações clínicas', fieldType: 'TEXTO', order: 4 },
  ],
  AGRONOMIA: [
    {
      entityType: 'PROPERTY',
      key: 'tipo_solo',
      label: 'Tipo de solo',
      fieldType: 'LISTA',
      options: ['Arenoso', 'Argiloso', 'Misto'],
      order: 1,
    },
    { entityType: 'PROPERTY', key: 'ph_solo', label: 'pH do solo', fieldType: 'NUMERO', order: 2 },
    { entityType: 'PROPERTY', key: 'ultima_calagem', label: 'Última calagem', fieldType: 'DATA', order: 3 },
    { entityType: 'PROPERTY', key: 'area_hectares', label: 'Área (hectares)', fieldType: 'NUMERO', order: 4 },
  ],
  ZOOTECNIA: [
    { entityType: 'ANIMAL', key: 'peso_atual_kg', label: 'Peso atual (kg)', fieldType: 'NUMERO', order: 1 },
    { entityType: 'ANIMAL', key: 'ganho_medio_diario_kg', label: 'Ganho médio diário (kg)', fieldType: 'NUMERO', order: 2 },
    {
      entityType: 'ANIMAL',
      key: 'categoria_zootecnica',
      label: 'Categoria zootécnica',
      fieldType: 'LISTA',
      options: ['Cria', 'Recria', 'Engorda'],
      order: 3,
    },
    { entityType: 'ANIMAL', key: 'ultima_pesagem', label: 'Data da última pesagem', fieldType: 'DATA', order: 4 },
  ],
};
