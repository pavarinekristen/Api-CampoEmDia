export type UserRole =
  | 'PROFISSIONAL_PROPRIETARIO'
  | 'GESTOR_EQUIPE'
  | 'TECNICO_CAMPO'
  | 'SUPERVISOR_TECNICO'
  | 'CONSULTOR_PARCEIRO';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  private constructor(
    readonly id: string | undefined,
    readonly tenantId: string,
    readonly name: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly role: UserRole,
    readonly active: boolean,
  ) {}

  static create(params: {
    tenantId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): User {
    if (params.name.trim().length < 2) {
      throw new Error('Nome do usuário é obrigatório.');
    }
    if (!EMAIL_REGEX.test(params.email)) {
      throw new Error('E-mail inválido.');
    }
    return new User(
      undefined,
      params.tenantId,
      params.name.trim(),
      params.email.toLowerCase().trim(),
      params.passwordHash,
      params.role,
      true,
    );
  }

  static fromPersistence(row: {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    active: boolean;
  }): User & { id: string } {
    return Object.assign(
      new User(row.id, row.tenantId, row.name, row.email, row.passwordHash, row.role, row.active),
      { id: row.id },
    );
  }

  update(patch: { name?: string; role?: UserRole }): User {
    const name = patch.name?.trim();
    if (name !== undefined && name.length < 2) {
      throw new Error('Nome do usuário é obrigatório.');
    }
    return new User(
      this.id,
      this.tenantId,
      name ?? this.name,
      this.email,
      this.passwordHash,
      patch.role ?? this.role,
      this.active,
    );
  }

  deactivate(): User {
    if (!this.active) {
      throw new Error('Usuário já está inativo.');
    }
    return new User(this.id, this.tenantId, this.name, this.email, this.passwordHash, this.role, false);
  }

  /**
   * Nunca serialize a entidade `User` direto numa resposta HTTP — ela
   * carrega `passwordHash`. Toda camada `interface/` deve passar a
   * resposta por aqui antes de retornar ao cliente.
   */
  toPublic(): { id?: string; tenantId: string; name: string; email: string; role: UserRole; active: boolean } {
    return { id: this.id, tenantId: this.tenantId, name: this.name, email: this.email, role: this.role, active: this.active };
  }
}
