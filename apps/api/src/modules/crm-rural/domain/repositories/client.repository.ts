import { Client } from '../entities/client.entity';

export interface ClientRepository {
  create(client: Client): Promise<Client & { id: string }>;
  findById(id: string): Promise<(Client & { id: string }) | null>;
  findAll(): Promise<Array<Client & { id: string }>>;
}

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');
