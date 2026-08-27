import { Property } from '../entities/property.entity';

export interface PropertyRepository {
  create(property: Property): Promise<Property & { id: string }>;
  findById(id: string): Promise<(Property & { id: string }) | null>;
  findByClientId(clientId: string): Promise<Array<Property & { id: string }>>;
}

export const PROPERTY_REPOSITORY = Symbol('PROPERTY_REPOSITORY');
